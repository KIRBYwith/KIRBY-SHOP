"""
쿠폰 관련 비즈니스 로직
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from app.models.coupon import Coupon, UserCoupon
from app.models.user import User
from app.schemas.coupon import CouponCreate, CouponUpdate, CouponApplyRequest, CouponValidationResponse, CouponRegisterRequest, CouponRegisterResponse
from app.utils.cache import cache_manager, get_coupon_cache_key

class CouponService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_coupon(self, coupon_data: CouponCreate) -> Coupon:
        """쿠폰 생성 (관리자 전용)"""
        # 쿠폰 코드 중복 확인
        existing_coupon = self.db.query(Coupon).filter(Coupon.code == coupon_data.code).first()
        if existing_coupon:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 존재하는 쿠폰 코드입니다"
            )
        
        # 유효성 검증
        if coupon_data.valid_from >= coupon_data.valid_until:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="유효 기간이 올바르지 않습니다"
            )
        
        if coupon_data.discount_type == "percentage" and coupon_data.discount_value > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="할인율은 100%를 초과할 수 없습니다"
            )
        
        coupon = Coupon(**coupon_data.dict())
        self.db.add(coupon)
        self.db.commit()
        self.db.refresh(coupon)
        
        # 캐시 무효화
        await cache_manager.delete(f"coupons:*")
        
        return coupon
    
    async def get_coupon_by_code(self, code: str) -> Coupon:
        """쿠폰 코드로 쿠폰 조회"""
        # 캐시에서 먼저 확인
        cache_key = get_coupon_cache_key(code)
        cached_coupon = await cache_manager.get(cache_key)
        if cached_coupon:
            return cached_coupon
        
        coupon = self.db.query(Coupon).filter(Coupon.code == code).first()
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="쿠폰을 찾을 수 없습니다"
            )
        
        # 캐시에 저장 (30분)
        await cache_manager.set(cache_key, coupon, 1800)
        
        return coupon
    
    async def get_active_coupons(self) -> List[Coupon]:
        """활성 쿠폰 목록 조회"""
        now = datetime.now()
        coupons = self.db.query(Coupon).filter(
            and_(
                Coupon.is_active == True,
                Coupon.valid_from <= now,
                Coupon.valid_until >= now
            )
        ).order_by(Coupon.created_at.desc()).all()
        
        return coupons
    
    async def validate_coupon(self, code: str, user_id: int, order_amount: int) -> CouponValidationResponse:
        """쿠폰 유효성 검증"""
        try:
            coupon = await self.get_coupon_by_code(code)
        except HTTPException:
            return CouponValidationResponse(
                is_valid=False,
                message="존재하지 않는 쿠폰입니다"
            )
        
        now = datetime.now()
        
        # 기본 유효성 검증
        if not coupon.is_active:
            return CouponValidationResponse(
                is_valid=False,
                message="비활성화된 쿠폰입니다"
            )
        
        if now < coupon.valid_from:
            return CouponValidationResponse(
                is_valid=False,
                message="아직 사용할 수 없는 쿠폰입니다"
            )
        
        if now > coupon.valid_until:
            return CouponValidationResponse(
                is_valid=False,
                message="만료된 쿠폰입니다"
            )
        
        # 사용 횟수 제한 확인
        if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
            return CouponValidationResponse(
                is_valid=False,
                message="쿠폰 사용 한도를 초과했습니다"
            )
        
        # 최소 주문 금액 확인
        if order_amount < coupon.min_order_amount:
            return CouponValidationResponse(
                is_valid=False,
                message=f"최소 주문 금액 {coupon.min_order_amount:,}원 이상이 필요합니다"
            )
        
        # 사용자별 사용 횟수 확인
        user_coupon_count = self.db.query(UserCoupon).filter(
            and_(
                UserCoupon.user_id == user_id,
                UserCoupon.coupon_id == coupon.id,
                UserCoupon.is_used == True
            )
        ).count()
        
        if user_coupon_count >= coupon.user_limit:
            return CouponValidationResponse(
                is_valid=False,
                message=f"사용자당 최대 {coupon.user_limit}회까지만 사용 가능합니다"
            )
        
        # 할인 금액 계산
        discount_amount = self._calculate_discount_amount(coupon, order_amount)
        
        return CouponValidationResponse(
            is_valid=True,
            message="사용 가능한 쿠폰입니다",
            discount_amount=discount_amount
        )
    
    def _calculate_discount_amount(self, coupon: Coupon, order_amount: int) -> int:
        """할인 금액 계산"""
        if coupon.discount_type == "percentage":
            discount_amount = int(order_amount * (coupon.discount_value / 100))
        else:  # fixed_amount
            discount_amount = int(coupon.discount_value)
        
        # 최대 할인 금액 제한
        if coupon.max_discount_amount and discount_amount > coupon.max_discount_amount:
            discount_amount = coupon.max_discount_amount
        
        return discount_amount
    
    async def apply_coupon(self, user_id: int, coupon_code: str, order_amount: int) -> dict:
        """쿠폰 적용"""
        validation = await self.validate_coupon(coupon_code, user_id, order_amount)
        
        if not validation.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation.message
            )
        
        coupon = await self.get_coupon_by_code(coupon_code)
        discount_amount = validation.discount_amount
        final_amount = order_amount - discount_amount
        
        return {
            "coupon": coupon,
            "discount_amount": discount_amount,
            "final_amount": final_amount,
            "is_applicable": True,
            "message": "쿠폰이 성공적으로 적용되었습니다"
        }
    
    async def issue_coupon_to_user(self, user_id: int, coupon_id: int) -> UserCoupon:
        """사용자에게 쿠폰 발급"""
        # 쿠폰 존재 확인
        coupon = self.db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="쿠폰을 찾을 수 없습니다"
            )
        
        # 이미 발급된 쿠폰인지 확인
        existing_user_coupon = self.db.query(UserCoupon).filter(
            and_(
                UserCoupon.user_id == user_id,
                UserCoupon.coupon_id == coupon_id,
                UserCoupon.is_used == False
            )
        ).first()
        
        if existing_user_coupon:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 발급받은 쿠폰입니다"
            )
        
        user_coupon = UserCoupon(
            user_id=user_id,
            coupon_id=coupon_id
        )
        
        self.db.add(user_coupon)
        self.db.commit()
        self.db.refresh(user_coupon)
        
        return user_coupon
    
    async def get_user_coupons(self, user_id: int, include_used: bool = False) -> List[UserCoupon]:
        """사용자 쿠폰 목록 조회"""
        from sqlalchemy.orm import joinedload
        
        query = self.db.query(UserCoupon).options(joinedload(UserCoupon.coupon)).filter(UserCoupon.user_id == user_id)
        
        if not include_used:
            query = query.filter(UserCoupon.is_used == False)
        
        return query.order_by(UserCoupon.obtained_at.desc()).all()
    
    async def use_coupon(self, user_coupon_id: int, user_id: int, order_id: str) -> UserCoupon:
        """쿠폰 사용"""
        user_coupon = self.db.query(UserCoupon).filter(
            and_(
                UserCoupon.id == user_coupon_id,
                UserCoupon.user_id == user_id,
                UserCoupon.is_used == False
            )
        ).first()
        
        if not user_coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용할 수 있는 쿠폰을 찾을 수 없습니다"
            )
        
        # 쿠폰 사용 처리
        user_coupon.is_used = True
        user_coupon.used_at = datetime.now()
        user_coupon.order_id = order_id
        
        # 쿠폰 사용 횟수 증가
        coupon = user_coupon.coupon
        coupon.usage_count += 1
        
        self.db.commit()
        self.db.refresh(user_coupon)
        
        # 캐시 무효화
        await cache_manager.delete(get_coupon_cache_key(coupon.code))
        
        return user_coupon
    
    async def update_coupon(self, coupon_id: int, coupon_data: CouponUpdate) -> Coupon:
        """쿠폰 수정 (관리자 전용)"""
        coupon = self.db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="쿠폰을 찾을 수 없습니다"
            )
        
        update_data = coupon_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(coupon, field, value)
        
        self.db.commit()
        self.db.refresh(coupon)
        
        # 캐시 무효화
        await cache_manager.delete(get_coupon_cache_key(coupon.code))
        
        return coupon
    
    async def delete_coupon(self, coupon_id: int) -> bool:
        """쿠폰 삭제 (관리자 전용)"""
        coupon = self.db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="쿠폰을 찾을 수 없습니다"
            )
        
        # 사용된 쿠폰이 있는지 확인
        used_count = self.db.query(UserCoupon).filter(UserCoupon.coupon_id == coupon_id).count()
        if used_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="사용된 쿠폰은 삭제할 수 없습니다"
            )
        
        self.db.delete(coupon)
        self.db.commit()
        
        # 캐시 무효화
        await cache_manager.delete(get_coupon_cache_key(coupon.code))
        
        return True
    
    async def register_coupon_by_code(self, user_id: int, coupon_code: str) -> CouponRegisterResponse:
        """쿠폰 번호로 쿠폰 등록"""
        coupon_code = coupon_code.upper().strip()
        
        try:
            # 데이터베이스에서 쿠폰 찾기
            coupon = self.db.query(Coupon).filter(Coupon.code == coupon_code).first()
            
            if not coupon:
                return CouponRegisterResponse(
                    success=False,
                    message="쿠폰을 찾을 수 없습니다. 쿠폰 번호를 확인해주세요."
                )
            
            if not coupon.is_active:
                return CouponRegisterResponse(
                    success=False,
                    message="비활성화된 쿠폰입니다."
                )
            
            # 쿠폰 등록은 자유롭게 허용 (프론트엔드에서 중복 관리)
            # 백엔드에서는 단순히 쿠폰 정보만 반환
            
            # 사용자 쿠폰 등록
            user_coupon = UserCoupon(
                user_id=user_id,
                coupon_id=coupon.id,
                obtained_at=datetime.now(),
                is_used=False
            )
            
            self.db.add(user_coupon)
            self.db.commit()
            
            return CouponRegisterResponse(
                success=True,
                message=f"{coupon.name}이 성공적으로 등록되었습니다!",
                coupon_code=coupon.code,
                coupon_name=coupon.name,
                coupon_description=coupon.description,
                discount_type=coupon.discount_type,
                discount_value=coupon.discount_value,
                min_order_amount=coupon.min_order_amount,
                max_discount_amount=coupon.max_discount_amount,
                valid_from=coupon.valid_from.isoformat() if coupon.valid_from else None,
                valid_until=coupon.valid_until.isoformat() if coupon.valid_until else None,
                usage_limit=coupon.usage_limit
            )
            
        except Exception as e:
            self.db.rollback()
            return CouponRegisterResponse(
                success=False,
                message=f"쿠폰 등록 중 오류가 발생했습니다: {str(e)}"
            )
    
    async def _create_custom_coupon(self, user_id: int, code: str, name: str, discount_value: int, discount_type: str) -> CouponRegisterResponse:
        """커스텀 쿠폰 생성 (취약점)"""
        try:
            # 기존 쿠폰이 있는지 확인
            existing_coupon = self.db.query(Coupon).filter(Coupon.code == code).first()
            
            if not existing_coupon:
                # 새 쿠폰 생성 (취약점: 매우 긴 유효기간과 높은 사용 횟수)
                coupon_data = CouponCreate(
                    code=code,
                    name=f"{name} {code}",
                    description="특별 제작 쿠폰",
                    discount_type=discount_type,
                    discount_value=Decimal(discount_value),
                    min_order_amount=0,
                    max_discount_amount=999999,
                    usage_limit=999,  # 취약점: 매우 높은 사용 횟수
                    user_limit=999,
                    valid_from=datetime.now(),
                    valid_until=datetime(2030, 12, 31)  # 취약점: 매우 긴 유효기간
                )
                coupon = await self.create_coupon(coupon_data)
            else:
                coupon = existing_coupon
            
            # 사용자에게 쿠폰 발급
            user_coupon = await self.issue_coupon_to_user(user_id, coupon.id)
            
            return CouponRegisterResponse(
                success=True,
                message=f"커스텀 쿠폰 {code}이 등록되었습니다!",
                coupon=coupon
            )
            
        except Exception as e:
            return CouponRegisterResponse(
                success=False,
                message=f"쿠폰 등록 중 오류가 발생했습니다: {str(e)}"
            )
    
    async def _create_unlimited_coupon(self, user_id: int, code: str, discount_value: int) -> CouponRegisterResponse:
        """무제한 쿠폰 생성 (취약점)"""
        try:
            existing_coupon = self.db.query(Coupon).filter(Coupon.code == code).first()
            
            if not existing_coupon:
                coupon_data = CouponCreate(
                    code=code,
                    name=f"무제한 쿠폰 {code}",
                    description="무제한 사용 가능한 특별 쿠폰",
                    discount_type="percentage",
                    discount_value=Decimal(discount_value),
                    min_order_amount=0,
                    max_discount_amount=999999,
                    usage_limit=999999,  # 취약점: 거의 무제한 사용 횟수
                    user_limit=999999,
                    valid_from=datetime.now(),
                    valid_until=datetime(2099, 12, 31)  # 취약점: 거의 무제한 유효기간
                )
                coupon = await self.create_coupon(coupon_data)
            else:
                coupon = existing_coupon
            
            user_coupon = await self.issue_coupon_to_user(user_id, coupon.id)
            
            return CouponRegisterResponse(
                success=True,
                message=f"무제한 쿠폰 {code}이 등록되었습니다!",
                coupon=coupon
            )
            
        except Exception as e:
            return CouponRegisterResponse(
                success=False,
                message=f"쿠폰 등록 중 오류가 발생했습니다: {str(e)}"
            )
    
    async def _create_numeric_coupon(self, user_id: int, code: str, discount_amount: int) -> CouponRegisterResponse:
        """숫자 쿠폰 생성 (취약점)"""
        try:
            coupon_id = f"NUM{code}"
            existing_coupon = self.db.query(Coupon).filter(Coupon.code == coupon_id).first()
            
            if not existing_coupon:
                coupon_data = CouponCreate(
                    code=coupon_id,
                    name=f"숫자 쿠폰 {code}",
                    description="숫자 패턴 쿠폰",
                    discount_type="fixed_amount",
                    discount_value=Decimal(discount_amount),
                    min_order_amount=0,
                    max_discount_amount=50000,
                    usage_limit=10,
                    user_limit=5,
                    valid_from=datetime.now(),
                    valid_until=datetime(2025, 12, 31)
                )
                coupon = await self.create_coupon(coupon_data)
            else:
                coupon = existing_coupon
            
            user_coupon = await self.issue_coupon_to_user(user_id, coupon.id)
            
            return CouponRegisterResponse(
                success=True,
                message=f"숫자 쿠폰 NUM{code}이 등록되었습니다!",
                coupon=coupon
            )
            
        except Exception as e:
            return CouponRegisterResponse(
                success=False,
                message=f"쿠폰 등록 중 오류가 발생했습니다: {str(e)}"
            )
