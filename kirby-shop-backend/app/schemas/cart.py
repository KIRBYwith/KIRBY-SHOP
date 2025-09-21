"""
장바구니 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from .product import ProductResponse

class CartItemBase(BaseModel):
    product_id: int
    quantity: int
    selected_option: Optional[str] = ""

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: Optional[int] = None
    selected_option: Optional[str] = None

class CartItemResponse(BaseModel):
    cart_item_id: str
    product: ProductResponse
    quantity: int
    selected_option: str
    added_at: datetime
    is_guest: bool = False
    
    class Config:
        from_attributes = True

class CartSummary(BaseModel):
    total_quantity: int
    total_price: int
    original_total_price: int
    total_discount: int
    shipping_fee: int
    final_price: int
    free_shipping_remaining: int
    is_empty: bool
    has_guest_items: bool

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    summary: CartSummary
