"""
사용자 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    birth_date = Column(Date)
    address = Column(Text)
    grade = Column(String(50), default="신규회원")
    points = Column(Integer, default=2000)
    order_count = Column(Integer, default=0)
    join_date = Column(DateTime, default=func.now())
    profile_image = Column(String(500))
    role = Column(String(20), default="user")  # user, admin, manager
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    user_coupons = relationship("UserCoupon", back_populates="user", cascade="all, delete-orphan")
    qnas = relationship("QnA", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    review_helpful_votes = relationship("ReviewHelpful", back_populates="user", cascade="all, delete-orphan")
    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"
