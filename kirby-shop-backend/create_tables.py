#!/usr/bin/env python3
"""
데이터베이스 테이블 자동 생성 스크립트
SQLAlchemy 모델을 기반으로 MySQL 데이터베이스에 테이블을 생성합니다.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import user, product, order, cart, coupon, payment, qna, review, wishlist

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

if __name__ == "__main__":
    print("🚀 Kirby Shop 데이터베이스 스키마 생성기")
    print("=" * 50)
    
    if create_all_tables():
        show_table_info()
        print("\n🎉 데이터베이스 설정이 완료되었습니다!")
    else:
        print("\n💥 데이터베이스 설정에 실패했습니다.")
        sys.exit(1)
