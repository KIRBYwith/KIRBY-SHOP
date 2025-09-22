"""
쿠폰 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, DECIMAL, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    discount_type = Column(String(20), nullable=False)  # percentage, fixed_amount
    discount_value = Column(DECIMAL(10, 2), nullable=False)
    min_order_amount = Column(Integer, default=0)
    max_discount_amount = Column(Integer)
    usage_limit = Column(Integer)  # 총 사용 가능 횟수
    usage_count = Column(Integer, default=0)  # 현재 사용 횟수
    user_limit = Column(Integer, default=1)  # 사용자당 사용 가능 횟수
    is_active = Column(Boolean, default=True)
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    user_coupons = relationship("UserCoupon", back_populates="coupon", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Coupon(id={self.id}, code='{self.code}', name='{self.name}')>"

class UserCoupon(Base):
    __tablename__ = "user_coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    used_at = Column(DateTime)
    order_id = Column(String(50), ForeignKey("orders.id"))
    is_used = Column(Boolean, default=False)
    obtained_at = Column(DateTime, default=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="user_coupons")
    coupon = relationship("Coupon", back_populates="user_coupons")
    order = relationship("Order", back_populates="used_coupons")
    
    # 복합 인덱스
    __table_args__ = (
        Index('idx_user_coupon', 'user_id', 'coupon_id'),
        Index('idx_user_obtained', 'user_id', 'obtained_at'),
    )
    
    def __repr__(self):
        return f"<UserCoupon(id={self.id}, user_id={self.user_id}, coupon_id={self.coupon_id}, is_used={self.is_used})>"
