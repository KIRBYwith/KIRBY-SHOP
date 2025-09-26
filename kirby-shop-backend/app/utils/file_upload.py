"""
파일 업로드 유틸리티
"""

import os
import uuid
from typing import List
from fastapi import UploadFile, HTTPException
from app.config import settings
from PIL import Image
import aiofiles

async def save_uploaded_file(file: UploadFile, upload_dir: str = "qna_images") -> str:
    """업로드된 파일을 저장하고 URL을 반환"""
    
    # 파일 확장자 검증
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 허용)"
        )
    
    # 파일 크기 검증 (10MB)
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="파일 크기가 너무 큽니다. (최대 10MB)"
        )
    
    # 업로드 디렉토리 생성
    upload_path = os.path.join(settings.UPLOAD_DIR, upload_dir)
    os.makedirs(upload_path, exist_ok=True)
    
    # 고유한 파일명 생성
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_extension}"
    file_path = os.path.join(upload_path, filename)
    
    # 파일 저장
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # 이미지 최적화 (선택사항)
    try:
        with Image.open(file_path) as img:
            # 이미지 크기 조정 (최대 1920x1080)
            if img.width > 1920 or img.height > 1080:
                img.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
                img.save(file_path, optimize=True, quality=85)
    except Exception as e:
        print(f"이미지 최적화 실패: {e}")
    
    # URL 반환
    return f"/uploads/{upload_dir}/{filename}"

async def save_multiple_files(files: List[UploadFile], upload_dir: str = "qna_images") -> List[str]:
    """여러 파일을 저장하고 URL 리스트를 반환"""
    urls = []
    
    for file in files:
        if file.filename:  # 빈 파일 제외
            url = await save_uploaded_file(file, upload_dir)
            urls.append(url)
    
    return urls

def delete_file(file_url: str) -> bool:
    """파일 삭제"""
    try:
        if file_url.startswith('/uploads/'):
            file_path = os.path.join(settings.UPLOAD_DIR, file_url[9:])  # '/uploads/' 제거
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
    except Exception as e:
        print(f"파일 삭제 실패: {e}")
    
    return False
