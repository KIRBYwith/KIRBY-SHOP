"""
상품 관련 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductSearch
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["상품"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    query: Optional[str] = Query(None, description="검색어"),
    category: Optional[str] = Query(None, description="카테고리"),
    min_price: Optional[int] = Query(None, description="최소 가격"),
    max_price: Optional[int] = Query(None, description="최대 가격"),
    is_new: Optional[bool] = Query(None, description="신상품 여부"),
    is_best_seller: Optional[bool] = Query(None, description="베스트셀러 여부"),
    is_limited: Optional[bool] = Query(None, description="한정판 여부"),
    sort_by: str = Query("created_at", description="정렬 기준"),
    sort_order: str = Query("desc", description="정렬 순서"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db)
):
    """상품 목록 조회 (검색, 필터링, 정렬)"""
    search_params = ProductSearch(
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
        is_new=is_new,
        is_best_seller=is_best_seller,
        is_limited=is_limited,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
    
    product_service = ProductService(db)
    products = product_service.get_products(search_params)
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """상품 상세 조회"""
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    return product

@router.get("/category/{category}", response_model=List[ProductResponse])
async def get_products_by_category(category: str, db: Session = Depends(get_db)):
    """카테고리별 상품 조회"""
    product_service = ProductService(db)
    products = product_service.get_products_by_category(category)
    return products

@router.get("/bestsellers", response_model=List[ProductResponse])
async def get_best_sellers(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """베스트셀러 상품 조회"""
    product_service = ProductService(db)
    products = product_service.get_best_sellers(limit)
    return products

@router.get("/new", response_model=List[ProductResponse])
async def get_new_products(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """신상품 조회"""
    product_service = ProductService(db)
    products = product_service.get_new_products(limit)
    return products

@router.get("/discounted", response_model=List[ProductResponse])
async def get_discounted_products(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """할인 상품 조회"""
    product_service = ProductService(db)
    products = product_service.get_discounted_products(limit)
    return products

@router.get("/categories/list", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
    """카테고리 목록 조회"""
    product_service = ProductService(db)
    categories = product_service.get_categories()
    return categories

# 관리자 전용 API (추후 권한 체크 추가 필요)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    """상품 생성 (관리자 전용)"""
    product_service = ProductService(db)
    product = product_service.create_product(product_data)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, 
    product_data: ProductUpdate, 
    db: Session = Depends(get_db)
):
    """상품 수정 (관리자 전용)"""
    product_service = ProductService(db)
    product = product_service.update_product(product_id, product_data)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """상품 삭제 (관리자 전용)"""
    product_service = ProductService(db)
    product_service.delete_product(product_id)
    return None
