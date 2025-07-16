# Hospital Readmission Prediction API

A comprehensive FastAPI-based ML prediction system for hospital readmission risk assessment with real-time predictions, batch processing, and performance monitoring.

## Features

### Core ML Prediction Features
- **Real-time prediction API** - Generate instant predictions for patient readmission risk
- **Multiple ML model support** - XGBoost, LightGBM, Random Forest, and Logistic Regression
- **Prediction history tracking** - Complete audit trail of all predictions
- **Batch prediction capability** - Process multiple predictions asynchronously
- **Performance monitoring** - Track model performance and processing times
- **Model comparison tools** - Compare different models and get recommendations

### Advanced Features
- **Async prediction processing** - Non-blocking predictions using FastAPI's async capabilities
- **Result caching** - Redis-based caching for improved performance
- **Prediction confidence intervals** - Statistical confidence measures for predictions
- **Feature importance explanation** - Explainable AI with feature contribution analysis
- **Model performance tracking** - Real-time monitoring of model accuracy and speed
- **Comprehensive audit trail** - Full tracking of prediction lifecycle

## API Endpoints

### Prediction Endpoints
- `POST /api/v1/predictions/` - Generate ML prediction for patient
- `GET /api/v1/predictions/{id}` - Get prediction details with confidence
- `GET /api/v1/predictions/patient/{id}` - Get patient prediction history
- `POST /api/v1/predictions/batch` - Submit batch prediction job
- `GET /api/v1/predictions/batch/{batch_id}` - Get batch prediction status

### Model Management
- `GET /api/v1/predictions/models/performance` - Model performance metrics
- `GET /api/v1/predictions/models/performance?model_name={model}` - Specific model metrics

### System Health
- `GET /health` - System health check
- `GET /` - API information

## Installation

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Redis 6+

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hos_readd
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb hospital_readmission
   
   # Run migrations (if using Alembic)
   alembic upgrade head
   ```

6. **Start Redis**
   ```bash
   redis-server
   ```

7. **Create model directory**
   ```bash
   mkdir models
   ```

## Running the Application

### Development Mode
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker (Optional)
```bash
docker-compose up -d
```

## Usage Examples

### Single Prediction
```python
import requests
import json

# Example patient data
patient_data = {
    "patient_id": "123e4567-e89b-12d3-a456-426614174000",
    "features": {
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
    },
    "model_name": "xgboost",
    "include_feature_importance": true,
    "include_recommendations": true
}

response = requests.post(
    "http://localhost:8000/api/v1/predictions/",
    json=patient_data
)

prediction = response.json()
print(f"Risk Score: {prediction['risk_score']}")
print(f"Risk Level: {prediction['risk_level']}")
print(f"Recommendations: {prediction['recommendations']}")
```

### Batch Processing
```python
import requests

batch_data = {
    "predictions": [
        {
            "patient_id": "123e4567-e89b-12d3-a456-426614174000",
            "features": { ... },  # Patient features
            "include_feature_importance": true
        },
        {
            "patient_id": "987fcdeb-51a2-43d1-9f12-123456789abc",
            "features": { ... },  # Patient features
            "include_feature_importance": true
        }
    ],
    "model_name": "xgboost",
    "priority": "high"
}

# Submit batch job
response = requests.post(
    "http://localhost:8000/api/v1/predictions/batch",
    json=batch_data
)

batch_info = response.json()
batch_id = batch_info['batch_id']

# Check batch status
status_response = requests.get(
    f"http://localhost:8000/api/v1/predictions/batch/{batch_id}"
)

batch_status = status_response.json()
print(f"Status: {batch_status['status']}")
print(f"Progress: {batch_status['processed_records']}/{batch_status['total_records']}")
```

### Model Performance
```python
import requests

# Get all model performance metrics
response = requests.get(
    "http://localhost:8000/api/v1/predictions/models/performance"
)

performance = response.json()
print(f"Recommended model: {performance['recommended_model']}")

for model in performance['models']:
    print(f"Model: {model['model_name']}")
    print(f"  Accuracy: {model['accuracy']:.3f}")
    print(f"  F1 Score: {model['f1_score']:.3f}")
    print(f"  Avg Processing Time: {model['avg_prediction_time_ms']:.1f}ms")
```

## API Response Format

### Prediction Response
```json
{
  "prediction_id": "uuid",
  "patient_id": "uuid",
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
    "Schedule follow-up appointment within 7 days",
    "Consider enhanced discharge planning"
  ],
  "processing_time_ms": 45,
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Input Validation

The API validates all 55 required patient features including:

### Demographics
- Age (0-150 years)
- Gender
- Race

### Medical History
- Admission type, source, and disposition
- Length of stay
- Number of lab procedures, medications, procedures
- Previous outpatient, emergency, and inpatient visits

### Diagnoses
- Primary, secondary, and additional diagnoses
- Total number of diagnoses

### Medications
- 25+ different medication fields
- Medication changes and diabetes medications

### Lab Results
- Glucose serum levels
- A1C test results

## Performance Features

### Caching Strategy
- **Prediction caching** - Cache identical predictions to avoid recomputation
- **Patient history caching** - Cache patient prediction history
- **Model performance caching** - Cache model metrics
- **Configurable TTL** - Customizable cache expiration times

### Async Processing
- **Non-blocking predictions** - Uses FastAPI's async capabilities
- **Background tasks** - Audit logging and cache management
- **Batch processing** - Asynchronous batch prediction processing
- **Thread pool execution** - ML model predictions in separate threads

### Database Optimization
- **Async database operations** - Using SQLAlchemy async
- **Connection pooling** - Efficient database connection management
- **Indexed queries** - Optimized database queries
- **Batch operations** - Efficient bulk data operations

## Security Features

### Input Validation
- **Pydantic validation** - Comprehensive input validation
- **Range checks** - Numeric value range validation
- **Required field validation** - Ensure all required fields are present
- **Data type validation** - Strict data type checking

### Audit Trail
- **Complete audit logging** - Track all prediction activities
- **User tracking** - Track prediction requests by user
- **Action logging** - Log all CRUD operations
- **Timestamp tracking** - Complete temporal audit trail

## Monitoring and Observability

### Performance Metrics
- **Response times** - Track API response times
- **Model processing times** - Monitor ML model performance
- **Cache hit rates** - Monitor caching effectiveness
- **Error rates** - Track system errors and failures

### Health Checks
- **System health** - Overall system status
- **Database connectivity** - Database connection status
- **Redis connectivity** - Cache system status
- **Model availability** - ML model loading status

## Configuration

### Environment Variables
All configuration is managed through environment variables:

```bash
# Application
DEBUG=false
APP_NAME="Hospital Readmission Prediction API"

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Models
MODEL_PATH=models/
DEFAULT_MODEL=xgboost

# Security
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### Model Configuration
- **Multiple model support** - Support for various ML frameworks
- **Model versioning** - Track different model versions
- **Default model selection** - Configurable default model
- **Feature validation** - Ensure model compatibility

## Development

### Project Structure
```
app/
├── main.py                 # FastAPI application
├── core/
│   ├── config.py          # Configuration management
│   ├── database.py        # Database configuration
│   └── cache.py           # Redis cache configuration
├── models/
│   └── prediction.py      # SQLAlchemy models
├── schemas/
│   └── prediction.py      # Pydantic schemas
├── services/
│   └── ml_service.py      # ML service logic
└── routers/
    └── predictions.py     # API endpoints
```

### Adding New Models
1. Add model configuration in `MLService._load_models()`
2. Update `AVAILABLE_MODELS` in configuration
3. Add model-specific preprocessing if needed
4. Update feature importance calculation

### Testing
```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_predictions.py::test_create_prediction
```

## Production Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hospital-readmission-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hospital-readmission-api
  template:
    metadata:
      labels:
        app: hospital-readmission-api
    spec:
      containers:
      - name: api
        image: hospital-readmission-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

### Performance Tuning
- **Worker processes** - Configure multiple Uvicorn workers
- **Database connections** - Optimize connection pool size
- **Redis configuration** - Tune Redis memory and persistence
- **Model loading** - Optimize model initialization

## Troubleshooting

### Common Issues
1. **Database connection errors** - Check PostgreSQL configuration
2. **Redis connection errors** - Verify Redis is running
3. **Model loading failures** - Check model file paths
4. **Memory issues** - Monitor ML model memory usage

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run with debug
uvicorn app.main:app --reload --log-level debug
```

### Performance Issues
- Check cache hit rates in logs
- Monitor database query performance
- Profile ML model prediction times
- Review API response times

## API Documentation

When running the application, interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
