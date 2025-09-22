# src/api/toss_payments.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import json
import base64
from app.config import settings

router = APIRouter(prefix="/api/payments/toss", tags=["toss-payments"])

# 토스페이먼츠 결제위젯 테스트 설정 (결제위젯 연동 키)
TOSS_PAY_CONFIG = {
    "client_key": "test_ck_AQ92ymxN34dgjqjm4wyK3ajRKXvd",  # 결제위젯 클라이언트 키
    "secret_key": "test_sk_26DlbXAaV0MRmQ6RXeDxrqY50Q9R",  # 결제위젯 시크릿 키
    "base_url": "https://api.tosspayments.com/v1",
    "test_mode": True,  # 테스트 모드 활성화
    "widget_mode": True  # 결제위젯 모드 활성화
}

class TossPayPrepareRequest(BaseModel):
    amount: int
    orderId: str
    orderName: str
    customerName: str
    customerEmail: str
    successUrl: str
    failUrl: str

class TossPayConfirmRequest(BaseModel):
    paymentKey: str
    orderId: str
    amount: int

@router.post("/prepare")
async def prepare_toss_payment(request: TossPayPrepareRequest):
    """토스페이먼츠 결제 준비"""
    try:
        # 실제 토스페이먼츠 결제 준비 API 호출
        print(f"토스페이먼츠 결제 준비 요청 - {request.orderId}")
        
        # 토스페이먼츠 결제 준비 요청 데이터
        payment_data = {
            "orderId": request.orderId,
            "amount": request.amount,
            "orderName": request.orderName,
            "customerName": request.customerName,
            "customerEmail": request.customerEmail,
            "successUrl": "http://localhost:3000/payment/success",
            "failUrl": "http://localhost:3000/payment/fail",
            "cancelUrl": "http://localhost:3000/payment/cancel"
        }
        
        # 토스페이먼츠 결제위젯 API 호출
        url = f"{TOSS_PAY_CONFIG['base_url']}/payments"
        
        # 토스페이먼츠 결제위젯용 인증 헤더 (Base64 인코딩)
        import base64
        auth_string = f"{TOSS_PAY_CONFIG['secret_key']}:"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/json",
            "TossPayments-Server-Key": TOSS_PAY_CONFIG['secret_key']
        }
        
        # 실제 토스페이먼츠 API 호출
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payment_data)
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "paymentKey": result.get("paymentKey"),
                        "checkoutUrl": result.get("checkoutUrl"),
                        "orderId": request.orderId,
                        "amount": request.amount,
                        "orderName": request.orderName,
                        "customerName": request.customerName,
                        "customerEmail": request.customerEmail,
                        "createdAt": result.get("createdAt")
                    }
                else:
                    print(f"토스페이먼츠 API 오류: {response.status_code} - {response.text}")
                    # API 오류 시 실패 반환
                    return {
                        "success": False,
                        "error": f"토스페이먼츠 API 오류: {response.status_code}",
                        "message": "결제 준비에 실패했습니다."
                    }
        except Exception as e:
            print(f"토스페이먼츠 API 호출 오류: {str(e)}")
            # 네트워크 오류 시 실패 반환
            return {
                "success": False,
                "error": f"토스페이먼츠 API 호출 오류: {str(e)}",
                "message": "결제 준비 중 네트워크 오류가 발생했습니다."
            }
        
        # 실제 토스페이먼츠 API 호출 (실제 연동 시 사용)
        # try:
        #     import httpx
        #     import base64
        #     
        #     url = f"{TOSS_PAY_CONFIG['base_url']}/payments"
        #     
        #     headers = {
        #         "Authorization": f"Basic {base64.b64encode(f'{TOSS_PAY_CONFIG["secret_key"]}:'.encode()).decode()}",
        #         "Content-Type": "application/json"
        #     }
        #     
        #     data = {
        #         "amount": request.amount,
        #         "orderId": request.orderId,
        #         "orderName": request.orderName,
        #         "customerName": request.customerName,
        #         "customerEmail": request.customerEmail,
        #         "successUrl": "http://localhost:3000/payment/success",
        #         "failUrl": "http://localhost:3000/payment/fail"
        #     }
        #     
        #     async with httpx.AsyncClient() as client:
        #         response = await client.post(url, headers=headers, json=data)
        #         
        #         if response.status_code == 200:
        #             result = response.json()
        #             return {
        #                 "success": True,
        #                 "paymentKey": result.get("paymentKey"),
        #                 "checkoutUrl": result.get("checkoutUrl"),
        #                 "orderId": result.get("orderId"),
        #                 "amount": result.get("amount"),
        #                 "orderName": result.get("orderName"),
        #                 "customerName": result.get("customerName"),
        #                 "customerEmail": result.get("customerEmail"),
        #                 "createdAt": result.get("createdAt")
        #             }
        #         else:
        #             error_data = response.json()
        #             raise HTTPException(
        #                 status_code=response.status_code,
        #                 detail=f"토스페이먼츠 결제 준비 실패: {error_data.get('message', 'Unknown error')}"
        #             )
        #             
        # except Exception as e:
        #     print(f"토스페이먼츠 API 호출 실패: {e}")
        #     raise HTTPException(
        #         status_code=500,
        #         detail=f"토스페이먼츠 결제 준비 중 오류가 발생했습니다: {str(e)}"
        #     )
                
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 API 요청 실패: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 결제 준비 중 오류: {str(e)}")

@router.post("/confirm")
async def confirm_toss_payment(request: TossPayConfirmRequest):
    """토스페이먼츠 결제 승인"""
    try:
        # 테스트 모드일 때는 시뮬레이션 응답 반환
        if TOSS_PAY_CONFIG.get("test_mode", False):
            print(f"토스페이먼츠 테스트 모드: 결제 승인 요청 - {request.paymentKey}")
            return {
                "success": True,
                "paymentKey": request.paymentKey,
                "orderId": request.orderId,
                "amount": request.amount,
                "status": "DONE",
                "approvedAt": "2024-01-01T00:00:00",
                "method": "카드",
                "card": {
                    "number": "4242-4242-4242-4242",
                    "type": "신용",
                    "company": "토스페이먼츠"
                }
            }
        
        # 실제 토스페이먼츠 결제 승인 API 호출
        url = f"{TOSS_PAY_CONFIG['base_url']}/payments/confirm"
        
        headers = {
            "Authorization": f"Basic {base64.b64encode(f'{TOSS_PAY_CONFIG["secret_key"]}:'.encode()).decode()}",
            "Content-Type": "application/json"
        }
        
        data = {
            "paymentKey": request.paymentKey,
            "orderId": request.orderId,
            "amount": request.amount
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "paymentKey": result.get("paymentKey"),
                    "orderId": result.get("orderId"),
                    "amount": result.get("totalAmount"),
                    "status": result.get("status"),
                    "approvedAt": result.get("approvedAt"),
                    "method": result.get("method"),
                    "card": result.get("card")
                }
            else:
                error_data = response.json()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"토스페이먼츠 결제 승인 실패: {error_data.get('message', 'Unknown error')}"
                )
                
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 API 요청 실패: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 결제 승인 중 오류: {str(e)}")

@router.post("/cancel")
async def cancel_toss_payment(paymentKey: str, cancelReason: str, cancelAmount: Optional[int] = None):
    """토스페이먼츠 결제 취소"""
    try:
        # 테스트 모드일 때는 시뮬레이션 응답 반환
        if TOSS_PAY_CONFIG.get("test_mode", False):
            print(f"토스페이먼츠 테스트 모드: 결제 취소 요청 - {paymentKey}")
            return {
                "success": True,
                "paymentKey": paymentKey,
                "status": "CANCELED",
                "canceledAt": "2024-01-01T00:00:00",
                "cancelReason": cancelReason,
                "cancelAmount": cancelAmount
            }
        
        # 실제 토스페이먼츠 결제 취소 API 호출
        url = f"{TOSS_PAY_CONFIG['base_url']}/payments/{paymentKey}/cancel"
        
        headers = {
            "Authorization": f"Basic {base64.b64encode(f'{TOSS_PAY_CONFIG["secret_key"]}:'.encode()).decode()}",
            "Content-Type": "application/json"
        }
        
        data = {
            "cancelReason": cancelReason
        }
        
        if cancelAmount:
            data["cancelAmount"] = cancelAmount
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "paymentKey": result.get("paymentKey"),
                    "status": result.get("status"),
                    "canceledAt": result.get("canceledAt"),
                    "cancelReason": result.get("cancelReason"),
                    "cancelAmount": result.get("cancelAmount")
                }
            else:
                error_data = response.json()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"토스페이먼츠 결제 취소 실패: {error_data.get('message', 'Unknown error')}"
                )
                
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 API 요청 실패: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 결제 취소 중 오류: {str(e)}")

@router.get("/status/{paymentKey}")
async def get_toss_payment_status(paymentKey: str):
    """토스페이먼츠 결제 상태 조회"""
    try:
        # 테스트 모드일 때는 시뮬레이션 응답 반환
        if TOSS_PAY_CONFIG.get("test_mode", False):
            print(f"토스페이먼츠 테스트 모드: 결제 상태 조회 - {paymentKey}")
            return {
                "success": True,
                "paymentKey": paymentKey,
                "status": "DONE",
                "orderId": f"ORDER_{paymentKey}",
                "amount": 1000,
                "orderName": "커비 상품",
                "customerName": "고객",
                "customerEmail": "customer@example.com",
                "approvedAt": "2024-01-01T00:00:00",
                "method": "카드"
            }
        
        # 실제 토스페이먼츠 결제 상태 조회 API 호출
        url = f"{TOSS_PAY_CONFIG['base_url']}/payments/{paymentKey}"
        
        headers = {
            "Authorization": f"Basic {base64.b64encode(f'{TOSS_PAY_CONFIG["secret_key"]}:'.encode()).decode()}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "paymentKey": result.get("paymentKey"),
                    "status": result.get("status"),
                    "orderId": result.get("orderId"),
                    "amount": result.get("totalAmount"),
                    "orderName": result.get("orderName"),
                    "customerName": result.get("customerName"),
                    "customerEmail": result.get("customerEmail"),
                    "approvedAt": result.get("approvedAt"),
                    "method": result.get("method")
                }
            else:
                error_data = response.json()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"토스페이먼츠 결제 상태 조회 실패: {error_data.get('message', 'Unknown error')}"
                )
                
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 API 요청 실패: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"토스페이먼츠 결제 상태 조회 중 오류: {str(e)}")
