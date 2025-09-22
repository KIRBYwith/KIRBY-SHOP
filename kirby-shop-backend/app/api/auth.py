"""
인증 관련 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from app.services.user_service import UserService
from app.utils.auth import create_access_token, get_user_id_from_token
from app.utils.file_uploader import file_uploader
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

@router.post("/profile-image", status_code=status.HTTP_201_CREATED)
async def upload_profile_image(
    image: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """프로필 이미지 업로드"""
    
    # 파일 크기 체크
    if image.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"파일 크기가 너무 큽니다. 최대 {settings.MAX_FILE_SIZE // (1024*1024)}MB까지 가능합니다."
        )
    
    # 파일 타입 체크
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(current_user.id)
    
    # 기존 프로필 이미지 삭제
    if user.profile_image:
        filename = user.profile_image.split('/')[-1]
        file_uploader.delete_file(f"profiles/{user.id}/{filename}")
    
    # 새 프로필 이미지 업로드
    filename = f"profiles/{user.id}/{image.filename}"
    image_url = file_uploader.upload_file(image, filename=filename)
    
    if image_url:
        # 데이터베이스에 이미지 URL 저장
        user.profile_image = image_url
        db.commit()
        db.refresh(user)
        
        return {
            "message": "프로필 이미지가 성공적으로 업로드되었습니다.",
            "image_url": image_url
        }
    else:
        raise HTTPException(status_code=500, detail="이미지 업로드에 실패했습니다.")

@router.delete("/profile-image", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile_image(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """프로필 이미지 삭제"""
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(current_user.id)
    
    if user.profile_image:
        # S3에서 이미지 삭제
        filename = user.profile_image.split('/')[-1]
        file_uploader.delete_file(f"profiles/{user.id}/{filename}")
        
        # 데이터베이스에서 이미지 URL 제거
        user.profile_image = None
        db.commit()
    
    return None

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """회원 탈퇴"""
    user_service = UserService(db)
    user = user_service.get_user_by_id(current_user.id)
    
    # 프로필 이미지 삭제
    if user.profile_image:
        filename = user.profile_image.split('/')[-1]
        file_uploader.delete_file(f"profiles/{user.id}/{filename}")
    
    user_service.delete_user(current_user.id)
    return None
