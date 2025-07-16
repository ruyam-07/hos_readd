from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import logging
import asyncio
from datetime import datetime

from app.core.config import get_settings
from app.core.database import Base, get_db
from app.core.cache import get_redis_client
from app.services.ml_service import MLService
from app.routers import predictions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=3600,
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Redis client
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    logger.info("Starting hospital readmission prediction service")
    
    # Initialize Redis
    global redis_client
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        decode_responses=True
    )
    
    # Test Redis connection
    try:
        await redis_client.ping()
        logger.info("Connected to Redis")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
    
    # Create database tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
    
    # Initialize ML service
    try:
        ml_service = MLService()
        await ml_service.initialize()
        app.state.ml_service = ml_service
        logger.info("ML service initialized")
    except Exception as e:
        logger.error(f"Failed to initialize ML service: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down hospital readmission prediction service")
    if redis_client:
        await redis_client.close()
    await engine.dispose()

app = FastAPI(
    title="Hospital Readmission Prediction API",
    description="ML-powered API for predicting hospital readmissions",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "hospital-readmission-prediction"
    }

# Include routers
app.include_router(predictions.router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Hospital Readmission Prediction API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )