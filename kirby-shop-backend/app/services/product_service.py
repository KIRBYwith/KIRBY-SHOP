"""
상품 관련 비즈니스 로직
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductSearch

class ProductService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_product(self, product_data: ProductCreate) -> Product:
        """상품 생성"""
        db_product = Product(**product_data.dict())
        
        try:
            self.db.add(db_product)
            self.db.commit()
            self.db.refresh(db_product)
            return db_product
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"상품 생성 중 오류가 발생했습니다: {str(e)}"
            )
    
    def get_product(self, product_id: int) -> Product:
        """상품 조회"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="상품을 찾을 수 없습니다"
            )
        return product
    
    def get_products(self, search_params: ProductSearch) -> List[Product]:
        """상품 목록 조회 (검색, 필터링, 정렬)"""
        query = self.db.query(Product)
        
        # 검색 조건
        if search_params.query:
            query = query.filter(
                or_(
                    Product.title.contains(search_params.query),
                    Product.description.contains(search_params.query)
                )
            )
        
        # 카테고리 필터
        if search_params.category:
            query = query.filter(Product.category == search_params.category)
        
        # 가격 범위 필터
        if search_params.min_price:
            query = query.filter(Product.price >= search_params.min_price)
        if search_params.max_price:
            query = query.filter(Product.price <= search_params.max_price)
        
        # 상태 필터
        if search_params.is_new is not None:
            query = query.filter(Product.is_new == search_params.is_new)
        if search_params.is_best_seller is not None:
            query = query.filter(Product.is_best_seller == search_params.is_best_seller)
        if search_params.is_limited is not None:
            query = query.filter(Product.is_limited == search_params.is_limited)
        
        # 정렬
        sort_column = getattr(Product, search_params.sort_by, Product.created_at)
        if search_params.sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # 페이징
        offset = (search_params.page - 1) * search_params.limit
        products = query.offset(offset).limit(search_params.limit).all()
        
        return products
    
    def get_products_by_category(self, category: str) -> List[Product]:
        """카테고리별 상품 조회"""
        return self.db.query(Product).filter(Product.category == category).all()
    
    def get_best_sellers(self, limit: int = 10) -> List[Product]:
        """베스트셀러 상품 조회"""
        return self.db.query(Product).filter(Product.is_best_seller == True).limit(limit).all()
    
    def get_new_products(self, limit: int = 10) -> List[Product]:
        """신상품 조회"""
        return self.db.query(Product).filter(Product.is_new == True).limit(limit).all()
    
    def get_discounted_products(self, limit: int = 10) -> List[Product]:
        """할인 상품 조회"""
        return self.db.query(Product).filter(Product.discount > 0).limit(limit).all()
    
    def update_product(self, product_id: int, product_data: ProductUpdate) -> Product:
        """상품 수정"""
        product = self.get_product(product_id)
        
        update_data = product_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        try:
            self.db.commit()
            self.db.refresh(product)
            return product
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"상품 수정 중 오류가 발생했습니다: {str(e)}"
            )
    
    def delete_product(self, product_id: int) -> bool:
        """상품 삭제"""
        product = self.get_product(product_id)
        
        try:
            self.db.delete(product)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"상품 삭제 중 오류가 발생했습니다: {str(e)}"
            )
    
    def get_categories(self) -> List[str]:
        """카테고리 목록 조회"""
        categories = self.db.query(Product.category).distinct().all()
        return [cat[0] for cat in categories if cat[0]]
