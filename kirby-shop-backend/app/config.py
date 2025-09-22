"""
애플리케이션 설정 관리
환경변수와 기본 설정값들을 관리합니다.
"""

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """애플리케이션 설정 클래스"""
    
    # 데이터베이스 설정 (MySQL - 로컬)
    DATABASE_URL: str = "mysql+pymysql://root:admin123@localhost:3306/kirby_shop"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "admin123"
    DB_NAME: str = "kirby_shop"
    
    # AWS 설정
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-northeast-2"
    S3_BUCKET_NAME: str = "kirby-shop-images"
    S3_BUCKET_URL: str = "https://kirby-shop-images.s3.ap-northeast-2.amazonaws.com"
    
    # JWT 설정
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS 설정
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-domain.com",
        "https://kirby-shop.vercel.app"
    ]
    
    # 파일 업로드 설정
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # Redis 설정 (AWS ElastiCache)
    REDIS_URL: str = "redis://kirby-shop-redis.xxxxxxxxx.cache.amazonaws.com:6379"
    REDIS_HOST: str = "kirby-shop-redis.xxxxxxxxx.cache.amazonaws.com"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    
    # 결제 설정
    TOSS_CLIENT_KEY: str = ""
    TOSS_SECRET_KEY: str = ""
    KAKAO_PAY_ADMIN_KEY: str = ""
    
    # 이메일 설정 (선택사항)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    
    class Config:
        env_file = ".env"

# 전역 설정 인스턴스
settings = Settings()
