#!/usr/bin/env python3
"""
데이터베이스 테이블 자동 생성 스크립트
SQLAlchemy 모델을 기반으로 MySQL 데이터베이스에 테이블을 생성합니다.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import (
    User, Product, CartItem, Order, OrderItem, WishlistItem, 
    Coupon, UserCoupon, QnA, QnAAnswer, Review, ReviewHelpful, 
    Payment, PaymentMethod, SystemSetting
)

def create_all_tables():
    """모든 테이블을 생성합니다."""
    try:
        print("🗄️  데이터베이스 테이블 생성 중...")
        
        # 모든 모델을 임포트하여 Base.metadata에 등록
        Base.metadata.create_all(bind=engine)
        
        print("✅ 모든 테이블이 성공적으로 생성되었습니다!")
        
        # 생성된 테이블 목록 출력
        print("\n📋 생성된 테이블 목록:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ 테이블 생성 중 오류 발생: {e}")
        return False
    
    return True

def show_table_info():
    """테이블 정보를 출력합니다."""
    print("\n🔍 테이블 구조 정보:")
    for table_name, table in Base.metadata.tables.items():
        print(f"\n📊 {table_name}:")
        for column in table.columns:
            print(f"  - {column.name}: {column.type} {'(PK)' if column.primary_key else ''} {'(FK)' if column.foreign_keys else ''}")

def create_indexes():
    """추가 인덱스를 생성합니다."""
    try:
        print("\n🔍 인덱스 생성 중...")
        
        # MySQL 특화 인덱스 생성
        from sqlalchemy import text
        
        with engine.connect() as conn:
            # 사용자 이메일 인덱스
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"))
            
            # 상품 카테고리 인덱스
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)"))
            
            # 주문 상태 인덱스
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)"))
            
            # QnA 상태 인덱스
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_qnas_status ON qnas(status)"))
            
            # 리뷰 평점 인덱스
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)"))
            
            # 결제 상태 인덱스
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)"))
            
            conn.commit()
            
        print("✅ 인덱스가 성공적으로 생성되었습니다!")
        
    except Exception as e:
        print(f"⚠️  인덱스 생성 중 오류 발생 (무시 가능): {e}")

def verify_tables():
    """테이블 생성 확인"""
    try:
        print("\n🔍 테이블 생성 확인 중...")
        
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            
            expected_tables = [
                'users', 'products', 'cart_items', 'orders', 'order_items',
                'wishlist_items', 'coupons', 'user_coupons', 'qnas', 'qna_answers',
                'reviews', 'review_helpful', 'payments', 'payment_methods', 'system_settings'
            ]
            
            print(f"\n📊 생성된 테이블: {len(tables)}개")
            for table in expected_tables:
                if table in tables:
                    print(f"  ✅ {table}")
                else:
                    print(f"  ❌ {table} (누락)")
                    
            missing_tables = [t for t in expected_tables if t not in tables]
            if missing_tables:
                print(f"\n⚠️  누락된 테이블: {missing_tables}")
                return False
            else:
                print("\n🎉 모든 테이블이 정상적으로 생성되었습니다!")
                return True
                
    except Exception as e:
        print(f"❌ 테이블 확인 중 오류 발생: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Kirby Shop 데이터베이스 스키마 생성기")
    print("=" * 50)
    
    if create_all_tables():
        show_table_info()
        create_indexes()
        
        if verify_tables():
            print("\n🎉 데이터베이스 설정이 완료되었습니다!")
            print("\n📝 다음 단계:")
            print("  1. python create_admin_user.py  # 관리자 계정 생성")
            print("  2. python create_default_coupons.py  # 기본 쿠폰 생성")
            print("  3. python run.py  # 서버 실행")
        else:
            print("\n⚠️  일부 테이블이 누락되었습니다.")
    else:
        print("\n💥 데이터베이스 설정에 실패했습니다.")
        sys.exit(1)
