#!/usr/bin/env python3
"""
샘플 쿠폰 데이터 생성 스크립트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.models.coupon import Coupon
from datetime import datetime, timedelta

def create_sample_coupons():
    """샘플 쿠폰 데이터 생성"""
    db = next(get_db())
    
    # 기존 쿠폰 확인
    existing_coupons = db.query(Coupon).all()
    print(f"기존 쿠폰 수: {len(existing_coupons)}")
    for coupon in existing_coupons:
        print(f"- {coupon.code}: {coupon.name}")
    
    # 기존 쿠폰 코드 목록
    existing_codes = [coupon.code for coupon in existing_coupons]
    
    # 샘플 쿠폰 데이터
    sample_coupons = [
        {
            "code": "WELCOME20",
            "name": "신규 회원 20% 할인",
            "description": "신규 회원을 위한 특별 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_order_amount": 10000,
            "max_discount_amount": 5000,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=30),
            "usage_limit": 1,
            "is_active": True
        },
        {
            "code": "FREESHIP",
            "name": "무료배송 쿠폰",
            "description": "배송비 무료 쿠폰입니다.",
            "discount_type": "free_shipping",
            "discount_value": 0,
            "min_order_amount": 30000,
            "max_discount_amount": 3000,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=15),
            "usage_limit": 1,
            "is_active": True
        },
        {
            "code": "FIXED5000",
            "name": "5,000원 할인 쿠폰",
            "description": "5,000원 즉시 할인 쿠폰입니다.",
            "discount_type": "fixed",
            "discount_value": 5000,
            "min_order_amount": 20000,
            "max_discount_amount": 5000,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=7),
            "usage_limit": 1,
            "is_active": True
        },
        {
            "code": "PLUSH30",
            "name": "플러시 상품 30% 할인",
            "description": "플러시 상품 전용 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 30,
            "min_order_amount": 50000,
            "max_discount_amount": 10000,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=20),
            "usage_limit": 1,
            "is_active": True
        },
        {
            "code": "BIRTHDAY50",
            "name": "생일 특별 50% 할인",
            "description": "생일을 축하하는 특별 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 50,
            "min_order_amount": 100000,
            "max_discount_amount": 20000,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=10),
            "usage_limit": 1,
            "is_active": True
        }
    ]
    
    # 쿠폰 생성 (중복 제외)
    new_coupons = []
    for coupon_data in sample_coupons:
        if coupon_data["code"] not in existing_codes:
            coupon = Coupon(**coupon_data)
            db.add(coupon)
            new_coupons.append(coupon_data["code"])
    
    db.commit()
    print(f"✅ {len(new_coupons)}개의 새 쿠폰이 생성되었습니다: {', '.join(new_coupons)}")
    
    # 생성된 쿠폰 확인
    coupons = db.query(Coupon).all()
    print("\n📋 생성된 쿠폰 목록:")
    for coupon in coupons:
        print(f"- {coupon.code}: {coupon.name} ({coupon.discount_type}, {coupon.discount_value})")

if __name__ == "__main__":
    create_sample_coupons()
