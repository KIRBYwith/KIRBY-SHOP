#!/usr/bin/env python3
"""
기본 쿠폰들을 데이터베이스에 생성하는 스크립트
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from decimal import Decimal

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.config import settings
from app.models.coupon import Coupon
from app.database import Base

# 데이터베이스 연결
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_default_coupons():
    """기본 쿠폰들을 생성합니다."""
    db = SessionLocal()
    
    try:
        # 기본 쿠폰 데이터
        default_coupons = [
            {
                'code': 'WELCOME20',
                'name': '신규회원 20% 할인',
                'description': '신규 회원을 위한 특별 할인 쿠폰입니다.',
                'discount_type': 'percentage',
                'discount_value': Decimal('20.00'),
                'min_order_amount': Decimal('30000.00'),
                'max_discount_amount': Decimal('10000.00'),
                'usage_limit': 100,
                'usage_count': 0,
                'user_limit': 1,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=365),
                'is_active': True
            },
            {
                'code': 'FREESHIP',
                'name': '무료배송 쿠폰',
                'description': '배송비 무료 쿠폰입니다.',
                'discount_type': 'fixed_amount',
                'discount_value': Decimal('3000.00'),
                'min_order_amount': Decimal('20000.00'),
                'max_discount_amount': Decimal('3000.00'),
                'usage_limit': 200,
                'usage_count': 0,
                'user_limit': 1,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=180),
                'is_active': True
            },
            {
                'code': 'FIXED5000',
                'name': '5천원 할인 쿠폰',
                'description': '5만원 이상 구매 시 5천원 할인',
                'discount_type': 'fixed_amount',
                'discount_value': Decimal('5000.00'),
                'min_order_amount': Decimal('50000.00'),
                'max_discount_amount': Decimal('5000.00'),
                'usage_limit': 50,
                'usage_count': 0,
                'user_limit': 1,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=90),
                'is_active': True
            },
            {
                'code': 'PLUSH30',
                'name': '플러시 30% 할인',
                'description': '플러시 상품 30% 할인 쿠폰',
                'discount_type': 'percentage',
                'discount_value': Decimal('30.00'),
                'min_order_amount': Decimal('40000.00'),
                'max_discount_amount': Decimal('15000.00'),
                'usage_limit': 30,
                'usage_count': 0,
                'user_limit': 1,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=60),
                'is_active': True
            },
            {
                'code': 'BIRTHDAY50',
                'name': '생일 특별 50% 할인',
                'description': '생일을 축하하는 특별 할인 쿠폰',
                'discount_type': 'percentage',
                'discount_value': Decimal('50.00'),
                'min_order_amount': Decimal('10000.00'),
                'max_discount_amount': Decimal('20000.00'),
                'usage_limit': 1,
                'usage_count': 0,
                'user_limit': 1,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=30),
                'is_active': True
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for coupon_data in default_coupons:
            # 기존 쿠폰 확인
            existing_coupon = db.query(Coupon).filter(Coupon.code == coupon_data['code']).first()
            
            if existing_coupon:
                print(f"쿠폰 {coupon_data['code']} 이미 존재합니다.")
                updated_count += 1
            else:
                # 새 쿠폰 생성
                coupon = Coupon(**coupon_data)
                db.add(coupon)
                print(f"쿠폰 {coupon_data['code']} 생성 완료: {coupon_data['name']}")
                created_count += 1
        
        db.commit()
        print(f"\n✅ 쿠폰 생성 완료!")
        print(f"   - 새로 생성된 쿠폰: {created_count}개")
        print(f"   - 이미 존재하는 쿠폰: {updated_count}개")
        print(f"   - 총 쿠폰 수: {len(default_coupons)}개")
        
        # 생성된 쿠폰 목록 출력
        print(f"\n📋 생성된 쿠폰 목록:")
        for coupon_data in default_coupons:
            print(f"   - {coupon_data['code']}: {coupon_data['name']}")
        
    except Exception as e:
        print(f"❌ 쿠폰 생성 중 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🎫 기본 쿠폰 생성 스크립트 시작...")
    create_default_coupons()
    print("🎫 스크립트 완료!")

