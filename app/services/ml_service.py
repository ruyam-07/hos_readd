import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime
import hashlib
import json
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor

# ML libraries
import xgboost as xgb
import lightgbm as lgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

from app.core.config import get_settings
from app.schemas.prediction import PatientFeatures, FeatureImportanceItem, RiskLevel

settings = get_settings()
logger = logging.getLogger(__name__)

class MLService:
    """Machine Learning service for hospital readmission prediction"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_versions: Dict[str, str] = {}
        self.model_features: Dict[str, List[str]] = {}
        self.feature_encoders: Dict[str, Dict[str, Any]] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    async def initialize(self):
        """Initialize ML service and load models"""
        logger.info("Initializing ML service...")
        
        # Create model directory if it doesn't exist
        model_path = Path(settings.MODEL_PATH)
        model_path.mkdir(parents=True, exist_ok=True)
        
        # Load available models
        await self._load_models()
        
        # Initialize feature encoders
        await self._initialize_feature_encoders()
        
        logger.info(f"ML service initialized with {len(self.models)} models")
    
    async def _load_models(self):
        """Load all available models"""
        model_configs = {
            "xgboost": {
                "path": f"{settings.MODEL_PATH}/xgboost_model.joblib",
                "class": xgb.XGBClassifier,
                "version": "1.0.0"
            },
            "lightgbm": {
                "path": f"{settings.MODEL_PATH}/lightgbm_model.joblib",
                "class": lgb.LGBMClassifier,
                "version": "1.0.0"
            },
            "random_forest": {
                "path": f"{settings.MODEL_PATH}/random_forest_model.joblib",
                "class": RandomForestClassifier,
                "version": "1.0.0"
            },
            "logistic_regression": {
                "path": f"{settings.MODEL_PATH}/logistic_regression_model.joblib",
                "class": LogisticRegression,
                "version": "1.0.0"
            }
        }
        
        for model_name, config in model_configs.items():
            try:
                if os.path.exists(config["path"]):
                    model = joblib.load(config["path"])
                    self.models[model_name] = model
                    self.model_versions[model_name] = config["version"]
                    logger.info(f"Loaded model: {model_name}")
                else:
                    # Create a dummy model for demonstration
                    model = self._create_dummy_model(model_name, config["class"])
                    self.models[model_name] = model
                    self.model_versions[model_name] = config["version"]
                    logger.warning(f"Created dummy model for: {model_name}")
            except Exception as e:
                logger.error(f"Failed to load model {model_name}: {e}")
    
    def _create_dummy_model(self, model_name: str, model_class):
        """Create a dummy model for demonstration purposes"""
        # This is a placeholder - in production, you'd train actual models
        if model_name == "xgboost":
            model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        elif model_name == "lightgbm":
            model = lgb.LGBMClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        elif model_name == "random_forest":
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        else:
            model = LogisticRegression(
                random_state=42,
                max_iter=1000
            )
        
        # Create dummy training data to fit the model
        dummy_features = self._create_dummy_features()
        dummy_X = pd.DataFrame([dummy_features] * 100)
        dummy_y = np.random.randint(0, 2, 100)
        
        model.fit(dummy_X, dummy_y)
        return model
    
    def _create_dummy_features(self) -> Dict[str, Any]:
        """Create dummy feature data for model initialization"""
        return {
            "age": 65.0,
            "gender": 1,
            "race": 1,
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
            "diag_1": 1,
            "diag_2": 1,
            "diag_3": 1,
            "number_diagnoses": 9,
            "max_glu_serum": 1,
            "A1Cresult": 1,
            "metformin": 0,
            "repaglinide": 0,
            "nateglinide": 0,
            "chlorpropamide": 0,
            "glimepiride": 0,
            "acetohexamide": 0,
            "glipizide": 0,
            "glyburide": 0,
            "tolbutamide": 0,
            "pioglitazone": 0,
            "rosiglitazone": 0,
            "acarbose": 0,
            "miglitol": 0,
            "troglitazone": 0,
            "tolazamide": 0,
            "examide": 0,
            "citoglipton": 0,
            "insulin": 1,
            "glyburide_metformin": 0,
            "glipizide_metformin": 0,
            "glimepiride_pioglitazone": 0,
            "metformin_rosiglitazone": 0,
            "metformin_pioglitazone": 0,
            "change": 1,
            "diabetesMed": 1,
            "readmitted": 0,
            "weight": 0,
            "payer_code": 1,
            "medical_specialty": 1,
            "num_medications_grouped": 3,
            "diag_1_grouped": 1,
            "diag_2_grouped": 1,
            "diag_3_grouped": 1,
            "age_grouped": 1,
            "admission_type_grouped": 1,
            "discharge_disposition_grouped": 1,
            "admission_source_grouped": 1
        }
    
    async def _initialize_feature_encoders(self):
        """Initialize feature encoders for categorical variables"""
        # This would typically be loaded from training data
        # For now, we'll create basic encoders
        categorical_features = [
            "gender", "race", "max_glu_serum", "A1Cresult", "metformin",
            "repaglinide", "nateglinide", "chlorpropamide", "glimepiride",
            "acetohexamide", "glipizide", "glyburide", "tolbutamide",
            "pioglitazone", "rosiglitazone", "acarbose", "miglitol",
            "troglitazone", "tolazamide", "examide", "citoglipton",
            "insulin", "glyburide_metformin", "glipizide_metformin",
            "glimepiride_pioglitazone", "metformin_rosiglitazone",
            "metformin_pioglitazone", "change", "diabetesMed", "readmitted",
            "payer_code", "medical_specialty", "diag_1", "diag_2", "diag_3"
        ]
        
        for feature in categorical_features:
            encoder = LabelEncoder()
            # Fit with common values
            encoder.fit(["No", "Yes", "Up", "Down", "Steady", "None", "Male", "Female"])
            self.feature_encoders[feature] = encoder
    
    async def predict(
        self,
        patient_features: PatientFeatures,
        model_name: Optional[str] = None,
        include_feature_importance: bool = True
    ) -> Dict[str, Any]:
        """Make prediction for a single patient"""
        start_time = datetime.now()
        
        # Use default model if none specified
        if model_name is None:
            model_name = settings.DEFAULT_MODEL
        
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not available")
        
        model = self.models[model_name]
        
        # Preprocess features
        processed_features = await self._preprocess_features(patient_features)
        
        # Make prediction
        prediction_result = await self._run_prediction(
            model, processed_features, model_name, include_feature_importance
        )
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        prediction_result["processing_time_ms"] = int(processing_time)
        prediction_result["model_version"] = self.model_versions[model_name]
        
        return prediction_result
    
    async def _preprocess_features(self, patient_features: PatientFeatures) -> pd.DataFrame:
        """Preprocess patient features for prediction"""
        # Convert to dictionary
        features_dict = patient_features.dict()
        
        # Handle categorical encoding
        for feature, encoder in self.feature_encoders.items():
            if feature in features_dict and features_dict[feature] is not None:
                try:
                    # Convert to string for consistency
                    feature_value = str(features_dict[feature])
                    
                    # Handle unknown categories
                    if feature_value not in encoder.classes_:
                        # Use most common class or default
                        feature_value = encoder.classes_[0]
                    
                    features_dict[feature] = encoder.transform([feature_value])[0]
                except Exception as e:
                    logger.warning(f"Error encoding feature {feature}: {e}")
                    features_dict[feature] = 0
        
        # Handle missing values
        for feature in settings.REQUIRED_FEATURES:
            if feature not in features_dict:
                features_dict[feature] = 0
            elif features_dict[feature] is None:
                features_dict[feature] = 0
        
        # Convert to DataFrame
        feature_df = pd.DataFrame([features_dict])
        
        # Select only required features
        available_features = [f for f in settings.REQUIRED_FEATURES if f in feature_df.columns]
        feature_df = feature_df[available_features]
        
        return feature_df
    
    async def _run_prediction(
        self,
        model: Any,
        features: pd.DataFrame,
        model_name: str,
        include_feature_importance: bool
    ) -> Dict[str, Any]:
        """Run prediction using the specified model"""
        loop = asyncio.get_event_loop()
        
        # Run prediction in thread pool
        prediction_result = await loop.run_in_executor(
            self.executor,
            self._predict_sync,
            model,
            features,
            model_name,
            include_feature_importance
        )
        
        return prediction_result
    
    def _predict_sync(
        self,
        model: Any,
        features: pd.DataFrame,
        model_name: str,
        include_feature_importance: bool
    ) -> Dict[str, Any]:
        """Synchronous prediction function"""
        # Get prediction probabilities
        pred_proba = model.predict_proba(features)
        risk_score = float(pred_proba[0][1])  # Probability of readmission
        
        # Determine risk level
        if risk_score < 0.3:
            risk_level = RiskLevel.LOW
        elif risk_score < 0.7:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.HIGH
        
        # Calculate confidence interval (simplified)
        confidence_lower = max(0.0, risk_score - 0.05)
        confidence_upper = min(1.0, risk_score + 0.05)
        
        result = {
            "risk_score": risk_score,
            "confidence_interval": [confidence_lower, confidence_upper],
            "risk_level": risk_level,
            "model_used": model_name,
            "recommendations": self._generate_recommendations(risk_score, risk_level)
        }
        
        # Add feature importance if requested
        if include_feature_importance:
            result["feature_importance"] = self._calculate_feature_importance(
                model, features, model_name
            )
        
        return result
    
    def _calculate_feature_importance(
        self, model: Any, features: pd.DataFrame, model_name: str
    ) -> List[FeatureImportanceItem]:
        """Calculate feature importance for explainability"""
        try:
            # Get feature importances based on model type
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
            elif hasattr(model, 'coef_'):
                importances = np.abs(model.coef_[0])
            else:
                # Fallback to dummy importance
                importances = np.random.random(len(features.columns))
            
            # Create feature importance items
            feature_importance = []
            for i, feature in enumerate(features.columns):
                if i < len(importances):
                    feature_importance.append(FeatureImportanceItem(
                        feature_name=feature,
                        importance_score=float(importances[i]),
                        feature_value=float(features.iloc[0, i]),
                        contribution=float(importances[i] * features.iloc[0, i])
                    ))
            
            # Sort by importance score
            feature_importance.sort(key=lambda x: x.importance_score, reverse=True)
            
            # Return top 10 features
            return feature_importance[:10]
            
        except Exception as e:
            logger.error(f"Error calculating feature importance: {e}")
            return []
    
    def _generate_recommendations(self, risk_score: float, risk_level: RiskLevel) -> List[str]:
        """Generate recommendations based on risk score"""
        recommendations = []
        
        if risk_level == RiskLevel.HIGH:
            recommendations.extend([
                "Schedule follow-up appointment within 7 days",
                "Consider enhanced discharge planning",
                "Review medication adherence",
                "Assess social support systems",
                "Consider home health services"
            ])
        elif risk_level == RiskLevel.MEDIUM:
            recommendations.extend([
                "Schedule follow-up appointment within 14 days",
                "Review discharge instructions with patient",
                "Monitor for complications",
                "Ensure medication reconciliation"
            ])
        else:
            recommendations.extend([
                "Standard discharge planning",
                "Follow-up as clinically indicated",
                "Patient education on warning signs"
            ])
        
        return recommendations
    
    async def get_model_performance(self, model_name: str) -> Dict[str, Any]:
        """Get performance metrics for a specific model"""
        # This would typically query historical predictions and outcomes
        # For now, return dummy metrics
        return {
            "model_name": model_name,
            "model_version": self.model_versions.get(model_name, "1.0.0"),
            "accuracy": 0.85,
            "precision": 0.78,
            "recall": 0.82,
            "f1_score": 0.80,
            "auc_roc": 0.87,
            "auc_pr": 0.75,
            "avg_prediction_time_ms": 45.0,
            "total_predictions": 1000,
            "correct_predictions": 850,
            "evaluation_date": datetime.now()
        }
    
    async def compare_models(self) -> Dict[str, Any]:
        """Compare performance of all available models"""
        model_performances = []
        
        for model_name in self.models.keys():
            performance = await self.get_model_performance(model_name)
            model_performances.append(performance)
        
        # Find best model based on F1 score
        best_model = max(model_performances, key=lambda x: x["f1_score"])
        
        return {
            "models": model_performances,
            "comparison_date": datetime.now(),
            "recommended_model": best_model["model_name"]
        }
    
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        return list(self.models.keys())
    
    def calculate_features_hash(self, features: PatientFeatures) -> str:
        """Calculate hash of features for caching"""
        features_dict = features.dict()
        features_str = json.dumps(features_dict, sort_keys=True)
        return hashlib.md5(features_str.encode()).hexdigest()
    
    async def cleanup(self):
        """Clean up resources"""
        self.executor.shutdown(wait=True)