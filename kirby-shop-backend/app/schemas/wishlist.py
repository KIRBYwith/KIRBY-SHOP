"""
위시리스트 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import List
from pydantic import BaseModel
from .product import ProductResponse

class WishlistItemResponse(BaseModel):
    id: int
    product: ProductResponse
    added_at: datetime
    
    class Config:
        from_attributes = True

class WishlistResponse(BaseModel):
    items: List[WishlistItemResponse]
    total_count: int
    
    class Config:
        from_attributes = True

class WishlistCreate(BaseModel):
    product_id: int

class WishlistSummary(BaseModel):
    total_count: int
    total_value: int  # 총 상품 가치
    discounted_value: int  # 할인된 총 가치
