import redis.asyncio as redis
import json
import pickle
from typing import Any, Optional
from datetime import datetime, timedelta
import logging

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class RedisCache:
    """Redis cache manager"""
    
    def __init__(self):
        self.redis_client = None
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=False,  # We'll handle encoding ourselves
                socket_connect_timeout=5,
                socket_keepalive=True,
                socket_keepalive_options={},
                health_check_interval=30,
            )
            await self.redis_client.ping()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set a value in cache"""
        try:
            if ttl is None:
                ttl = settings.CACHE_TTL_SECONDS
            
            # Serialize the value
            serialized_value = pickle.dumps(value)
            
            # Set with TTL
            await self.redis_client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        try:
            value = await self.redis_client.get(key)
            if value is None:
                return None
            
            # Deserialize the value
            return pickle.loads(value)
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None
    
    async def delete(self, key: str) -> bool:
        """Delete a key from cache"""
        try:
            deleted = await self.redis_client.delete(key)
            return deleted > 0
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            return await self.redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    async def set_json(self, key: str, value: dict, ttl: Optional[int] = None) -> bool:
        """Set a JSON value in cache"""
        try:
            if ttl is None:
                ttl = settings.CACHE_TTL_SECONDS
            
            # Serialize as JSON
            json_value = json.dumps(value, default=str)
            
            # Set with TTL
            await self.redis_client.setex(key, ttl, json_value)
            return True
        except Exception as e:
            logger.error(f"Error setting JSON cache key {key}: {e}")
            return False
    
    async def get_json(self, key: str) -> Optional[dict]:
        """Get a JSON value from cache"""
        try:
            value = await self.redis_client.get(key)
            if value is None:
                return None
            
            # Deserialize from JSON
            return json.loads(value)
        except Exception as e:
            logger.error(f"Error getting JSON cache key {key}: {e}")
            return None
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment a counter in cache"""
        try:
            return await self.redis_client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Error incrementing cache key {key}: {e}")
            return 0
    
    async def set_hash(self, key: str, mapping: dict, ttl: Optional[int] = None) -> bool:
        """Set a hash in cache"""
        try:
            # Convert all values to strings
            str_mapping = {k: str(v) for k, v in mapping.items()}
            
            await self.redis_client.hmset(key, str_mapping)
            
            if ttl:
                await self.redis_client.expire(key, ttl)
            
            return True
        except Exception as e:
            logger.error(f"Error setting hash cache key {key}: {e}")
            return False
    
    async def get_hash(self, key: str) -> Optional[dict]:
        """Get a hash from cache"""
        try:
            value = await self.redis_client.hgetall(key)
            if not value:
                return None
            
            # Convert bytes keys/values to strings
            return {k.decode() if isinstance(k, bytes) else k: 
                   v.decode() if isinstance(v, bytes) else v 
                   for k, v in value.items()}
        except Exception as e:
            logger.error(f"Error getting hash cache key {key}: {e}")
            return None

# Global cache instance
cache = RedisCache()

async def get_redis_client() -> RedisCache:
    """Get Redis client instance"""
    return cache

def cache_key(*parts: str) -> str:
    """Generate a cache key from parts"""
    return ":".join(str(part) for part in parts)

def prediction_cache_key(patient_id: str, features_hash: str) -> str:
    """Generate cache key for prediction"""
    return cache_key("prediction", patient_id, features_hash)

def model_performance_cache_key(model_name: str) -> str:
    """Generate cache key for model performance"""
    return cache_key("model_performance", model_name)

def patient_history_cache_key(patient_id: str) -> str:
    """Generate cache key for patient history"""
    return cache_key("patient_history", patient_id)