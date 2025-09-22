"""
결제 관련 데이터베이스 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, DECIMAL, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False)
    payment_method = Column(String(50), nullable=False)  # card, kakao, toss, bank_transfer
    payment_provider = Column(String(50))  # kakao_pay, toss_pay, etc.
    amount = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")  # pending, completed, failed, cancelled, refunded
    transaction_id = Column(String(100), unique=True)  # 외부 결제 시스템의 거래 ID
    payment_key = Column(String(100))  # 결제 키
    approved_at = Column(DateTime)
    failed_reason = Column(Text)
    refund_amount = Column(Integer, default=0)
    refund_reason = Column(Text)
    refunded_at = Column(DateTime)
    payment_metadata = Column(JSON)  # 결제 관련 추가 정보
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    order = relationship("Order", back_populates="payments")
    
    # 인덱스
    __table_args__ = (
        Index('idx_order_payment', 'order_id'),
        Index('idx_transaction_id', 'transaction_id'),
        Index('idx_payment_key', 'payment_key'),
        Index('idx_status_payment', 'status', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Payment(id={self.id}, order_id='{self.order_id}', amount={self.amount}, status='{self.status}')>"

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    method_type = Column(String(50), nullable=False)  # card, bank_account
    provider = Column(String(50))  # kakao_pay, toss_pay, etc.
    name = Column(String(100))  # 카드명 또는 계좌명
    masked_info = Column(String(100))  # 마스킹된 정보 (****-****-****-1234)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    method_metadata = Column(JSON)  # 추가 정보
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="payment_methods")
    
    # 인덱스
    __table_args__ = (
        Index('idx_user_payment_method', 'user_id', 'is_active'),
    )
    
    def __repr__(self):
        return f"<PaymentMethod(id={self.id}, user_id={self.user_id}, method_type='{self.method_type}')>"
