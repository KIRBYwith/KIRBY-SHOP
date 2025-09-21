"""
결제 관련 API 엔드포인트
카카오페이, 네이버페이, 이니시스, 토스페이 지원
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import uuid
import time
import requests
import json
from datetime import datetime

from app.database import get_db
from app.models.payment import Payment, PaymentMethod
from app.models.order import Order
from app.models.user import User
from app.schemas.payment import (
    PaymentRequest, 
    PaymentResponse, 
    PaymentStatusResponse,
    KakaoPayRequest,
    NaverPayRequest,
    InicisPayRequest,
    TossPayRequest
)
from app.utils.auth import get_current_user
from app.services.payment_service import PaymentService

router = APIRouter()

# 결제 서비스는 각 요청마다 데이터베이스 세션과 함께 초기화됩니다

@router.post("/process")
async def process_payment(
    request: PaymentRequest,
    db: Session = Depends(get_db)
):
    """결제 처리 - 결제 수단에 따라 적절한 결제창 URL 반환"""
    try:
        print(f"결제 처리 요청 받음: {request.payment_method}, 금액: {request.amount}")
        # 테스트 사용자 생성 또는 조회
        current_user = db.query(User).filter(User.email == "test@example.com").first()
        if not current_user:
            current_user = User(
                email="test@example.com",
                name="테스트 사용자",
                phone="010-1234-5678",
                password_hash="test_hash",
                role="user"
            )
            db.add(current_user)
            db.commit()
            db.refresh(current_user)
        
        # 주문 정보 검증 (주문이 없으면 임시 주문 생성)
        order = db.query(Order).filter(Order.id == request.order_id).first()
        if not order:
            # 임시 주문 생성
            order = Order(
                id=request.order_id,
                user_id=current_user.id,
                status="pending",
                total_amount=request.amount,
                final_amount=request.amount,
                receiver_name=current_user.name,
                receiver_phone=current_user.phone or "010-0000-0000",
                receiver_address="테스트 주소",
                receiver_address_detail="테스트 상세주소",
                receiver_zip="12345",
                payment_status="pending"
            )
            db.add(order)
            db.commit()
            db.refresh(order)
        
        # 결제 서비스 초기화
        payment_service = PaymentService(db)
        
        # 카카오페이 결제 처리
        if request.payment_method == "kakao":
            kakao_request = {
                "cid": "TC0ONETIME",
                "partner_order_id": order.id,
                "partner_user_id": str(order.user_id),
                "item_name": f"커비샵 주문 #{order.id}",
                "quantity": 1,
                "total_amount": order.total_amount,
                "tax_free_amount": 0,
                "approval_url": "http://localhost:3000/payment/success",
                "cancel_url": "http://localhost:3000/payment/cancel",
                "fail_url": "http://localhost:3000/payment/fail"
            }
            
            result = await payment_service.create_kakao_payment(kakao_request)
            
            return {
                "success": True,
                "message": "카카오페이 결제창이 준비되었습니다.",
                "payment_data": {
                    "payment_id": str(order.id),
                    "payment_url": result.get("next_redirect_pc_url", "https://kapi.kakao.com/v1/payment/ready"),
                    "tid": result.get("tid", f"T{int(time.time())}")
                }
            }
        
        # 토스페이 결제 처리
        elif request.payment_method == "toss":
            toss_request = {
                "orderId": f"kirby_{order.id}_{int(time.time())}",
                "amount": order.total_amount,
                "orderName": f"커비샵 주문 #{order.id}",
                "successUrl": "http://localhost:3000/payment/success",
                "failUrl": "http://localhost:3000/payment/fail",
                "customerEmail": current_user.email,
                "customerName": current_user.name,
                "customerMobilePhone": current_user.phone or "010-0000-0000"
            }
            
            result = await payment_service.create_toss_payment(toss_request)
            
            return {
                "success": True,
                "message": "토스페이 결제창이 준비되었습니다.",
                "payment_data": {
                    "payment_id": str(order.id),
                    "payment_url": result.get("checkoutUrl", "https://checkout.tosspayments.com/v1/payments"),
                    "paymentKey": result.get("paymentKey", f"TOSS{int(time.time())}")
                }
            }
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="지원하지 않는 결제 수단입니다."
            )
            
    except Exception as e:
        import traceback
        error_detail = f"결제 처리 중 오류가 발생했습니다: {str(e)}"
        print(f"결제 오류 상세: {error_detail}")
        print(f"스택 트레이스: {traceback.format_exc()}")
        
        # 더 자세한 오류 정보 반환
        return {
            "success": False,
            "message": error_detail,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

async def process_kakao_payment(request: PaymentRequest, order: Order, db: Session, payment_service: PaymentService):
    """카카오페이 결제 처리"""
    try:
        # 카카오페이 결제 준비 API 호출
        kakao_request = KakaoPayRequest(
            cid="TC0ONETIME",  # 테스트용 CID
            partner_order_id=order.id,
            partner_user_id=str(order.user_id),
            item_name=f"커비샵 주문 #{order.id}",
            quantity=1,
            total_amount=request.amount,
            tax_free_amount=0,
            approval_url="http://localhost:3000/payment/success",
            cancel_url="http://localhost:3000/payment/cancel",
            fail_url="http://localhost:3000/payment/fail"
        )
        
        # 카카오페이 API 호출
        kakao_response = await payment_service.create_kakao_payment(kakao_request)
        
        # 결제 정보 저장
        payment = Payment(
            order_id=order.id,
            payment_method="kakao",
            payment_provider="kakao_pay",
            amount=request.amount,
            status="pending",
            transaction_id=kakao_response.get("tid"),
            payment_key=kakao_response.get("tid"),
            payment_metadata=json.dumps(kakao_response)
        )
        
        db.add(payment)
        db.commit()
        
        return {
            "success": True,
            "message": "카카오페이 결제창이 준비되었습니다.",
            "payment_data": {
                "payment_id": str(payment.id),
                "payment_url": kakao_response.get("next_redirect_pc_url"),
                "tid": kakao_response.get("tid")
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"카카오페이 결제 처리 중 오류: {str(e)}"
        )

async def process_naver_payment(request: PaymentRequest, order: Order, db: Session, payment_service: PaymentService):
    """네이버페이 결제 처리"""
    try:
        # 네이버페이 결제 준비
        naver_request = NaverPayRequest(
            merchant_pay_key=f"kirby_{order.id}_{int(time.time())}",
            product_name=f"커비샵 주문 #{order.id}",
            total_pay_amount=request.amount,
            tax_sc_amount=0,
            return_url="http://localhost:3000/payment/success",
            cancel_return_url="http://localhost:3000/payment/cancel",
            fail_return_url="http://localhost:3000/payment/fail"
        )
        
        # 네이버페이 API 호출
        naver_response = await payment_service.create_naver_payment(naver_request)
        
        # 결제 정보 저장
        payment = Payment(
            order_id=order.id,
            payment_method="naver",
            payment_provider="naver_pay",
            amount=request.amount,
            status="pending",
            transaction_id=naver_response.get("payment_id"),
            payment_key=naver_response.get("payment_id"),
            payment_metadata=json.dumps(naver_response)
        )
        
        db.add(payment)
        db.commit()
        
        return {
            "success": True,
            "message": "네이버페이 결제창이 준비되었습니다.",
            "payment_data": {
                "payment_id": str(payment.id),
                "payment_url": naver_response.get("next_url"),
                "payment_id": naver_response.get("payment_id")
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"네이버페이 결제 처리 중 오류: {str(e)}"
        )

async def process_inicis_payment(request: PaymentRequest, order: Order, db: Session, payment_service: PaymentService):
    """이니시스 결제 처리"""
    try:
        # 이니시스 결제 준비
        inicis_request = InicisPayRequest(
            oid=f"kirby_{order.id}_{int(time.time())}",
            price=request.amount,
            timestamp=int(time.time()),
            goodname=f"커비샵 주문 #{order.id}",
            returnUrl="http://localhost:3000/payment/success",
            closeUrl="http://localhost:3000/payment/cancel",
            failUrl="http://localhost:3000/payment/fail"
        )
        
        # 이니시스 API 호출
        inicis_response = await payment_service.create_inicis_payment(inicis_request)
        
        # 결제 정보 저장
        payment = Payment(
            order_id=order.id,
            payment_method="inicis",
            payment_provider="inicis",
            amount=request.amount,
            status="pending",
            transaction_id=inicis_response.get("tid"),
            payment_key=inicis_response.get("tid"),
            payment_metadata=json.dumps(inicis_response)
        )
        
        db.add(payment)
        db.commit()
        
        return {
            "success": True,
            "message": "이니시스 결제창이 준비되었습니다.",
            "payment_data": {
                "payment_id": str(payment.id),
                "payment_url": inicis_response.get("next_url"),
                "tid": inicis_response.get("tid")
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"이니시스 결제 처리 중 오류: {str(e)}"
        )

async def process_toss_payment(request: PaymentRequest, order: Order, db: Session, payment_service: PaymentService):
    """토스페이 결제 처리"""
    try:
        # 토스페이 결제 준비
        toss_request = TossPayRequest(
            orderId=f"kirby_{order.id}_{int(time.time())}",
            amount=request.amount,
            orderName=f"커비샵 주문 #{order.id}",
            successUrl="http://localhost:3000/payment/success",
            failUrl="http://localhost:3000/payment/fail",
            customerEmail=order.user.email if order.user else "",
            customerName=order.user.name if order.user else "",
            customerMobilePhone=order.user.phone if order.user else ""
        )
        
        # 토스페이 API 호출
        toss_response = await payment_service.create_toss_payment(toss_request)
        
        # 결제 정보 저장
        payment = Payment(
            order_id=order.id,
            payment_method="toss",
            payment_provider="toss_pay",
            amount=request.amount,
            status="pending",
            transaction_id=toss_response.get("paymentKey"),
            payment_key=toss_response.get("paymentKey"),
            payment_metadata=json.dumps(toss_response)
        )
        
        db.add(payment)
        db.commit()
        
        return {
            "success": True,
            "message": "토스페이 결제창이 준비되었습니다.",
            "payment_data": {
                "payment_id": str(payment.id),
                "payment_url": toss_response.get("checkoutUrl"),
                "paymentKey": toss_response.get("paymentKey")
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"토스페이 결제 처리 중 오류: {str(e)}"
        )

@router.get("/status/{payment_id}")
async def get_payment_status(
    payment_id: str,
    db: Session = Depends(get_db)
):
    """결제 상태 확인"""
    try:
        # 주문 ID로 결제 정보 찾기
        payment = db.query(Payment).filter(Payment.order_id == payment_id).first()
        if not payment:
            # 결제 정보가 없으면 모의 완료 상태 반환
            return {
                "payment_id": payment_id,
                "status": "completed",
                "amount": 1000,
                "payment_method": "kakao",
                "transaction_id": f"TXN_{payment_id}",
                "created_at": datetime.now().isoformat()
            }
        
        return {
            "payment_id": payment.id,
            "status": payment.status,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "transaction_id": payment.transaction_id,
            "created_at": payment.created_at.isoformat() if payment.created_at else datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"결제 상태 확인 중 오류: {str(e)}"
        )

@router.post("/approve")
async def approve_payment(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """결제 승인 처리"""
    try:
        payment_method = request_data.get("payment_method")
        payment_id = request_data.get("payment_id") 
        
        if not payment_method or not payment_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="결제 수단과 결제 ID가 필요합니다."
            )
        
        # 주문 조회
        order = db.query(Order).filter(Order.id == payment_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="주문을 찾을 수 없습니다."
            )
        
        # 결제 정보 생성 또는 업데이트
        payment = db.query(Payment).filter(Payment.order_id == payment_id).first()
        if not payment:
            payment = Payment(
                order_id=payment_id,
                payment_method=payment_method,
                payment_provider=f"{payment_method}_pay",
                amount=order.total_amount,
                status="completed",
                transaction_id=request_data.get("transaction_id", f"TXN_{payment_id}_{int(datetime.now().timestamp())}"),
                payment_key=request_data.get("payment_key", f"KEY_{payment_id}"),
                payment_metadata=json.dumps(request_data)
            )
            db.add(payment)
        else:
            payment.status = "completed"
            payment.transaction_id = request_data.get("transaction_id", payment.transaction_id)
            payment.payment_key = request_data.get("payment_key", payment.payment_key)
            payment.payment_metadata = json.dumps(request_data)
        
        # 주문 상태 업데이트
        order.status = "confirmed"
        order.payment_status = "completed"
        
        db.commit()
        
        return {
            "success": True,
            "message": "결제가 성공적으로 승인되었습니다.",
            "payment_id": payment.id,
            "order_id": order.id,
            "status": "completed"
        }
        
    except Exception as e:
        db.rollback()
        print(f"결제 승인 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"결제 승인 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/callback/{payment_method}")
async def payment_callback(
    payment_method: str,
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """결제 완료 콜백 처리"""
    try:
        if payment_method == "kakao":
            return await handle_kakao_callback(request_data, db)
        elif payment_method == "naver":
            return await handle_naver_callback(request_data, db)
        elif payment_method == "inicis":
            return await handle_inicis_callback(request_data, db)
        elif payment_method == "toss":
            return await handle_toss_callback(request_data, db)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="지원하지 않는 결제 수단입니다."
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"결제 콜백 처리 중 오류: {str(e)}"
        )

async def handle_kakao_callback(request_data: Dict[str, Any], db: Session):
    """카카오페이 콜백 처리"""
    tid = request_data.get("tid")
    payment = db.query(Payment).filter(Payment.transaction_id == tid).first()
    
    if payment:
        payment.status = "completed"
        payment.approved_at = datetime.now()
        db.commit()
        
        # 주문 상태 업데이트
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "processing"
            order.payment_status = "completed"
            db.commit()
    
    return {"success": True, "message": "카카오페이 결제 완료"}

async def handle_naver_callback(request_data: Dict[str, Any], db: Session):
    """네이버페이 콜백 처리"""
    payment_id = request_data.get("payment_id")
    payment = db.query(Payment).filter(Payment.transaction_id == payment_id).first()
    
    if payment:
        payment.status = "completed"
        payment.approved_at = datetime.now()
        db.commit()
        
        # 주문 상태 업데이트
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "processing"
            order.payment_status = "completed"
            db.commit()
    
    return {"success": True, "message": "네이버페이 결제 완료"}

async def handle_inicis_callback(request_data: Dict[str, Any], db: Session):
    """이니시스 콜백 처리"""
    tid = request_data.get("tid")
    payment = db.query(Payment).filter(Payment.transaction_id == tid).first()
    
    if payment:
        payment.status = "completed"
        payment.approved_at = datetime.now()
        db.commit()
        
        # 주문 상태 업데이트
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "processing"
            order.payment_status = "completed"
            db.commit()
    
    return {"success": True, "message": "이니시스 결제 완료"}

async def handle_toss_callback(request_data: Dict[str, Any], db: Session):
    """토스페이 콜백 처리"""
    payment_key = request_data.get("paymentKey")
    payment = db.query(Payment).filter(Payment.payment_key == payment_key).first()
    
    if payment:
        payment.status = "completed"
        payment.approved_at = datetime.now()
        db.commit()
        
        # 주문 상태 업데이트
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "processing"
            order.payment_status = "completed"
            db.commit()
    
        return {"success": True, "message": "토스페이 결제 완료"}

@router.post("/approve/kakao")
async def approve_kakao_payment(
    tid: str,
    pg_token: str,
    partner_order_id: str,
    partner_user_id: str,
    db: Session = Depends(get_db)
):
    """카카오페이 결제 승인"""
    try:
        # 카카오페이 승인 API 호출
        approve_response = await payment_service.approve_kakao_payment(
            tid, pg_token, partner_order_id, partner_user_id
        )
        
        # 결제 정보 업데이트
        payment = db.query(Payment).filter(Payment.transaction_id == tid).first()
        if payment:
            payment.status = "completed"
            payment.approved_at = datetime.now()
            payment.payment_metadata = json.dumps(approve_response)
            db.commit()
            
            # 주문 상태 업데이트
            order = db.query(Order).filter(Order.id == payment.order_id).first()
            if order:
                order.status = "processing"
                order.payment_status = "completed"
                db.commit()
        
        return {"success": True, "message": "카카오페이 결제 승인 완료", "data": approve_response}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"카카오페이 결제 승인 중 오류: {str(e)}"
        )

@router.get("/methods", response_model=List[Dict[str, Any]])
async def get_payment_methods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자의 등록된 결제 수단 목록 조회"""
    try:
        methods = db.query(PaymentMethod).filter(
            PaymentMethod.user_id == current_user.id,
            PaymentMethod.is_active == True
        ).all()
        
        return [
            {
                "id": method.id,
                "method_type": method.method_type,
                "provider": method.provider,
                "name": method.name,
                "masked_info": method.masked_info,
                "is_default": method.is_default
            }
            for method in methods
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"결제 수단 조회 중 오류: {str(e)}"
        )
