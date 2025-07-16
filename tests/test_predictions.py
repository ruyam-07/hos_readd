import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid

from app.main import app
from app.core.database import Base, get_db
from app.schemas.prediction import PatientFeatures, PredictionRequest

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the dependency
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Test data
SAMPLE_PATIENT_FEATURES = {
    "age": 65,
    "gender": "Male",
    "race": "Caucasian",
    "admission_type": 1,
    "discharge_disposition": 1,
    "admission_source": 1,
    "time_in_hospital": 3,
    "num_lab_procedures": 25,
    "num_procedures": 1,
    "num_medications": 15,
    "number_outpatient": 0,
    "number_emergency": 0,
    "number_inpatient": 0,
    "diag_1": "250.00",
    "diag_2": "401.9",
    "diag_3": "272.4",
    "number_diagnoses": 9,
    "max_glu_serum": "None",
    "A1Cresult": ">7",
    "metformin": "No",
    "repaglinide": "No",
    "nateglinide": "No",
    "chlorpropamide": "No",
    "glimepiride": "No",
    "acetohexamide": "No",
    "glipizide": "No",
    "glyburide": "No",
    "tolbutamide": "No",
    "pioglitazone": "No",
    "rosiglitazone": "No",
    "acarbose": "No",
    "miglitol": "No",
    "troglitazone": "No",
    "tolazamide": "No",
    "examide": "No",
    "citoglipton": "No",
    "insulin": "Up",
    "glyburide-metformin": "No",
    "glipizide-metformin": "No",
    "glimepiride-pioglitazone": "No",
    "metformin-rosiglitazone": "No",
    "metformin-pioglitazone": "No",
    "change": "Ch",
    "diabetesMed": "Yes",
    "readmitted": "NO"
}

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["service"] == "hospital-readmission-prediction"

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Hospital Readmission Prediction API"
    assert data["version"] == "1.0.0"

def test_create_prediction():
    """Test creating a single prediction"""
    patient_id = str(uuid.uuid4())
    
    prediction_request = {
        "patient_id": patient_id,
        "features": SAMPLE_PATIENT_FEATURES,
        "model_name": "xgboost",
        "include_feature_importance": True,
        "include_recommendations": True
    }
    
    response = client.post("/api/v1/predictions/", json=prediction_request)
    assert response.status_code == 200
    
    data = response.json()
    assert "prediction_id" in data
    assert data["patient_id"] == patient_id
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 1
    assert "confidence_interval" in data
    assert len(data["confidence_interval"]) == 2
    assert data["risk_level"] in ["Low", "Medium", "High"]
    assert data["model_used"] == "xgboost"
    assert "feature_importance" in data
    assert "recommendations" in data
    assert "processing_time_ms" in data

def test_create_prediction_validation_error():
    """Test validation error when creating prediction with invalid data"""
    prediction_request = {
        "patient_id": "invalid-uuid",
        "features": {
            "age": 200,  # Invalid age
            "gender": "Male"
            # Missing required fields
        }
    }
    
    response = client.post("/api/v1/predictions/", json=prediction_request)
    assert response.status_code == 422  # Validation error

def test_get_prediction():
    """Test getting a specific prediction"""
    # First create a prediction
    patient_id = str(uuid.uuid4())
    prediction_request = {
        "patient_id": patient_id,
        "features": SAMPLE_PATIENT_FEATURES,
        "model_name": "xgboost"
    }
    
    create_response = client.post("/api/v1/predictions/", json=prediction_request)
    assert create_response.status_code == 200
    
    prediction_id = create_response.json()["prediction_id"]
    
    # Now get the prediction
    get_response = client.get(f"/api/v1/predictions/{prediction_id}")
    assert get_response.status_code == 200
    
    data = get_response.json()
    assert data["prediction_id"] == prediction_id
    assert data["patient_id"] == patient_id

def test_get_prediction_not_found():
    """Test getting a non-existent prediction"""
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/predictions/{fake_id}")
    assert response.status_code == 404

def test_get_patient_predictions():
    """Test getting prediction history for a patient"""
    patient_id = str(uuid.uuid4())
    
    # Create multiple predictions for the same patient
    for i in range(3):
        prediction_request = {
            "patient_id": patient_id,
            "features": SAMPLE_PATIENT_FEATURES,
            "model_name": "xgboost"
        }
        
        response = client.post("/api/v1/predictions/", json=prediction_request)
        assert response.status_code == 200
    
    # Get patient history
    history_response = client.get(f"/api/v1/predictions/patient/{patient_id}")
    assert history_response.status_code == 200
    
    data = history_response.json()
    assert data["patient_id"] == patient_id
    assert data["total_predictions"] == 3
    assert len(data["predictions"]) == 3

def test_batch_prediction():
    """Test batch prediction processing"""
    batch_request = {
        "predictions": [
            {
                "patient_id": str(uuid.uuid4()),
                "features": SAMPLE_PATIENT_FEATURES,
                "include_feature_importance": True
            },
            {
                "patient_id": str(uuid.uuid4()),
                "features": SAMPLE_PATIENT_FEATURES,
                "include_feature_importance": True
            }
        ],
        "model_name": "xgboost",
        "priority": "normal"
    }
    
    response = client.post("/api/v1/predictions/batch", json=batch_request)
    assert response.status_code == 200
    
    data = response.json()
    assert "batch_id" in data
    assert data["status"] == "pending"
    assert data["total_records"] == 2
    assert data["processed_records"] == 0
    assert data["model_name"] == "xgboost"

def test_get_batch_prediction():
    """Test getting batch prediction status"""
    # Create batch first
    batch_request = {
        "predictions": [
            {
                "patient_id": str(uuid.uuid4()),
                "features": SAMPLE_PATIENT_FEATURES
            }
        ],
        "model_name": "xgboost"
    }
    
    create_response = client.post("/api/v1/predictions/batch", json=batch_request)
    assert create_response.status_code == 200
    
    batch_id = create_response.json()["batch_id"]
    
    # Get batch status
    status_response = client.get(f"/api/v1/predictions/batch/{batch_id}")
    assert status_response.status_code == 200
    
    data = status_response.json()
    assert data["batch_id"] == batch_id
    assert data["status"] in ["pending", "processing", "completed", "failed"]

def test_get_model_performance():
    """Test getting model performance metrics"""
    response = client.get("/api/v1/predictions/models/performance")
    assert response.status_code == 200
    
    data = response.json()
    assert "models" in data
    assert "comparison_date" in data
    assert "recommended_model" in data
    assert len(data["models"]) > 0
    
    # Check first model structure
    model = data["models"][0]
    assert "model_name" in model
    assert "model_version" in model
    assert "accuracy" in model
    assert "precision" in model
    assert "recall" in model
    assert "f1_score" in model

def test_get_specific_model_performance():
    """Test getting performance for a specific model"""
    response = client.get("/api/v1/predictions/models/performance?model_name=xgboost")
    assert response.status_code == 200
    
    data = response.json()
    assert "models" in data
    assert len(data["models"]) == 1
    assert data["models"][0]["model_name"] == "xgboost"
    assert data["recommended_model"] == "xgboost"

def test_patient_features_validation():
    """Test patient features validation"""
    # Test with valid features
    valid_features = PatientFeatures(**SAMPLE_PATIENT_FEATURES)
    assert valid_features.age == 65
    assert valid_features.gender == "Male"
    
    # Test with invalid age
    invalid_features = SAMPLE_PATIENT_FEATURES.copy()
    invalid_features["age"] = 200
    
    with pytest.raises(Exception):  # Should raise validation error
        PatientFeatures(**invalid_features)

def test_batch_prediction_validation():
    """Test batch prediction validation"""
    # Test with empty predictions list
    batch_request = {
        "predictions": [],
        "model_name": "xgboost"
    }
    
    response = client.post("/api/v1/predictions/batch", json=batch_request)
    assert response.status_code == 422  # Validation error

def test_api_error_handling():
    """Test API error handling"""
    # Test invalid endpoint
    response = client.get("/api/v1/nonexistent")
    assert response.status_code == 404
    
    # Test invalid method
    response = client.delete("/api/v1/predictions/")
    assert response.status_code == 405

# Performance tests
def test_prediction_performance():
    """Test prediction performance"""
    import time
    
    patient_id = str(uuid.uuid4())
    prediction_request = {
        "patient_id": patient_id,
        "features": SAMPLE_PATIENT_FEATURES,
        "model_name": "xgboost"
    }
    
    start_time = time.time()
    response = client.post("/api/v1/predictions/", json=prediction_request)
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 2.0  # Should complete within 2 seconds

def test_concurrent_predictions():
    """Test concurrent predictions"""
    import threading
    import time
    
    results = []
    
    def make_prediction():
        patient_id = str(uuid.uuid4())
        prediction_request = {
            "patient_id": patient_id,
            "features": SAMPLE_PATIENT_FEATURES,
            "model_name": "xgboost"
        }
        
        response = client.post("/api/v1/predictions/", json=prediction_request)
        results.append(response.status_code)
    
    # Create multiple threads
    threads = []
    for i in range(5):
        thread = threading.Thread(target=make_prediction)
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Check all predictions succeeded
    assert all(status == 200 for status in results)
    assert len(results) == 5

if __name__ == "__main__":
    pytest.main([__file__])