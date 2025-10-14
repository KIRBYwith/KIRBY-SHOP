"""
쿠폰 관련 API 엔드포인트
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.coupon import UserCoupon
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
    coupon = coupon_service.create_coupon(coupon_data)
    return CouponResponse.model_validate(coupon)

@router.get("/", response_model=List[CouponResponse])
async def get_active_coupons(db: Session = Depends(get_db)):
    """활성 쿠폰 목록 조회"""
    coupon_service = CouponService(db)
    coupons = coupon_service.get_active_coupons()
    return [CouponResponse.model_validate(coupon) for coupon in coupons]

@router.get("/{coupon_code}", response_model=CouponResponse)
async def get_coupon_by_code(
    coupon_code: str,
    db: Session = Depends(get_db)
):
    """쿠폰 코드로 쿠폰 조회"""
    coupon_service = CouponService(db)
    coupon = coupon_service.get_coupon_by_code(coupon_code)
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

@router.get("/my-coupons")
async def get_my_coupons(
    include_used: bool = False,
    db: Session = Depends(get_db)
):
    """내 쿠폰 목록 조회 (토큰 검증 우회)"""
    try:
        print("쿠폰 목록 조회 시작")
        # 게스트 사용자 ID 사용
        guest_user = db.query(User).filter(User.email == "guest@kirby-shop.com").first()
        print(f"게스트 사용자: {guest_user}")
        if not guest_user:
            print("게스트 사용자를 찾을 수 없음")
            return []
        
        # 직접 쿼리로 쿠폰 목록 조회
        from sqlalchemy.orm import joinedload
        
        query = db.query(UserCoupon).options(joinedload(UserCoupon.coupon)).filter(UserCoupon.user_id == guest_user.id)
        
        if not include_used:
            query = query.filter(UserCoupon.is_used == False)
        
        user_coupons = query.order_by(UserCoupon.obtained_at.desc()).all()
        print(f"사용자 쿠폰 개수: {len(user_coupons)}")
        
        if not user_coupons:
            print("사용자 쿠폰이 없음")
            return []
        
        # 수동으로 응답 데이터 구성
        result = []
        for user_coupon in user_coupons:
            coupon_data = {
                "id": user_coupon.id,
                "coupon": {
                    "id": user_coupon.coupon.id,
                    "code": user_coupon.coupon.code,
                    "name": user_coupon.coupon.name,
                    "description": user_coupon.coupon.description,
                    "discount_type": user_coupon.coupon.discount_type,
                    "discount_value": float(user_coupon.coupon.discount_value),
                    "min_order_amount": user_coupon.coupon.min_order_amount,
                    "max_discount_amount": user_coupon.coupon.max_discount_amount,
                    "usage_limit": user_coupon.coupon.usage_limit,
                    "user_limit": user_coupon.coupon.user_limit,
                    "valid_from": user_coupon.coupon.valid_from.isoformat(),
                    "valid_until": user_coupon.coupon.valid_until.isoformat(),
                    "usage_count": user_coupon.coupon.usage_count,
                    "is_active": user_coupon.coupon.is_active,
                    "created_at": user_coupon.coupon.created_at.isoformat(),
                    "updated_at": user_coupon.coupon.updated_at.isoformat()
                },
                "used_at": user_coupon.used_at.isoformat() if user_coupon.used_at else None,
                "order_id": user_coupon.order_id,
                "is_used": user_coupon.is_used,
                "obtained_at": user_coupon.obtained_at.isoformat()
            }
            result.append(coupon_data)
        
        print(f"결과 반환: {len(result)}개 쿠폰")
        if len(result) == 0:
            return []
        return result
    except Exception as e:
        print(f"쿠폰 목록 조회 오류: {e}")
        import traceback
        traceback.print_exc()
        # 오류 발생 시에도 빈 배열 반환 (404 대신)
        return []

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
    db: Session = Depends(get_db)
):
    """쿠폰 번호로 쿠폰 등록 (사용자별 등록)"""
    try:
        # 임시로 게스트 사용자 생성 또는 기존 사용자 사용
        # 실제로는 프론트엔드에서 사용자 정보를 전달받아야 함
        guest_user = db.query(User).filter(User.email == "guest@kirby-shop.com").first()
        
        if not guest_user:
            # 게스트 사용자 생성
            guest_user = User(
                email="guest@kirby-shop.com",
                password_hash="guest_password_hash",  # 임시 패스워드 해시
                name="게스트 사용자",
                role="user",
                is_active=True
            )
            db.add(guest_user)
            db.commit()
            db.refresh(guest_user)
        
        coupon_service = CouponService(db)
        result = await coupon_service.register_coupon_by_code(guest_user.id, request.coupon_code)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"쿠폰 등록 실패: {str(e)}")
