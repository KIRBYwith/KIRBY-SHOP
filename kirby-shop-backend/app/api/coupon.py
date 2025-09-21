"""
쿠폰 관련 API 엔드포인트
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.services.coupon_service import CouponService
from app.schemas.coupon import (
    CouponCreate, CouponUpdate, CouponResponse, CouponApplyRequest, 
    CouponApplyResponse, CouponValidationResponse, UserCouponResponse,
    CouponRegisterRequest, CouponRegisterResponse
)
from app.utils.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api/coupons", tags=["coupons"])

@router.post("/", response_model=CouponResponse)
async def create_coupon(
    coupon_data: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """쿠폰 생성 (관리자 전용)"""
    coupon_service = CouponService(db)
    coupon = await coupon_service.create_coupon(coupon_data)
    return CouponResponse.model_validate(coupon)

@router.get("/", response_model=List[CouponResponse])
async def get_active_coupons(db: Session = Depends(get_db)):
    """활성 쿠폰 목록 조회"""
    coupon_service = CouponService(db)
    coupons = await coupon_service.get_active_coupons()
    return [CouponResponse.model_validate(coupon) for coupon in coupons]

@router.get("/{coupon_code}", response_model=CouponResponse)
async def get_coupon_by_code(
    coupon_code: str,
    db: Session = Depends(get_db)
):
    """쿠폰 코드로 쿠폰 조회"""
    coupon_service = CouponService(db)
    coupon = await coupon_service.get_coupon_by_code(coupon_code)
    return CouponResponse.model_validate(coupon)

@router.post("/validate", response_model=CouponValidationResponse)
async def validate_coupon(
    request: CouponApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """쿠폰 유효성 검증"""
    coupon_service = CouponService(db)
    validation = await coupon_service.validate_coupon(
        request.coupon_code, 
        current_user.id, 
        request.order_amount
    )
    return validation

@router.post("/apply", response_model=CouponApplyResponse)
async def apply_coupon(
    request: CouponApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """쿠폰 적용"""
    coupon_service = CouponService(db)
    result = await coupon_service.apply_coupon(
        current_user.id, 
        request.coupon_code, 
        request.order_amount
    )
    return CouponApplyResponse(**result)

@router.post("/issue/{coupon_id}")
async def issue_coupon_to_user(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """사용자에게 쿠폰 발급"""
    coupon_service = CouponService(db)
    user_coupon = await coupon_service.issue_coupon_to_user(current_user.id, coupon_id)
    return {"message": "쿠폰이 성공적으로 발급되었습니다", "user_coupon_id": user_coupon.id}

@router.get("/my-coupons", response_model=List[UserCouponResponse])
async def get_my_coupons(
    include_used: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """내 쿠폰 목록 조회"""
    coupon_service = CouponService(db)
    user_coupons = await coupon_service.get_user_coupons(current_user.id, include_used)
    return [UserCouponResponse.model_validate(user_coupon) for user_coupon in user_coupons]

@router.post("/use/{user_coupon_id}")
async def use_coupon(
    user_coupon_id: int,
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """쿠폰 사용"""
    coupon_service = CouponService(db)
    user_coupon = await coupon_service.use_coupon(user_coupon_id, current_user.id, order_id)
    return {"message": "쿠폰이 성공적으로 사용되었습니다", "user_coupon_id": user_coupon.id}

@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: int,
    coupon_data: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """쿠폰 수정 (관리자 전용)"""
    coupon_service = CouponService(db)
    coupon = await coupon_service.update_coupon(coupon_id, coupon_data)
    return CouponResponse.model_validate(coupon)

@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """쿠폰 삭제 (관리자 전용)"""
    coupon_service = CouponService(db)
    await coupon_service.delete_coupon(coupon_id)
    return {"message": "쿠폰이 성공적으로 삭제되었습니다"}

@router.post("/register", response_model=CouponRegisterResponse)
async def register_coupon(
    request: CouponRegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """쿠폰 번호로 쿠폰 등록 (취약점 포함)"""
    coupon_service = CouponService(db)
    result = await coupon_service.register_coupon_by_code(current_user.id, request.coupon_code)
    return result
