from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from uuid import UUID
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class PredictionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ModelType(str, Enum):
    XGBOOST = "xgboost"
    LIGHTGBM = "lightgbm"
    RANDOM_FOREST = "random_forest"
    LOGISTIC_REGRESSION = "logistic_regression"

# Input validation schemas
class PatientFeatures(BaseModel):
    """Patient features for prediction"""
    
    # Demographics
    age: float = Field(..., ge=0, le=150, description="Patient age in years")
    gender: str = Field(..., description="Patient gender")
    race: Optional[str] = Field(None, description="Patient race")
    weight: Optional[float] = Field(None, ge=0, le=500, description="Patient weight in kg")
    
    # Admission details
    admission_type: int = Field(..., ge=1, le=8, description="Admission type ID")
    discharge_disposition: int = Field(..., ge=1, le=30, description="Discharge disposition ID")
    admission_source: int = Field(..., ge=1, le=26, description="Admission source ID")
    time_in_hospital: int = Field(..., ge=1, le=14, description="Length of stay in days")
    payer_code: Optional[str] = Field(None, description="Payer code")
    medical_specialty: Optional[str] = Field(None, description="Medical specialty")
    
    # Medical procedures and tests
    num_lab_procedures: int = Field(..., ge=0, le=150, description="Number of lab procedures")
    num_procedures: int = Field(..., ge=0, le=10, description="Number of procedures")
    num_medications: int = Field(..., ge=0, le=100, description="Number of medications")
    number_outpatient: int = Field(..., ge=0, le=50, description="Number of outpatient visits")
    number_emergency: int = Field(..., ge=0, le=50, description="Number of emergency visits")
    number_inpatient: int = Field(..., ge=0, le=50, description="Number of inpatient visits")
    
    # Diagnoses
    diag_1: Optional[str] = Field(None, description="Primary diagnosis")
    diag_2: Optional[str] = Field(None, description="Secondary diagnosis")
    diag_3: Optional[str] = Field(None, description="Additional diagnosis")
    number_diagnoses: int = Field(..., ge=1, le=16, description="Number of diagnoses")
    
    # Lab results
    max_glu_serum: Optional[str] = Field(None, description="Max glucose serum level")
    A1Cresult: Optional[str] = Field(None, description="A1C test result")
    
    # Medications
    metformin: Optional[str] = Field(None, description="Metformin medication")
    repaglinide: Optional[str] = Field(None, description="Repaglinide medication")
    nateglinide: Optional[str] = Field(None, description="Nateglinide medication")
    chlorpropamide: Optional[str] = Field(None, description="Chlorpropamide medication")
    glimepiride: Optional[str] = Field(None, description="Glimepiride medication")
    acetohexamide: Optional[str] = Field(None, description="Acetohexamide medication")
    glipizide: Optional[str] = Field(None, description="Glipizide medication")
    glyburide: Optional[str] = Field(None, description="Glyburide medication")
    tolbutamide: Optional[str] = Field(None, description="Tolbutamide medication")
    pioglitazone: Optional[str] = Field(None, description="Pioglitazone medication")
    rosiglitazone: Optional[str] = Field(None, description="Rosiglitazone medication")
    acarbose: Optional[str] = Field(None, description="Acarbose medication")
    miglitol: Optional[str] = Field(None, description="Miglitol medication")
    troglitazone: Optional[str] = Field(None, description="Troglitazone medication")
    tolazamide: Optional[str] = Field(None, description="Tolazamide medication")
    examide: Optional[str] = Field(None, description="Examide medication")
    citoglipton: Optional[str] = Field(None, description="Citoglipton medication")
    insulin: Optional[str] = Field(None, description="Insulin medication")
    
    # Combination medications
    glyburide_metformin: Optional[str] = Field(None, alias="glyburide-metformin")
    glipizide_metformin: Optional[str] = Field(None, alias="glipizide-metformin")
    glimepiride_pioglitazone: Optional[str] = Field(None, alias="glimepiride-pioglitazone")
    metformin_rosiglitazone: Optional[str] = Field(None, alias="metformin-rosiglitazone")
    metformin_pioglitazone: Optional[str] = Field(None, alias="metformin-pioglitazone")
    
    # Treatment changes
    change: Optional[str] = Field(None, description="Change in diabetic medications")
    diabetesMed: Optional[str] = Field(None, description="Diabetic medication prescribed")
    readmitted: Optional[str] = Field(None, description="Readmitted within 30 days")
    
    # Grouped features (engineered features)
    num_medications_grouped: Optional[int] = Field(None, ge=0, le=5)
    diag_1_grouped: Optional[str] = Field(None, description="Grouped primary diagnosis")
    diag_2_grouped: Optional[str] = Field(None, description="Grouped secondary diagnosis")
    diag_3_grouped: Optional[str] = Field(None, description="Grouped additional diagnosis")
    age_grouped: Optional[str] = Field(None, description="Grouped age category")
    admission_type_grouped: Optional[str] = Field(None, description="Grouped admission type")
    discharge_disposition_grouped: Optional[str] = Field(None, description="Grouped discharge disposition")
    admission_source_grouped: Optional[str] = Field(None, description="Grouped admission source")
    
    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
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
                "insulin": "Up",
                "change": "Ch",
                "diabetesMed": "Yes"
            }
        }

class PredictionRequest(BaseModel):
    """Request schema for single prediction"""
    
    patient_id: UUID = Field(..., description="Patient unique identifier")
    features: PatientFeatures = Field(..., description="Patient features")
    model_name: Optional[ModelType] = Field(None, description="Specific model to use")
    include_feature_importance: bool = Field(default=True, description="Include feature importance")
    include_recommendations: bool = Field(default=True, description="Include recommendations")

class BatchPredictionRequest(BaseModel):
    """Request schema for batch prediction"""
    
    predictions: List[PredictionRequest] = Field(..., max_items=1000, description="List of predictions")
    model_name: Optional[ModelType] = Field(None, description="Model to use for all predictions")
    priority: str = Field(default="normal", description="Batch priority")
    
    @validator('predictions')
    def validate_predictions_not_empty(cls, v):
        if not v:
            raise ValueError("Predictions list cannot be empty")
        return v

# Response schemas
class FeatureImportanceItem(BaseModel):
    """Feature importance item"""
    
    feature_name: str
    importance_score: float
    feature_value: Optional[Union[str, float, int]]
    contribution: Optional[float]

class PredictionResponse(BaseModel):
    """Response schema for prediction"""
    
    prediction_id: UUID
    patient_id: UUID
    risk_score: float = Field(..., ge=0, le=1, description="Risk score between 0 and 1")
    confidence_interval: Optional[List[float]] = Field(None, description="Confidence interval [lower, upper]")
    risk_level: RiskLevel
    model_used: str
    model_version: str
    feature_importance: Optional[List[FeatureImportanceItem]] = None
    recommendations: Optional[List[str]] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "prediction_id": "123e4567-e89b-12d3-a456-426614174000",
                "patient_id": "987fcdeb-51a2-43d1-9f12-123456789abc",
                "risk_score": 0.75,
                "confidence_interval": [0.68, 0.82],
                "risk_level": "High",
                "model_used": "xgboost",
                "model_version": "1.0.0",
                "feature_importance": [
                    {
                        "feature_name": "time_in_hospital",
                        "importance_score": 0.15,
                        "feature_value": 7,
                        "contribution": 0.12
                    }
                ],
                "recommendations": [
                    "Consider enhanced discharge planning",
                    "Schedule follow-up within 7 days"
                ],
                "processing_time_ms": 45,
                "created_at": "2024-01-15T10:30:00Z"
            }
        }

class BatchPredictionResponse(BaseModel):
    """Response schema for batch prediction"""
    
    batch_id: str
    status: PredictionStatus
    total_records: int
    processed_records: int
    failed_records: int
    model_name: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    predictions: Optional[List[PredictionResponse]] = None

class ModelPerformanceMetrics(BaseModel):
    """Model performance metrics"""
    
    model_name: str
    model_version: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    auc_roc: Optional[float] = None
    auc_pr: Optional[float] = None
    avg_prediction_time_ms: Optional[float] = None
    total_predictions: int = 0
    correct_predictions: int = 0
    evaluation_date: datetime
    
    class Config:
        orm_mode = True

class ModelComparisonResponse(BaseModel):
    """Response schema for model comparison"""
    
    models: List[ModelPerformanceMetrics]
    comparison_date: datetime
    recommended_model: Optional[str] = None

class PredictionHistoryResponse(BaseModel):
    """Response schema for patient prediction history"""
    
    patient_id: UUID
    total_predictions: int
    predictions: List[PredictionResponse]
    
    class Config:
        orm_mode = True

class ErrorResponse(BaseModel):
    """Error response schema"""
    
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HealthCheckResponse(BaseModel):
    """Health check response"""
    
    status: str
    timestamp: datetime
    service: str
    version: str = "1.0.0"
    models_loaded: List[str] = []
    cache_status: str = "unknown"
    database_status: str = "unknown"