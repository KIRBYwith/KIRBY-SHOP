"""
리뷰 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ReviewBase(BaseModel):
    rating: int  # 1-5점
    title: Optional[str] = None
    content: Optional[str] = None
    images: Optional[List[str]] = None
    is_anonymous: bool = False

class ReviewCreate(ReviewBase):
    product_id: int
    order_id: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    images: Optional[List[str]] = None
    is_anonymous: Optional[bool] = None

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    product_id: int
    order_id: Optional[str] = None
    is_verified_purchase: bool
    is_helpful: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ReviewDetailResponse(ReviewResponse):
    user_name: Optional[str] = None  # 익명이 아닌 경우에만
    helpful_count: int
    
    class Config:
        from_attributes = True

class ReviewSummary(BaseModel):
    total_reviews: int
    average_rating: float
    rating_distribution: dict  # {1: 10, 2: 5, 3: 20, 4: 30, 5: 35}
    verified_purchase_count: int

class ReviewSearch(BaseModel):
    product_id: Optional[int] = None
    rating: Optional[int] = None
    is_verified_purchase: Optional[bool] = None
    page: int = 1
    limit: int = 20
    sort_by: str = "created_at"  # created_at, rating, helpful
    sort_order: str = "desc"  # asc, desc

class ReviewHelpfulRequest(BaseModel):
    review_id: int
    is_helpful: bool = True
