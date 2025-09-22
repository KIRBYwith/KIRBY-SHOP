"""
인증 관련 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from app.services.user_service import UserService
from app.utils.auth import create_access_token, get_user_id_from_token
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["인증"])
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    """현재 로그인한 사용자 조회"""
    token = credentials.credentials
    user_id = get_user_id_from_token(token)
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    return UserResponse.model_validate(user)

def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    """현재 로그인한 관리자 사용자 조회"""
    token = credentials.credentials
    user_id = get_user_id_from_token(token)
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다."
        )
    
    return UserResponse.model_validate(user)

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """회원가입"""
    user_service = UserService(db)
    user = user_service.create_user(user_data)
    return UserResponse.model_validate(user)

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """로그인"""
    user_service = UserService(db)
    user = user_service.authenticate_user(login_data.email, login_data.password)
    
    # JWT 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    """프로필 조회"""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """프로필 수정"""
    user_service = UserService(db)
    updated_user = user_service.update_user(current_user.id, user_data)
    return UserResponse.model_validate(updated_user)

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """회원 탈퇴"""
    user_service = UserService(db)
    user_service.delete_user(current_user.id)
    return None
