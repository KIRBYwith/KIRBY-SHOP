"""
QnA 관련 API 라우터
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.qna.schemas import (
    QnACreate,
    QnAUpdate,
    QnAResponse,
    QnAAnswerCreate,
    QnAAnswerResponse,
)
from app.api.qna.services import QnAService
from app.api.auth import get_current_user, get_current_admin_user
from app.schemas.user import UserResponse
from app.utils.file_upload import save_multiple_files

router = APIRouter(prefix="/api/qna", tags=["QnA"])


@router.post("/", response_model=QnAResponse, status_code=status.HTTP_201_CREATED)
async def create_qna(
    qna_data: QnACreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    qna = service.create_qna(qna_data, user_id=current_user.id)
    return QnAResponse.model_validate(qna)

@router.post("/with-images", response_model=QnAResponse, status_code=status.HTTP_201_CREATED)
async def create_qna_with_images(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    is_private: bool = Form(False),
    product_id: Optional[int] = Form(None),
    images: List[UploadFile] = File(default=[]),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """이미지와 함께 Q&A 생성"""
    try:
        # 이미지 업로드 처리
        image_urls = []
        if images:
            image_urls = await save_multiple_files(images, "qna_images")
        
        # Q&A 데이터 생성
        qna_data = QnACreate(
            title=title,
            content=content,
            category=category,
            is_private=is_private,
            product_id=product_id,
            images=image_urls
        )
        
        service = QnAService(db)
        qna = service.create_qna(qna_data, user_id=current_user.id)
        return QnAResponse.model_validate(qna)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Q&A 생성 실패: {str(e)}")


@router.get("/", response_model=List[QnAResponse])
async def list_all_qna(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin_user: UserResponse = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """관리자용 전체 Q&A 목록 조회"""
    service = QnAService(db)
    qnas = service.get_all_qnas_with_answers(skip=(page - 1) * limit, limit=limit)
    return [QnAResponse.model_validate(q) for q in qnas]

@router.get("/product/{product_id}", response_model=List[QnAResponse])
async def list_qna_by_product(
    product_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    qnas = service.get_qnas_by_product(product_id, skip=(page - 1) * limit, limit=limit)
    return [QnAResponse.model_validate(q) for q in qnas]


@router.get("/me", response_model=List[QnAResponse])
async def list_my_qna(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    qnas = service.get_qnas_by_user_with_answers(current_user.id, skip=(page - 1) * limit, limit=limit)
    return [QnAResponse.model_validate(q) for q in qnas]


@router.get("/{qna_id}", response_model=QnAResponse)
async def get_qna(qna_id: int, db: Session = Depends(get_db)):
    service = QnAService(db)
    qna = service.get_qna_by_id(qna_id)
    if not qna:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QnA를 찾을 수 없습니다.")
    return QnAResponse.model_validate(qna)


@router.put("/{qna_id}", response_model=QnAResponse)
async def update_qna(
    qna_id: int,
    qna_data: QnAUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    qna = service.update_qna(qna_id, qna_data, user_id=current_user.id)
    if not qna:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QnA를 찾을 수 없습니다.")
    return QnAResponse.model_validate(qna)


@router.delete("/{qna_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_qna(
    qna_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    ok = service.delete_qna(qna_id, user_id=current_user.id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QnA를 찾을 수 없습니다.")
    return None


# 관리자 전용: 답변 관리
@router.post("/{qna_id}/answers", response_model=QnAAnswerResponse, status_code=status.HTTP_201_CREATED)
async def create_answer(
    qna_id: int,
    answer_data: QnAAnswerCreate,
    admin_user: UserResponse = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    answer = service.create_answer(qna_id, answer_data, admin_id=admin_user.id)
    return QnAAnswerResponse.model_validate(answer)


@router.get("/{qna_id}/answers", response_model=List[QnAAnswerResponse])
async def list_answers(qna_id: int, db: Session = Depends(get_db)):
    service = QnAService(db)
    answers = service.get_answers_by_qna(qna_id)
    return [QnAAnswerResponse.model_validate(a) for a in answers]


@router.put("/answers/{answer_id}", response_model=QnAAnswerResponse)
async def update_answer(
    answer_id: int,
    answer_data: QnAAnswerCreate,
    admin_user: UserResponse = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    answer = service.update_answer(answer_id, answer_data, admin_id=admin_user.id)
    if not answer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="답변을 찾을 수 없습니다.")
    return QnAAnswerResponse.model_validate(answer)


@router.delete("/answers/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_answer(
    answer_id: int,
    admin_user: UserResponse = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = QnAService(db)
    ok = service.delete_answer(answer_id, admin_id=admin_user.id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="답변을 찾을 수 없습니다.")
    return None


