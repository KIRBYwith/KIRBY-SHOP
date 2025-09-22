"""
주문 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String(50), primary_key=True)  # ORDER-{timestamp}
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending, processing, shipped, delivered, cancelled
    total_amount = Column(Integer, nullable=False)
    discount_amount = Column(Integer, default=0)
    shipping_fee = Column(Integer, default=3000)
    final_amount = Column(Integer, nullable=False)
    receiver_name = Column(String(100), nullable=False)
    receiver_phone = Column(String(20), nullable=False)
    receiver_address = Column(Text, nullable=False)
    receiver_address_detail = Column(Text)
    receiver_zip = Column(String(10), nullable=False)
    request_message = Column(Text)
    payment_method = Column(String(50))
    payment_status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    used_coupons = relationship("UserCoupon", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order(id='{self.id}', user_id={self.user_id}, status='{self.status}', total_amount={self.total_amount})>"

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)  # 주문 당시 가격
    selected_option = Column(String(100))
    
    # 관계 설정
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")
    
    def __repr__(self):
        return f"<OrderItem(id={self.id}, order_id='{self.order_id}', product_id={self.product_id}, quantity={self.quantity})>"
