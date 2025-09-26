"""
QnA API 유틸리티 함수
"""

from typing import Optional

def sanitize_search_query(query: Optional[str]) -> Optional[str]:
    """검색어 공백/트림 처리. 빈 문자열이면 None 반환."""
    if query is None:
        return None
    normalized = query.strip()
    return normalized if normalized else None


