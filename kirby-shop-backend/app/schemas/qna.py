"""
Q&A 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class QnABase(BaseModel):
    title: str
    content: str
    category: str  # 상품문의, 배송문의, 교환/반품, 기타
    is_private: bool = False

class QnACreate(QnABase):
    product_id: Optional[int] = None

class QnAUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_private: Optional[bool] = None
    status: Optional[str] = None

class QnAResponse(QnABase):
    id: int
    user_id: int
    product_id: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class QnAAnswerBase(BaseModel):
    content: str

class QnAAnswerCreate(QnAAnswerBase):
    pass

class QnAAnswerResponse(QnAAnswerBase):
    id: int
    qna_id: int
    admin_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class QnADetailResponse(QnAResponse):
    answers: List[QnAAnswerResponse] = []
    
    class Config:
        from_attributes = True

class QnASearch(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    product_id: Optional[int] = None
    user_id: Optional[int] = None
    page: int = 1
    limit: int = 20
