"""
위시리스트 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    added_at = Column(DateTime, default=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")
    
    # 복합 인덱스
    __table_args__ = (
        Index('idx_user_product', 'user_id', 'product_id', unique=True),
    )
    
    def __repr__(self):
        return f"<WishlistItem(id={self.id}, user_id={self.user_id}, product_id={self.product_id})>"
