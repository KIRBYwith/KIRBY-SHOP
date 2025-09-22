"""
주문 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from .product import ProductResponse

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: int
    selected_option: Optional[str] = ""

class OrderItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int
    price: int
    selected_option: str
    
    class Config:
        from_attributes = True

class ReceiverInfo(BaseModel):
    name: str
    phone: str
    address: str
    address_detail: Optional[str] = ""
    zip: str

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    receiver: ReceiverInfo
    request_message: Optional[str] = ""
    payment_method: str

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderSummary(BaseModel):
    total_amount: int
    discount_amount: int
    shipping_fee: int
    final_amount: int

class OrderResponse(BaseModel):
    id: str
    user_id: int
    items: List[OrderItemResponse]
    receiver: ReceiverInfo
    summary: OrderSummary
    status: str
    payment_method: Optional[str]
    payment_status: str
    request_message: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
