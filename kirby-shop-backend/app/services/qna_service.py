"""
Q&A 관련 서비스
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.models.qna import QnA, QnAAnswer
from app.models.user import User
from app.models.product import Product
from app.schemas.qna import QnACreate, QnAUpdate, QnAAnswerCreate, QnAResponse
from datetime import datetime

class QnAService:
    def __init__(self, db: Session):
        self.db = db

    def create_qna(self, qna_data: QnACreate, user_id: int) -> QnA:
        """Q&A 생성"""
        qna = QnA(
            user_id=user_id,
            product_id=qna_data.product_id,
            title=qna_data.title,
            content=qna_data.content,
            category=qna_data.category,
            is_private=qna_data.is_private,
            images=qna_data.images or []
        )
        
        self.db.add(qna)
        self.db.commit()
        self.db.refresh(qna)
        
        return qna

    def get_qnas_by_product(self, product_id: int, skip: int = 0, limit: int = 20) -> List[QnA]:
        """상품별 Q&A 조회"""
        return self.db.query(QnA).filter(
            QnA.product_id == product_id
        ).offset(skip).limit(limit).all()

    def get_qnas_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> List[QnA]:
        """사용자별 Q&A 조회"""
        return self.db.query(QnA).filter(
            QnA.user_id == user_id
        ).offset(skip).limit(limit).all()

    def get_qnas_by_user_with_answers(self, user_id: int, skip: int = 0, limit: int = 20) -> List[QnA]:
        """사용자별 Q&A 조회 (답변 포함)"""
        from sqlalchemy.orm import joinedload
        qnas = self.db.query(QnA).options(
            joinedload(QnA.answers)
        ).filter(
            QnA.user_id == user_id
        ).offset(skip).limit(limit).all()
        
        # 답변이 있는 경우 상태를 'answered'로 업데이트
        for qna in qnas:
            if qna.answers and len(qna.answers) > 0:
                if qna.status == 'pending':
                    qna.status = 'answered'
                    self.db.commit()
        
        return qnas

    def get_all_qnas_with_answers(self, skip: int = 0, limit: int = 20) -> List[QnA]:
        """전체 Q&A 조회 (답변 포함) - 관리자용"""
        from sqlalchemy.orm import joinedload
        qnas = self.db.query(QnA).options(
            joinedload(QnA.answers),
            joinedload(QnA.user)
        ).order_by(QnA.created_at.desc()).offset(skip).limit(limit).all()
        
        # 답변이 있는 경우 상태를 'answered'로 업데이트
        for qna in qnas:
            if qna.answers and len(qna.answers) > 0:
                if qna.status == 'pending':
                    qna.status = 'answered'
                    self.db.commit()
        
        return qnas

    def get_qna_by_id(self, qna_id: int) -> Optional[QnA]:
        """Q&A ID로 조회"""
        return self.db.query(QnA).filter(QnA.id == qna_id).first()

    def update_qna(self, qna_id: int, qna_data: QnAUpdate, user_id: int) -> Optional[QnA]:
        """Q&A 수정"""
        qna = self.db.query(QnA).filter(
            and_(
                QnA.id == qna_id,
                QnA.user_id == user_id
            )
        ).first()
        
        if not qna:
            return None
        
        for field, value in qna_data.dict(exclude_unset=True).items():
            setattr(qna, field, value)
        
        qna.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(qna)
        
        return qna

    def delete_qna(self, qna_id: int, user_id: int) -> bool:
        """Q&A 삭제"""
        qna = self.db.query(QnA).filter(
            and_(
                QnA.id == qna_id,
                QnA.user_id == user_id
            )
        ).first()
        
        if not qna:
            return False
        
        self.db.delete(qna)
        self.db.commit()
        
        return True

    def create_answer(self, qna_id: int, answer_data: QnAAnswerCreate, admin_id: int) -> QnAAnswer:
        """Q&A 답변 생성"""
        answer = QnAAnswer(
            qna_id=qna_id,
            admin_id=admin_id,
            content=answer_data.content
        )
        
        self.db.add(answer)
        self.db.commit()
        self.db.refresh(answer)
        
        return answer

    def get_answers_by_qna(self, qna_id: int) -> List[QnAAnswer]:
        """Q&A별 답변 조회"""
        return self.db.query(QnAAnswer).filter(
            QnAAnswer.qna_id == qna_id
        ).all()

    def update_answer(self, answer_id: int, answer_data: QnAAnswerCreate, admin_id: int) -> Optional[QnAAnswer]:
        """Q&A 답변 수정"""
        answer = self.db.query(QnAAnswer).filter(
            and_(
                QnAAnswer.id == answer_id,
                QnAAnswer.admin_id == admin_id
            )
        ).first()
        
        if not answer:
            return None
        
        answer.content = answer_data.content
        answer.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(answer)
        
        return answer

    def delete_answer(self, answer_id: int, admin_id: int) -> bool:
        """Q&A 답변 삭제"""
        answer = self.db.query(QnAAnswer).filter(
            and_(
                QnAAnswer.id == answer_id,
                QnAAnswer.admin_id == admin_id
            )
        ).first()
        
        if not answer:
            return False
        
        self.db.delete(answer)
        self.db.commit()
        
        return True

