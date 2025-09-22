"""
리뷰 관련 서비스
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.models.review import Review
from app.models.user import User
from app.models.product import Product
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from datetime import datetime

class ReviewService:
    def __init__(self, db: Session):
        self.db = db

    def create_review(self, review_data: ReviewCreate, user_id: int) -> Review:
        """리뷰 생성"""
        review = Review(
            user_id=user_id,
            product_id=review_data.product_id,
            order_id=review_data.order_id,
            rating=review_data.rating,
            title=review_data.title,
            content=review_data.content,
            images=review_data.images,
            is_verified_purchase=review_data.is_verified_purchase,
            is_anonymous=review_data.is_anonymous
        )
        
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        # 상품 평점 업데이트
        self._update_product_rating(review.product_id)
        
        return review

    def get_reviews_by_product(self, product_id: int, skip: int = 0, limit: int = 20) -> List[Review]:
        """상품별 리뷰 조회"""
        return self.db.query(Review).filter(
            and_(
                Review.product_id == product_id,
                Review.status == 'active'
            )
        ).offset(skip).limit(limit).all()

    def get_reviews_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> List[Review]:
        """사용자별 리뷰 조회"""
        return self.db.query(Review).filter(
            Review.user_id == user_id
        ).offset(skip).limit(limit).all()

    def update_review(self, review_id: int, review_data: ReviewUpdate, user_id: int) -> Optional[Review]:
        """리뷰 수정"""
        review = self.db.query(Review).filter(
            and_(
                Review.id == review_id,
                Review.user_id == user_id
            )
        ).first()
        
        if not review:
            return None
        
        for field, value in review_data.dict(exclude_unset=True).items():
            setattr(review, field, value)
        
        review.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(review)
        
        # 상품 평점 업데이트
        self._update_product_rating(review.product_id)
        
        return review

    def delete_review(self, review_id: int, user_id: int) -> bool:
        """리뷰 삭제"""
        review = self.db.query(Review).filter(
            and_(
                Review.id == review_id,
                Review.user_id == user_id
            )
        ).first()
        
        if not review:
            return False
        
        review.status = 'deleted'
        review.updated_at = datetime.now()
        self.db.commit()
        
        # 상품 평점 업데이트
        self._update_product_rating(review.product_id)
        
        return True

    def _update_product_rating(self, product_id: int):
        """상품 평점 업데이트"""
        # 활성 리뷰들의 평점 계산
        reviews = self.db.query(Review).filter(
            and_(
                Review.product_id == product_id,
                Review.status == 'active'
            )
        ).all()
        
        if reviews:
            total_rating = sum(review.rating for review in reviews)
            avg_rating = total_rating / len(reviews)
            
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if product:
                product.rating = round(avg_rating, 1)
                product.review_count = len(reviews)
                self.db.commit()

