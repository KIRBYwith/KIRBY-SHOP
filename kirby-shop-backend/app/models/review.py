"""
리뷰 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    order_id = Column(String(50), ForeignKey("orders.id"))
    rating = Column(Integer, nullable=False)  # 1-5점
    title = Column(String(200))
    content = Column(Text)
    images = Column(Text)  # JSON 문자열로 이미지 URL들 저장
    is_verified_purchase = Column(Boolean, default=False)
    is_helpful = Column(Integer, default=0)  # 도움됨 수
    is_anonymous = Column(Boolean, default=False)
    status = Column(String(20), default="active")  # active, hidden, deleted
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
    order = relationship("Order", back_populates="reviews")
    helpful_votes = relationship("ReviewHelpful", back_populates="review", cascade="all, delete-orphan")
    
    # 인덱스
    __table_args__ = (
        Index('idx_user_review', 'user_id', 'created_at'),
        Index('idx_product_review', 'product_id', 'created_at'),
        Index('idx_product_rating', 'product_id', 'rating'),
        Index('idx_order_review', 'order_id'),
    )
    
    def __repr__(self):
        return f"<Review(id={self.id}, user_id={self.user_id}, product_id={self.product_id}, rating={self.rating})>"

class ReviewHelpful(Base):
    __tablename__ = "review_helpful"
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 관계 설정
    review = relationship("Review", back_populates="helpful_votes")
    user = relationship("User", back_populates="review_helpful_votes")
    
    # 복합 인덱스 (중복 방지)
    __table_args__ = (
        Index('idx_review_user', 'review_id', 'user_id', unique=True),
    )
    
    def __repr__(self):
        return f"<ReviewHelpful(id={self.id}, review_id={self.review_id}, user_id={self.user_id})>"
