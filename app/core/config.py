from pydantic import BaseSettings, Field
from typing import List, Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Hospital Readmission Prediction API"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost/hospital_readmission",
        env="DATABASE_URL"
    )
    
    # Redis
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    
    # Cache settings
    CACHE_TTL_SECONDS: int = Field(default=3600, env="CACHE_TTL_SECONDS")
    
    # ML Models
    MODEL_PATH: str = Field(default="models/", env="MODEL_PATH")
    DEFAULT_MODEL: str = Field(default="xgboost", env="DEFAULT_MODEL")
    AVAILABLE_MODELS: List[str] = Field(
        default=["xgboost", "lightgbm", "random_forest", "logistic_regression"],
        env="AVAILABLE_MODELS"
    )
    
    # Prediction settings
    PREDICTION_BATCH_SIZE: int = Field(default=100, env="PREDICTION_BATCH_SIZE")
    CONFIDENCE_THRESHOLD: float = Field(default=0.5, env="CONFIDENCE_THRESHOLD")
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-here", env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        env="ALLOWED_ORIGINS"
    )
    
    # Monitoring
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    METRICS_RETENTION_DAYS: int = Field(default=30, env="METRICS_RETENTION_DAYS")
    
    # Feature validation
    REQUIRED_FEATURES: List[str] = Field(
        default=[
            "age", "gender", "admission_type", "discharge_disposition",
            "admission_source", "time_in_hospital", "num_lab_procedures",
            "num_procedures", "num_medications", "number_outpatient",
            "number_emergency", "number_inpatient", "diag_1", "diag_2",
            "diag_3", "number_diagnoses", "max_glu_serum", "A1Cresult",
            "metformin", "repaglinide", "nateglinide", "chlorpropamide",
            "glimepiride", "acetohexamide", "glipizide", "glyburide",
            "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
            "miglitol", "troglitazone", "tolazamide", "examide",
            "citoglipton", "insulin", "glyburide-metformin",
            "glipizide-metformin", "glimepiride-pioglitazone",
            "metformin-rosiglitazone", "metformin-pioglitazone",
            "change", "diabetesMed", "readmitted", "race",
            "weight", "payer_code", "medical_specialty",
            "num_medications_grouped", "diag_1_grouped", "diag_2_grouped",
            "diag_3_grouped", "age_grouped", "admission_type_grouped",
            "discharge_disposition_grouped", "admission_source_grouped"
        ],
        env="REQUIRED_FEATURES"
    )
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()