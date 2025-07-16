from sqlalchemy import Column, String, Float, DateTime, Text, Integer, Boolean, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime

from app.core.database import Base

class Prediction(Base):
    """Prediction model for storing ML predictions"""
    
    __tablename__ = "predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    risk_score = Column(Float, nullable=False)
    confidence_interval_lower = Column(Float, nullable=True)
    confidence_interval_upper = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=False)  # Low, Medium, High
    feature_importance = Column(JSON, nullable=True)
    input_features = Column(JSON, nullable=False)
    recommendations = Column(JSON, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    model_performance = relationship("ModelPerformance", back_populates="predictions")
    batch_predictions = relationship("BatchPrediction", back_populates="predictions")


class ModelPerformance(Base):
    """Model performance metrics"""
    
    __tablename__ = "model_performance"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    auc_roc = Column(Float, nullable=True)
    auc_pr = Column(Float, nullable=True)
    avg_prediction_time_ms = Column(Float, nullable=True)
    total_predictions = Column(Integer, default=0)
    correct_predictions = Column(Integer, default=0)
    evaluation_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    predictions = relationship("Prediction", back_populates="model_performance")


class BatchPrediction(Base):
    """Batch prediction tracking"""
    
    __tablename__ = "batch_predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(String(100), nullable=False, unique=True)
    status = Column(String(20), nullable=False, default="pending")  # pending, processing, completed, failed
    total_records = Column(Integer, nullable=False)
    processed_records = Column(Integer, default=0)
    failed_records = Column(Integer, default=0)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    predictions = relationship("Prediction", back_populates="batch_predictions")


class PredictionAudit(Base):
    """Audit trail for predictions"""
    
    __tablename__ = "prediction_audit"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("predictions.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(50), nullable=False)  # created, viewed, updated, deleted
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModelRegistry(Base):
    """Registry of available ML models"""
    
    __tablename__ = "model_registry"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    version = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    model_type = Column(String(50), nullable=False)  # classification, regression
    framework = Column(String(50), nullable=False)  # sklearn, xgboost, lightgbm
    model_path = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    features = Column(JSON, nullable=False)  # List of required features
    hyperparameters = Column(JSON, nullable=True)
    training_data_info = Column(JSON, nullable=True)
    validation_metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PredictionFeedback(Base):
    """Feedback on predictions for model improvement"""
    
    __tablename__ = "prediction_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("predictions.id"), nullable=False)
    actual_outcome = Column(Boolean, nullable=True)  # True if readmitted, False if not
    feedback_score = Column(Integer, nullable=True)  # 1-5 rating
    feedback_text = Column(Text, nullable=True)
    provided_by = Column(UUID(as_uuid=True), nullable=True)
    feedback_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FeatureImportance(Base):
    """Feature importance scores for explainability"""
    
    __tablename__ = "feature_importance"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("predictions.id"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    importance_score = Column(Float, nullable=False)
    feature_value = Column(Float, nullable=True)
    contribution = Column(Float, nullable=True)  # SHAP value or similar
    created_at = Column(DateTime(timezone=True), server_default=func.now())