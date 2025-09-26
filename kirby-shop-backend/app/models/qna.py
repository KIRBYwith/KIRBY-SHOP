"""
Q&A 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class QnA(Base):
    __tablename__ = "qnas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # 상품문의, 배송문의, 교환/반품, 기타
    status = Column(String(20), default="pending")  # pending, answered, closed
    is_private = Column(Boolean, default=False)
    images = Column(JSON)  # 이미지 URL 리스트
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="qnas")
    product = relationship("Product", back_populates="qnas")
    answers = relationship("QnAAnswer", back_populates="qna", cascade="all, delete-orphan")
    
    # 인덱스
    __table_args__ = (
        Index('idx_user_qna', 'user_id', 'created_at'),
        Index('idx_product_qna', 'product_id', 'created_at'),
        Index('idx_status_qna', 'status', 'created_at'),
    )
    
    def __repr__(self):
        return f"<QnA(id={self.id}, title='{self.title}', status='{self.status}')>"

class QnAAnswer(Base):
    __tablename__ = "qna_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    qna_id = Column(Integer, ForeignKey("qnas.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    qna = relationship("QnA", back_populates="answers")
    admin = relationship("User", foreign_keys=[admin_id])
    
    def __repr__(self):
        return f"<QnAAnswer(id={self.id}, qna_id={self.qna_id}, admin_id={self.admin_id})>"
