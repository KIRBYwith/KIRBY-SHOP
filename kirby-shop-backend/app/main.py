"""
FastAPI 애플리케이션 진입점
Kirby Shop 백엔드 API 서버
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app.models import Base
from app.api import auth_router, products_router, cart_router, orders_router
from app.api.wishlist import router as wishlist_router
from app.api.coupon import router as coupon_router
from app.api.payment import router as payment_router
from app.api.kakao_pay import router as kakao_pay_router
from app.api.toss_payments import router as toss_payments_router
from app.api.admin import router as admin_router
from app.api.setting import router as setting_router

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 인스턴스 생성
app = FastAPI(
    title="Kirby Shop API",
    description="Kirby Shop 백엔드 API 서버",
    version="1.0.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "Kirby Shop API 서버가 실행 중입니다!"}

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}

# API 라우터 등록
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(wishlist_router)
app.include_router(coupon_router)
app.include_router(payment_router, prefix="/api/payments", tags=["payments"])
app.include_router(kakao_pay_router)
app.include_router(toss_payments_router)
app.include_router(admin_router)
app.include_router(setting_router, prefix="/api/admin", tags=["admin-settings"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
