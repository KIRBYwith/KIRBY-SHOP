#!/usr/bin/env python3
"""
관리자 계정 생성 스크립트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.models import Base
import hashlib
from datetime import datetime

def hash_password(password: str) -> str:
    """비밀번호 해시화"""
    from app.utils.auth import get_password_hash
    return get_password_hash(password)

def create_admin_user():
    """관리자 계정 생성"""
    # 데이터베이스 테이블 생성
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 기존 관리자 계정 확인
        existing_admin = db.query(User).filter(
            User.email == "admin@kirby-shop.com"
        ).first()
        
        if existing_admin:
            print("관리자 계정이 이미 존재합니다.")
            print(f"이메일: {existing_admin.email}")
            print(f"이름: {existing_admin.name}")
            print(f"역할: {existing_admin.role}")
            return
        
        # 새 관리자 계정 생성
        admin_user = User(
            email="admin@kirby-shop.com",
            password_hash=hash_password("admin123"),
            name="관리자",
            phone="010-0000-0000",
            grade="관리자",
            points=0,
            order_count=0,
            role="admin",
            is_active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(admin_user)
        db.commit()
        
        print("관리자 계정이 성공적으로 생성되었습니다!")
        print(f"이메일: {admin_user.email}")
        print(f"비밀번호: admin123")
        print(f"이름: {admin_user.name}")
        print(f"역할: {admin_user.role}")
        
    except Exception as e:
        print(f"오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
