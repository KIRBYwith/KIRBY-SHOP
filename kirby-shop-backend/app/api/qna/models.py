"""
API 레벨에서 사용하는 QnA 관련 ORM 모델 접근자

이 모듈은 실제 SQLAlchemy 모델 정의(`app.models.qna`)를 재노출합니다.
API, 서비스 계층에서 `app.api.qna.models`를 import 하여 일관된 참조 경로를 유지할 수 있습니다.
"""

from app.models.qna import QnA, QnAAnswer

__all__ = [
    "QnA",
    "QnAAnswer",
]


