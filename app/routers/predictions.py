from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import logging
import json
import asyncio

from app.core.database import get_db
from app.core.cache import get_redis_client, cache_key, prediction_cache_key, patient_history_cache_key
from app.models.prediction import (
    Prediction, ModelPerformance, BatchPrediction, PredictionAudit, 
    FeatureImportance, ModelRegistry
)
from app.schemas.prediction import (
    PredictionRequest, PredictionResponse, BatchPredictionRequest,
    BatchPredictionResponse, ModelPerformanceMetrics, ModelComparisonResponse,
    PredictionHistoryResponse, ErrorResponse, FeatureImportanceItem
)
from app.services.ml_service import MLService
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()
logger = logging.getLogger(__name__)

# Dependency to get ML service
async def get_ml_service(request: Request) -> MLService:
    """Get ML service from application state"""
    return request.app.state.ml_service

@router.post("/predictions/", response_model=PredictionResponse)
async def create_prediction(
    request: PredictionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    ml_service: MLService = Depends(get_ml_service),
    cache = Depends(get_redis_client)
):
    """
    Generate ML prediction for a patient
    
    This endpoint processes patient features and returns a risk prediction
    for hospital readmission along with confidence intervals and recommendations.
    """
    try:
        # Calculate features hash for caching
        features_hash = ml_service.calculate_features_hash(request.features)
        cache_key_str = prediction_cache_key(str(request.patient_id), features_hash)
        
        # Check cache first
        cached_prediction = await cache.get_json(cache_key_str)
        if cached_prediction:
            logger.info(f"Returning cached prediction for patient {request.patient_id}")
            return PredictionResponse(**cached_prediction)
        
        # Generate prediction
        prediction_result = await ml_service.predict(
            request.features,
            request.model_name,
            request.include_feature_importance
        )
        
        # Create prediction record
        prediction_id = uuid.uuid4()
        prediction_record = Prediction(
            id=prediction_id,
            patient_id=request.patient_id,
            model_name=prediction_result["model_used"],
            model_version=prediction_result["model_version"],
            risk_score=prediction_result["risk_score"],
            confidence_interval_lower=prediction_result["confidence_interval"][0],
            confidence_interval_upper=prediction_result["confidence_interval"][1],
            risk_level=prediction_result["risk_level"],
            feature_importance=prediction_result.get("feature_importance", []),
            input_features=request.features.dict(),
            recommendations=prediction_result.get("recommendations", []),
            processing_time_ms=prediction_result.get("processing_time_ms")
        )
        
        db.add(prediction_record)
        await db.commit()
        await db.refresh(prediction_record)
        
        # Create response
        response = PredictionResponse(
            prediction_id=prediction_id,
            patient_id=request.patient_id,
            risk_score=prediction_result["risk_score"],
            confidence_interval=prediction_result["confidence_interval"],
            risk_level=prediction_result["risk_level"],
            model_used=prediction_result["model_used"],
            model_version=prediction_result["model_version"],
            feature_importance=prediction_result.get("feature_importance"),
            recommendations=prediction_result.get("recommendations"),
            processing_time_ms=prediction_result.get("processing_time_ms"),
            created_at=prediction_record.created_at
        )
        
        # Cache the response
        await cache.set_json(cache_key_str, response.dict())
        
        # Add audit trail in background
        background_tasks.add_task(
            create_audit_record,
            prediction_id,
            "created",
            db,
            user_id=None,
            details={"model_used": prediction_result["model_used"]}
        )
        
        # Update model performance metrics in background
        background_tasks.add_task(
            update_model_performance,
            prediction_result["model_used"],
            prediction_result["processing_time_ms"],
            db
        )
        
        # Clear patient history cache
        background_tasks.add_task(
            clear_patient_cache,
            str(request.patient_id),
            cache
        )
        
        logger.info(f"Created prediction {prediction_id} for patient {request.patient_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error creating prediction: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating prediction: {str(e)}"
        )

@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """
    Get prediction details with confidence intervals
    
    Returns detailed information about a specific prediction including
    feature importance and recommendations.
    """
    try:
        # Query prediction
        result = await db.execute(
            select(Prediction).where(Prediction.id == prediction_id)
        )
        prediction = result.scalar_one_or_none()
        
        if not prediction:
            raise HTTPException(
                status_code=404,
                detail=f"Prediction {prediction_id} not found"
            )
        
        # Convert feature importance from JSON to objects
        feature_importance = None
        if prediction.feature_importance:
            feature_importance = [
                FeatureImportanceItem(**item) 
                for item in prediction.feature_importance
            ]
        
        response = PredictionResponse(
            prediction_id=prediction.id,
            patient_id=prediction.patient_id,
            risk_score=prediction.risk_score,
            confidence_interval=[
                prediction.confidence_interval_lower,
                prediction.confidence_interval_upper
            ],
            risk_level=prediction.risk_level,
            model_used=prediction.model_name,
            model_version=prediction.model_version,
            feature_importance=feature_importance,
            recommendations=prediction.recommendations,
            processing_time_ms=prediction.processing_time_ms,
            created_at=prediction.created_at
        )
        
        # Add audit trail in background
        if background_tasks:
            background_tasks.add_task(
                create_audit_record,
                prediction_id,
                "viewed",
                db,
                details={"accessed_at": datetime.now().isoformat()}
            )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving prediction {prediction_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving prediction: {str(e)}"
        )

@router.get("/predictions/patient/{patient_id}", response_model=PredictionHistoryResponse)
async def get_patient_predictions(
    patient_id: uuid.UUID,
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    cache = Depends(get_redis_client)
):
    """
    Get patient prediction history
    
    Returns all predictions for a specific patient with pagination support.
    """
    try:
        # Check cache first
        cache_key_str = patient_history_cache_key(str(patient_id))
        cached_history = await cache.get_json(cache_key_str)
        
        if cached_history:
            # Apply pagination to cached results
            predictions = cached_history["predictions"][offset:offset + limit]
            return PredictionHistoryResponse(
                patient_id=patient_id,
                total_predictions=cached_history["total_predictions"],
                predictions=[PredictionResponse(**p) for p in predictions]
            )
        
        # Query from database
        count_result = await db.execute(
            select(func.count(Prediction.id))
            .where(Prediction.patient_id == patient_id)
        )
        total_predictions = count_result.scalar()
        
        predictions_result = await db.execute(
            select(Prediction)
            .where(Prediction.patient_id == patient_id)
            .order_by(desc(Prediction.created_at))
            .offset(offset)
            .limit(limit)
        )
        predictions = predictions_result.scalars().all()
        
        # Convert to response format
        prediction_responses = []
        for prediction in predictions:
            feature_importance = None
            if prediction.feature_importance:
                feature_importance = [
                    FeatureImportanceItem(**item) 
                    for item in prediction.feature_importance
                ]
            
            prediction_responses.append(PredictionResponse(
                prediction_id=prediction.id,
                patient_id=prediction.patient_id,
                risk_score=prediction.risk_score,
                confidence_interval=[
                    prediction.confidence_interval_lower,
                    prediction.confidence_interval_upper
                ],
                risk_level=prediction.risk_level,
                model_used=prediction.model_name,
                model_version=prediction.model_version,
                feature_importance=feature_importance,
                recommendations=prediction.recommendations,
                processing_time_ms=prediction.processing_time_ms,
                created_at=prediction.created_at
            ))
        
        response = PredictionHistoryResponse(
            patient_id=patient_id,
            total_predictions=total_predictions,
            predictions=prediction_responses
        )
        
        # Cache the response (without pagination)
        if offset == 0:
            await cache.set_json(cache_key_str, {
                "patient_id": str(patient_id),
                "total_predictions": total_predictions,
                "predictions": [p.dict() for p in prediction_responses]
            })
        
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving patient predictions for {patient_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving patient predictions: {str(e)}"
        )

@router.post("/predictions/batch", response_model=BatchPredictionResponse)
async def create_batch_prediction(
    request: BatchPredictionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    ml_service: MLService = Depends(get_ml_service)
):
    """
    Process batch predictions
    
    Processes multiple predictions asynchronously and returns a batch ID
    for tracking progress.
    """
    try:
        # Generate batch ID
        batch_id = f"batch_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create batch record
        batch_record = BatchPrediction(
            batch_id=batch_id,
            status="pending",
            total_records=len(request.predictions),
            processed_records=0,
            failed_records=0,
            model_name=request.model_name or settings.DEFAULT_MODEL,
            model_version=ml_service.model_versions.get(
                request.model_name or settings.DEFAULT_MODEL, "1.0.0"
            )
        )
        
        db.add(batch_record)
        await db.commit()
        await db.refresh(batch_record)
        
        # Process batch in background
        background_tasks.add_task(
            process_batch_predictions,
            batch_id,
            request.predictions,
            request.model_name,
            db,
            ml_service
        )
        
        response = BatchPredictionResponse(
            batch_id=batch_id,
            status="pending",
            total_records=len(request.predictions),
            processed_records=0,
            failed_records=0,
            model_name=batch_record.model_name,
            started_at=batch_record.started_at
        )
        
        logger.info(f"Created batch prediction {batch_id} with {len(request.predictions)} records")
        return response
        
    except Exception as e:
        logger.error(f"Error creating batch prediction: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating batch prediction: {str(e)}"
        )

@router.get("/predictions/batch/{batch_id}", response_model=BatchPredictionResponse)
async def get_batch_prediction(
    batch_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get batch prediction status
    
    Returns the current status and progress of a batch prediction job.
    """
    try:
        # Query batch record
        result = await db.execute(
            select(BatchPrediction).where(BatchPrediction.batch_id == batch_id)
        )
        batch_record = result.scalar_one_or_none()
        
        if not batch_record:
            raise HTTPException(
                status_code=404,
                detail=f"Batch prediction {batch_id} not found"
            )
        
        # Get associated predictions if completed
        predictions = None
        if batch_record.status == "completed":
            predictions_result = await db.execute(
                select(Prediction).where(Prediction.batch_id == batch_id)
            )
            prediction_records = predictions_result.scalars().all()
            
            predictions = []
            for prediction in prediction_records:
                feature_importance = None
                if prediction.feature_importance:
                    feature_importance = [
                        FeatureImportanceItem(**item) 
                        for item in prediction.feature_importance
                    ]
                
                predictions.append(PredictionResponse(
                    prediction_id=prediction.id,
                    patient_id=prediction.patient_id,
                    risk_score=prediction.risk_score,
                    confidence_interval=[
                        prediction.confidence_interval_lower,
                        prediction.confidence_interval_upper
                    ],
                    risk_level=prediction.risk_level,
                    model_used=prediction.model_name,
                    model_version=prediction.model_version,
                    feature_importance=feature_importance,
                    recommendations=prediction.recommendations,
                    processing_time_ms=prediction.processing_time_ms,
                    created_at=prediction.created_at
                ))
        
        response = BatchPredictionResponse(
            batch_id=batch_record.batch_id,
            status=batch_record.status,
            total_records=batch_record.total_records,
            processed_records=batch_record.processed_records,
            failed_records=batch_record.failed_records,
            model_name=batch_record.model_name,
            started_at=batch_record.started_at,
            completed_at=batch_record.completed_at,
            error_message=batch_record.error_message,
            predictions=predictions
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving batch prediction {batch_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving batch prediction: {str(e)}"
        )

@router.get("/predictions/models/performance", response_model=ModelComparisonResponse)
async def get_model_performance(
    model_name: Optional[str] = None,
    ml_service: MLService = Depends(get_ml_service),
    db: AsyncSession = Depends(get_db),
    cache = Depends(get_redis_client)
):
    """
    Get model performance metrics
    
    Returns performance metrics for all models or a specific model,
    including accuracy, precision, recall, and processing time.
    """
    try:
        if model_name:
            # Get performance for specific model
            performance = await ml_service.get_model_performance(model_name)
            return ModelComparisonResponse(
                models=[ModelPerformanceMetrics(**performance)],
                comparison_date=datetime.now(),
                recommended_model=model_name
            )
        else:
            # Get comparison of all models
            comparison_result = await ml_service.compare_models()
            return ModelComparisonResponse(
                models=[ModelPerformanceMetrics(**model) for model in comparison_result["models"]],
                comparison_date=comparison_result["comparison_date"],
                recommended_model=comparison_result["recommended_model"]
            )
            
    except Exception as e:
        logger.error(f"Error retrieving model performance: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving model performance: {str(e)}"
        )

# Background task functions
async def create_audit_record(
    prediction_id: uuid.UUID,
    action: str,
    db: AsyncSession,
    user_id: Optional[uuid.UUID] = None,
    details: Optional[dict] = None
):
    """Create audit record for prediction"""
    try:
        audit_record = PredictionAudit(
            prediction_id=prediction_id,
            user_id=user_id,
            action=action,
            details=details
        )
        db.add(audit_record)
        await db.commit()
    except Exception as e:
        logger.error(f"Error creating audit record: {e}")

async def update_model_performance(
    model_name: str,
    processing_time_ms: int,
    db: AsyncSession
):
    """Update model performance metrics"""
    try:
        # This would typically calculate real performance metrics
        # For now, just log the processing time
        logger.info(f"Model {model_name} processing time: {processing_time_ms}ms")
    except Exception as e:
        logger.error(f"Error updating model performance: {e}")

async def clear_patient_cache(patient_id: str, cache):
    """Clear patient history cache"""
    try:
        cache_key_str = patient_history_cache_key(patient_id)
        await cache.delete(cache_key_str)
    except Exception as e:
        logger.error(f"Error clearing patient cache: {e}")

async def process_batch_predictions(
    batch_id: str,
    predictions: List[PredictionRequest],
    model_name: Optional[str],
    db: AsyncSession,
    ml_service: MLService
):
    """Process batch predictions in background"""
    try:
        # Update batch status to processing
        result = await db.execute(
            select(BatchPrediction).where(BatchPrediction.batch_id == batch_id)
        )
        batch_record = result.scalar_one()
        batch_record.status = "processing"
        await db.commit()
        
        processed_count = 0
        failed_count = 0
        
        # Process each prediction
        for prediction_request in predictions:
            try:
                # Generate prediction
                prediction_result = await ml_service.predict(
                    prediction_request.features,
                    model_name,
                    prediction_request.include_feature_importance
                )
                
                # Create prediction record
                prediction_record = Prediction(
                    id=uuid.uuid4(),
                    patient_id=prediction_request.patient_id,
                    model_name=prediction_result["model_used"],
                    model_version=prediction_result["model_version"],
                    risk_score=prediction_result["risk_score"],
                    confidence_interval_lower=prediction_result["confidence_interval"][0],
                    confidence_interval_upper=prediction_result["confidence_interval"][1],
                    risk_level=prediction_result["risk_level"],
                    feature_importance=prediction_result.get("feature_importance", []),
                    input_features=prediction_request.features.dict(),
                    recommendations=prediction_result.get("recommendations", []),
                    processing_time_ms=prediction_result.get("processing_time_ms")
                )
                
                db.add(prediction_record)
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error processing prediction in batch {batch_id}: {e}")
                failed_count += 1
        
        # Update batch record
        batch_record.processed_records = processed_count
        batch_record.failed_records = failed_count
        batch_record.status = "completed"
        batch_record.completed_at = datetime.now()
        
        await db.commit()
        
        logger.info(f"Completed batch {batch_id}: {processed_count} processed, {failed_count} failed")
        
    except Exception as e:
        logger.error(f"Error processing batch {batch_id}: {e}")
        
        # Update batch record with error
        try:
            result = await db.execute(
                select(BatchPrediction).where(BatchPrediction.batch_id == batch_id)
            )
            batch_record = result.scalar_one()
            batch_record.status = "failed"
            batch_record.error_message = str(e)
            batch_record.completed_at = datetime.now()
            await db.commit()
        except Exception as update_error:
            logger.error(f"Error updating batch record: {update_error}")

# Error handlers
@router.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=f"HTTP {exc.status_code}",
            message=exc.detail
        ).dict()
    )

@router.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            message="An unexpected error occurred"
        ).dict()
    )