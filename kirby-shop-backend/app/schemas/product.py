"""
상품 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ProductBase(BaseModel):
    title: str
    description: str
    price: int
    category: str
    image: str

class ProductCreate(ProductBase):
    original_price: Optional[int] = None
    discount: int = 0
    images: List[str] = []
    stock: int = 0
    is_new: bool = False
    is_best_seller: bool = False
    is_limited: bool = False
    tags: List[str] = []
    specs: Dict[str, str] = {}

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    discount: Optional[int] = None
    category: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    is_new: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    is_limited: Optional[bool] = None
    tags: Optional[List[str]] = None
    specs: Optional[Dict[str, str]] = None

class ProductResponse(ProductBase):
    id: int
    original_price: Optional[int]
    discount: int
    images: List[str]
    stock: int
    is_new: bool
    is_best_seller: bool
    is_limited: bool
    tags: List[str]
    specs: Dict[str, str]
    rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    is_new: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    is_limited: Optional[bool] = None
    sort_by: Optional[str] = "created_at"  # created_at, price, rating, review_count
    sort_order: Optional[str] = "desc"  # asc, desc
    page: int = 1
    limit: int = 20
