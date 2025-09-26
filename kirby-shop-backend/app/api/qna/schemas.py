"""
API 레벨에서 사용하는 QnA 관련 Pydantic 스키마 접근자

서비스/뷰 계층에서 일관된 import 경로 유지를 위해
`app.schemas.qna`의 스키마들을 재노출합니다.
"""

from app.schemas.qna import (
    QnABase,
    QnACreate,
    QnAUpdate,
    QnAResponse,
    QnAAnswerBase,
    QnAAnswerCreate,
    QnAAnswerResponse,
    QnADetailResponse,
    QnASearch,
)

__all__ = [
    "QnABase",
    "QnACreate",
    "QnAUpdate",
    "QnAResponse",
    "QnAAnswerBase",
    "QnAAnswerCreate",
    "QnAAnswerResponse",
    "QnADetailResponse",
    "QnASearch",
]


