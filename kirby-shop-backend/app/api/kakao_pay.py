from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import json
from app.config import settings

router = APIRouter(prefix="/api/payments/kakao", tags=["kakao-pay"])

# 카카오페이 시뮬레이션 설정
KAKAO_PAY_CONFIG = {
    "cid": "TC0ONETIME",
    "simulation_mode": True,  # 시뮬레이션 모드 강제 활성화
    "base_url": "https://kapi.kakao.com"
}

class KakaoPayPrepareRequest(BaseModel):
    cid: str
    partner_order_id: str
    partner_user_id: str
    item_name: str
    quantity: int
    total_amount: int
    tax_free_amount: int = 0
    approval_url: str
    cancel_url: str
    fail_url: str

class KakaoPayApproveRequest(BaseModel):
    cid: str
    tid: str
    partner_order_id: str
    partner_user_id: str
    pg_token: str

@router.post("/prepare")
async def prepare_kakao_payment(request: KakaoPayPrepareRequest):
    """카카오페이 결제 준비 - 시뮬레이션 모드"""
    try:
        print(f"카카오페이 결제 준비 요청 (시뮬레이션) - {request.partner_order_id}")
        
        # 시뮬레이션 응답 반환
        return {
            "success": True,
            "tid": f"T{request.partner_order_id}",
            "next_redirect_pc_url": f"http://localhost:3000/kakao-pay-qr.html?amount={request.total_amount}&orderId={request.partner_order_id}",
            "next_redirect_mobile_url": f"http://localhost:3000/kakao-pay-qr.html?amount={request.total_amount}&orderId={request.partner_order_id}",
            "next_redirect_app_url": f"http://localhost:3000/kakao-pay-qr.html?amount={request.total_amount}&orderId={request.partner_order_id}",
            "android_app_scheme": "kakaotalk://kakaopay/pay",
            "ios_app_scheme": "kakaotalk://kakaopay/pay",
            "created_at": "2024-01-01T00:00:00Z"
        }
            
    except Exception as e:
        print(f"카카오페이 결제 준비 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"카카오페이 결제 준비 중 오류가 발생했습니다: {str(e)}")

@router.post("/approve")
async def approve_kakao_payment(request: KakaoPayApproveRequest):
    """카카오페이 결제 승인 - 시뮬레이션 모드"""
    try:
        print(f"카카오페이 결제 승인 요청 (시뮬레이션) - {request.tid}")
        
        # 시뮬레이션 응답 반환
        return {
            "success": True,
            "aid": f"A{request.partner_order_id}",
            "tid": request.tid,
            "cid": request.cid,
            "partner_order_id": request.partner_order_id,
            "partner_user_id": request.partner_user_id,
            "payment_method_type": "CARD",
            "item_name": "커비 상품",
            "quantity": 1,
            "amount": {
                "total": 1000,
                "tax_free": 0,
                "vat": 91,
                "point": 0,
                "discount": 0
            },
            "created_at": "2024-01-01T00:00:00Z",
            "approved_at": "2024-01-01T00:00:00Z"
        }
            
    except Exception as e:
        print(f"카카오페이 결제 승인 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"카카오페이 결제 승인 중 오류가 발생했습니다: {str(e)}")

@router.post("/cancel")
async def cancel_kakao_payment(request: dict):
    """카카오페이 결제 취소 - 시뮬레이션 모드"""
    try:
        print(f"카카오페이 결제 취소 요청 (시뮬레이션) - {request.get('tid')}")
        
        # 시뮬레이션 응답 반환
        return {
            "success": True,
            "aid": f"A{request.get('tid')}",
            "tid": request.get("tid"),
            "cid": request.get("cid"),
            "status": "CANCEL_PAYMENT",
            "partner_order_id": request.get("partner_order_id"),
            "partner_user_id": request.get("partner_user_id"),
            "payment_method_type": "CARD",
            "amount": {
                "total": request.get("cancel_amount", 1000),
                "tax_free": 0,
                "vat": 91,
                "point": 0,
                "discount": 0
            },
            "canceled_at": "2024-01-01T00:00:00Z"
        }
            
    except Exception as e:
        print(f"카카오페이 결제 취소 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"카카오페이 결제 취소 중 오류가 발생했습니다: {str(e)}")

@router.get("/status/{tid}")
async def get_kakao_payment_status(tid: str):
    """카카오페이 결제 상태 조회 - 시뮬레이션 모드"""
    try:
        print(f"카카오페이 결제 상태 조회 (시뮬레이션) - {tid}")
        
        # 시뮬레이션 응답 반환
        return {
            "success": True,
            "tid": tid,
            "status": "completed",
            "payment_method_type": "CARD",
            "amount": {
                "total": 1000,
                "tax_free": 0,
                "vat": 91,
                "point": 0,
                "discount": 0
            },
            "created_at": "2024-01-01T00:00:00Z",
            "approved_at": "2024-01-01T00:00:00Z"
        }
            
    except Exception as e:
        print(f"카카오페이 결제 상태 조회 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"카카오페이 결제 상태 조회 중 오류가 발생했습니다: {str(e)}")
