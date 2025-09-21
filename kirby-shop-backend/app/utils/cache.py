"""
Redis 캐시 유틸리티
"""

import json
import redis
from typing import Any, Optional, Union
from app.config import settings

class CacheManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            db=settings.REDIS_DB,
            decode_responses=True
        )
    
    async def get(self, key: str) -> Optional[Any]:
        """캐시에서 데이터 조회"""
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception:
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """캐시에 데이터 저장"""
        try:
            serialized_value = json.dumps(value, ensure_ascii=False)
            self.redis_client.setex(key, expire, serialized_value)
            return True
        except Exception:
            return False
    
    async def delete(self, key: str) -> bool:
        """캐시에서 데이터 삭제"""
        try:
            self.redis_client.delete(key)
            return True
        except Exception:
            return False
    
    async def delete_pattern(self, pattern: str) -> bool:
        """패턴에 맞는 캐시 키들 삭제"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception:
            return False
    
    async def exists(self, key: str) -> bool:
        """캐시 키 존재 여부 확인"""
        try:
            return bool(self.redis_client.exists(key))
        except Exception:
            return False
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """카운터 증가"""
        try:
            return self.redis_client.incrby(key, amount)
        except Exception:
            return None

# 전역 캐시 매니저 인스턴스
cache_manager = CacheManager()

# 캐시 키 생성 헬퍼 함수들
def get_product_cache_key(product_id: int) -> str:
    return f"product:{product_id}"

def get_user_cache_key(user_id: int) -> str:
    return f"user:{user_id}"

def get_cart_cache_key(user_id: int) -> str:
    return f"cart:{user_id}"

def get_wishlist_cache_key(user_id: int) -> str:
    return f"wishlist:{user_id}"

def get_coupon_cache_key(coupon_code: str) -> str:
    return f"coupon:{coupon_code}"

def get_review_cache_key(product_id: int) -> str:
    return f"reviews:product:{product_id}"
