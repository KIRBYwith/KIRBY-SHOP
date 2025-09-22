"""
결제 관련 Pydantic 스키마
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class PaymentRequest(BaseModel):
    """결제 요청 스키마"""
    order_id: str = Field(..., description="주문 ID")
    payment_method: str = Field(..., description="결제 수단 (kakao, naver, inicis, toss)")
    amount: int = Field(..., description="결제 금액")
    items: List[Dict[str, Any]] = Field(..., description="주문 상품 목록")
    user_info: Dict[str, Any] = Field(..., description="사용자 정보")

class PaymentResponse(BaseModel):
    """결제 응답 스키마"""
    success: bool = Field(..., description="결제 처리 성공 여부")
    payment_id: int = Field(..., description="결제 ID")
    payment_url: str = Field(..., description="결제창 URL")
    message: str = Field(..., description="응답 메시지")

class PaymentStatusResponse(BaseModel):
    """결제 상태 응답 스키마"""
    payment_id: int = Field(..., description="결제 ID")
    status: str = Field(..., description="결제 상태")
    amount: int = Field(..., description="결제 금액")
    payment_method: str = Field(..., description="결제 수단")
    transaction_id: Optional[str] = Field(None, description="거래 ID")
    created_at: datetime = Field(..., description="결제 생성 시간")

class KakaoPayRequest(BaseModel):
    """카카오페이 요청 스키마"""
    cid: str = Field(..., description="가맹점 코드")
    partner_order_id: str = Field(..., description="가맹점 주문번호")
    partner_user_id: str = Field(..., description="가맹점 회원 ID")
    item_name: str = Field(..., description="상품명")
    quantity: int = Field(..., description="상품 수량")
    total_amount: int = Field(..., description="총 금액")
    tax_free_amount: int = Field(0, description="면세 금액")
    approval_url: str = Field(..., description="승인 URL")
    cancel_url: str = Field(..., description="취소 URL")
    fail_url: str = Field(..., description="실패 URL")

class NaverPayRequest(BaseModel):
    """네이버페이 요청 스키마"""
    merchant_pay_key: str = Field(..., description="가맹점 주문키")
    product_name: str = Field(..., description="상품명")
    total_pay_amount: int = Field(..., description="총 결제 금액")
    tax_sc_amount: int = Field(0, description="과세 금액")
    return_url: str = Field(..., description="결제 완료 후 리턴 URL")
    cancel_return_url: str = Field(..., description="결제 취소 후 리턴 URL")
    fail_return_url: str = Field(..., description="결제 실패 후 리턴 URL")

class InicisPayRequest(BaseModel):
    """이니시스 결제 요청 스키마"""
    oid: str = Field(..., description="주문번호")
    price: int = Field(..., description="결제 금액")
    timestamp: int = Field(..., description="타임스탬프")
    goodname: str = Field(..., description="상품명")
    returnUrl: str = Field(..., description="결제 완료 후 리턴 URL")
    closeUrl: str = Field(..., description="결제 취소 후 리턴 URL")
    failUrl: str = Field(..., description="결제 실패 후 리턴 URL")

class TossPayRequest(BaseModel):
    """토스페이 요청 스키마"""
    orderId: str = Field(..., description="주문 ID")
    amount: int = Field(..., description="결제 금액")
    orderName: str = Field(..., description="주문명")
    successUrl: str = Field(..., description="결제 성공 후 리다이렉트 URL")
    failUrl: str = Field(..., description="결제 실패 후 리다이렉트 URL")
    customerEmail: Optional[str] = Field("", description="고객 이메일")
    customerName: Optional[str] = Field("", description="고객 이름")
    customerMobilePhone: Optional[str] = Field("", description="고객 휴대폰 번호")

class PaymentMethodResponse(BaseModel):
    """결제 수단 응답 스키마"""
    id: int = Field(..., description="결제 수단 ID")
    method_type: str = Field(..., description="결제 수단 타입")
    provider: str = Field(..., description="결제 제공업체")
    name: str = Field(..., description="결제 수단명")
    masked_info: str = Field(..., description="마스킹된 정보")
    is_default: bool = Field(..., description="기본 결제 수단 여부")

class PaymentCallbackRequest(BaseModel):
    """결제 콜백 요청 스키마"""
    payment_id: str = Field(..., description="결제 ID")
    status: str = Field(..., description="결제 상태")
    amount: int = Field(..., description="결제 금액")
    transaction_id: Optional[str] = Field(None, description="거래 ID")
    payment_key: Optional[str] = Field(None, description="결제 키")
    metadata: Optional[Dict[str, Any]] = Field(None, description="추가 메타데이터")