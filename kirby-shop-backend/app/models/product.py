"""
상품 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    price = Column(Integer, nullable=False)
    original_price = Column(Integer)
    discount = Column(Integer, default=0)
    category = Column(String(100), index=True)
    image = Column(String(500))
    images = Column(JSON)  # 여러 이미지 URL 리스트
    stock = Column(Integer, default=0)
    is_new = Column(Boolean, default=False)
    is_best_seller = Column(Boolean, default=False)
    is_limited = Column(Boolean, default=False)
    tags = Column(JSON)  # 태그 리스트
    specs = Column(JSON)  # 상품 스펙 딕셔너리
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")
    qnas = relationship("QnA", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product(id={self.id}, title='{self.title}', price={self.price})>"
