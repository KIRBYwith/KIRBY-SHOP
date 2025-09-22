"""
쿠폰 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from decimal import Decimal

class CouponBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    discount_type: str  # percentage, fixed_amount
    discount_value: Decimal
    min_order_amount: int = 0
    max_discount_amount: Optional[int] = None
    usage_limit: Optional[int] = None
    user_limit: int = 1
    valid_from: datetime
    valid_until: datetime

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    discount_value: Optional[Decimal] = None
    min_order_amount: Optional[int] = None
    max_discount_amount: Optional[int] = None
    usage_limit: Optional[int] = None
    user_limit: Optional[int] = None
    is_active: Optional[bool] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None

class CouponResponse(CouponBase):
    id: int
    usage_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserCouponResponse(BaseModel):
    id: int
    coupon: CouponResponse
    used_at: Optional[datetime] = None
    order_id: Optional[str] = None
    is_used: bool
    obtained_at: datetime
    
    class Config:
        from_attributes = True

class CouponApplyRequest(BaseModel):
    coupon_code: str
    order_amount: int

class CouponApplyResponse(BaseModel):
    coupon: CouponResponse
    discount_amount: int
    final_amount: int
    is_applicable: bool
    message: str

class CouponValidationResponse(BaseModel):
    is_valid: bool
    message: str
    discount_amount: Optional[int] = None

class CouponRegisterRequest(BaseModel):
    coupon_code: str

class CouponRegisterResponse(BaseModel):
    success: bool
    message: str
    coupon: Optional[CouponResponse] = None
