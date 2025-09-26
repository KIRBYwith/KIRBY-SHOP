"""
API 레벨에서 사용하는 QnA 서비스 접근자

서비스 계층의 구현(`app.services.qna_service`)을 재노출하여
API 모듈 내부에서 안정적인 import 경로를 제공합니다.
"""

from app.services.qna_service import QnAService

__all__ = ["QnAService"]


