#!/usr/bin/env python3
"""
기본 쿠폰 데이터 생성 스크립트
"""

import sys
import os
from datetime import datetime, timedelta

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.database import get_db
from app.models.coupon import Coupon

def create_default_coupons():
    """기본 쿠폰 데이터 생성"""
    print("🎫 기본 쿠폰 데이터 생성 중...")
    
    db = next(get_db())
    
    # 기본 쿠폰들
    default_coupons = [
        {
            "code": "WELCOME20",
            "name": "신규회원 20% 할인쿠폰",
            "description": "신규 회원을 위한 특별 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 20.0,
            "min_order_amount": 10000,
            "max_discount_amount": 50000,
            "usage_limit": 1000,
            "usage_count": 0,
            "user_limit": 1,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=30)
        },
        {
            "code": "FREESHIP",
            "name": "무료배송 쿠폰",
            "description": "배송비 무료 쿠폰입니다.",
            "discount_type": "shipping",
            "discount_value": 3000.0,
            "min_order_amount": 20000,
            "max_discount_amount": 3000,
            "usage_limit": 500,
            "usage_count": 0,
            "user_limit": 1,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=15)
        },
        {
            "code": "FIXED5000",
            "name": "5,000원 할인쿠폰",
            "description": "5,000원 정액 할인 쿠폰입니다.",
            "discount_type": "fixed_amount",
            "discount_value": 5000.0,
            "min_order_amount": 30000,
            "max_discount_amount": 5000,
            "usage_limit": 300,
            "usage_count": 0,
            "user_limit": 1,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=20)
        },
        {
            "code": "PLUSH30",
            "name": "플러시 상품 30% 할인",
            "description": "플러시 상품 전용 30% 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 30.0,
            "min_order_amount": 50000,
            "max_discount_amount": 100000,
            "usage_limit": 100,
            "usage_count": 0,
            "user_limit": 1,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=10)
        },
        {
            "code": "BIRTHDAY50",
            "name": "생일 특별 50% 할인",
            "description": "생일을 축하하는 특별 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 50.0,
            "min_order_amount": 100000,
            "max_discount_amount": 200000,
            "usage_limit": 50,
            "usage_count": 0,
            "user_limit": 1,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=7)
        },
        {
            "code": "MASTER99",
            "name": "마스터 99% 할인쿠폰",
            "description": "마스터 등급 전용 99% 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 99.0,
            "min_order_amount": 1000,
            "max_discount_amount": 999999,
            "usage_limit": 999999,
            "usage_count": 0,
            "user_limit": 999,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=365)
        },
        {
            "code": "UNLIMITED",
            "name": "무제한 사용 쿠폰",
            "description": "무제한으로 사용할 수 있는 특별 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 50.0,
            "min_order_amount": 5000,
            "max_discount_amount": 100000,
            "usage_limit": 999999,
            "usage_count": 0,
            "user_limit": 999,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=365)
        },
        {
            "code": "ADMIN2024",
            "name": "관리자 전용 쿠폰",
            "description": "관리자 전용 특별 할인 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 80.0,
            "min_order_amount": 10000,
            "max_discount_amount": 500000,
            "usage_limit": 999999,
            "usage_count": 0,
            "user_limit": 999,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=365)
        },
        {
            "code": "KIRBYLOVE",
            "name": "커비 러브 이벤트 쿠폰",
            "description": "커비를 사랑하는 모든 분들을 위한 특별 쿠폰입니다.",
            "discount_type": "percentage",
            "discount_value": 25.0,
            "min_order_amount": 20000,
            "max_discount_amount": 75000,
            "usage_limit": 999999,
            "usage_count": 0,
            "user_limit": 999,
            "is_active": True,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(days=365)
        }
    ]
    
    created_count = 0
    
    for coupon_data in default_coupons:
        # 이미 존재하는 쿠폰인지 확인
        existing_coupon = db.query(Coupon).filter(Coupon.code == coupon_data["code"]).first()
        
        if not existing_coupon:
            coupon = Coupon(**coupon_data)
            db.add(coupon)
            created_count += 1
            print(f"✅ 쿠폰 생성: {coupon_data['code']} - {coupon_data['name']}")
        else:
            print(f"⚠️  쿠폰 이미 존재: {coupon_data['code']}")
    
    db.commit()
    print(f"\n🎉 총 {created_count}개의 쿠폰이 생성되었습니다!")
    
    # 생성된 쿠폰 목록 출력
    print("\n📋 생성된 쿠폰 목록:")
    coupons = db.query(Coupon).all()
    for coupon in coupons:
        print(f"  - {coupon.code}: {coupon.name} ({coupon.discount_value}% 할인)")
    
    db.close()

if __name__ == "__main__":
    create_default_coupons()
