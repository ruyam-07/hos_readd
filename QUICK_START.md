# Quick Start Guide - Hospital Readmission Prediction API

This guide will help you get the Hospital Readmission Prediction API up and running quickly.

## Prerequisites

- Python 3.8+
- PostgreSQL (optional, can use SQLite for testing)
- Redis (optional for caching)

## 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd hos_readd

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir models logs
```

## 2. Configuration

```bash
# Copy environment configuration
cp .env.example .env

# Edit .env file with your settings (optional)
nano .env
```

## 3. Quick Start (SQLite + No Redis)

For testing without external dependencies:

```bash
# Start the application
python start.py --reload --debug

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 4. Full Setup (PostgreSQL + Redis)

### Start PostgreSQL and Redis:

```bash
# PostgreSQL
sudo systemctl start postgresql
createdb hospital_readmission

# Redis
sudo systemctl start redis
```

### Or using Docker:

```bash
# Start services
docker-compose up -d db redis

# Start application
python start.py --reload --debug
```

## 5. Test the API

### Health Check:
```bash
curl http://localhost:8000/health
```

### Make a Prediction:
```bash
curl -X POST "http://localhost:8000/api/v1/predictions/" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Get Model Performance:
```bash
curl http://localhost:8000/api/v1/predictions/models/performance
```

## 6. API Documentation

Visit these URLs in your browser:

- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 7. Common Commands

### Development Mode:
```bash
python start.py --reload --debug --log-level debug
```

### Production Mode:
```bash
python start.py --workers 4 --log-level info
```

### Run Tests:
```bash
pytest tests/
```

### Using Docker:
```bash
# Build and run everything
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 8. Example Python Client

```python
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

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
    "include_feature_importance": True,
    "include_recommendations": True
}

# Make prediction
response = requests.post(f"{API_BASE}/predictions/", json=patient_data)
prediction = response.json()

print(f"Risk Score: {prediction['risk_score']:.3f}")
print(f"Risk Level: {prediction['risk_level']}")
print(f"Model Used: {prediction['model_used']}")
print(f"Processing Time: {prediction['processing_time_ms']}ms")

# Get recommendations
if prediction['recommendations']:
    print("\nRecommendations:")
    for rec in prediction['recommendations']:
        print(f"- {rec}")

# Get feature importance
if prediction['feature_importance']:
    print("\nTop Important Features:")
    for feat in prediction['feature_importance'][:5]:
        print(f"- {feat['feature_name']}: {feat['importance_score']:.3f}")
```

## 9. Troubleshooting

### Database Issues:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -l | grep hospital_readmission
```

### Redis Issues:
```bash
# Check Redis is running
sudo systemctl status redis

# Test Redis connection
redis-cli ping
```

### Application Issues:
```bash
# Check logs
tail -f logs/app.log

# Run with debug
python start.py --debug --log-level debug
```

### Common Errors:

1. **Database connection error**: Check PostgreSQL is running and credentials are correct
2. **Redis connection error**: Check Redis is running or disable caching
3. **Model not found**: Ensure models directory exists and models are loaded
4. **Port already in use**: Change port with `--port 8001`

## 10. Next Steps

1. **Add real ML models**: Train and save actual models in the `models/` directory
2. **Configure production database**: Set up PostgreSQL with proper credentials
3. **Set up monitoring**: Add logging and monitoring tools
4. **Scale**: Use multiple workers and load balancing
5. **Security**: Add authentication and authorization
6. **Testing**: Run comprehensive tests with `pytest`

## Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Review the full README.md for detailed documentation
3. Check the API documentation at `/docs`
4. Run tests to verify functionality

Happy predicting! 🏥📊