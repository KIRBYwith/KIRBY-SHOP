"""
상품 관련 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductSearch
from app.services.product_service import ProductService
from app.utils.file_uploader import file_uploader
from app.config import settings

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
async def create_product(
    title: str = Form(...),
    description: str = Form(...),
    price: int = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    discount_rate: Optional[int] = Form(0),
    is_new: Optional[bool] = Form(False),
    is_best_seller: Optional[bool] = Form(False),
    is_limited: Optional[bool] = Form(False),
    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """상품 생성 (이미지 포함) - 관리자 전용"""
    
    # 상품 데이터 생성
    product_data = ProductCreate(
        title=title,
        description=description,
        price=price,
        category=category,
        stock=stock,
        discount_rate=discount_rate,
        is_new=is_new,
        is_best_seller=is_best_seller,
        is_limited=is_limited
    )
    
    product_service = ProductService(db)
    product = product_service.create_product(product_data)
    
    # 이미지 업로드 처리
    if images:
        uploaded_images = []
        for image in images:
            # 파일 크기 체크
            if image.size > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400, 
                    detail=f"파일 크기가 너무 큽니다. 최대 {settings.MAX_FILE_SIZE // (1024*1024)}MB까지 가능합니다."
                )
            
            # 파일 타입 체크
            if not image.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
            
            # S3에 업로드
            filename = f"products/{product.id}/{image.filename}"
            image_url = file_uploader.upload_file(image, filename=filename)
            
            if image_url:
                uploaded_images.append(image_url)
        
        # 상품에 이미지 URL 저장
        if uploaded_images:
            product.images = uploaded_images
            db.commit()
            db.refresh(product)
    
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[int] = Form(None),
    category: Optional[str] = Form(None),
    stock: Optional[int] = Form(None),
    discount_rate: Optional[int] = Form(None),
    is_new: Optional[bool] = Form(None),
    is_best_seller: Optional[bool] = Form(None),
    is_limited: Optional[bool] = Form(None),
    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """상품 수정 (이미지 포함) - 관리자 전용"""
    
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    
    # 상품 데이터 업데이트
    update_data = {}
    if title is not None:
        update_data['title'] = title
    if description is not None:
        update_data['description'] = description
    if price is not None:
        update_data['price'] = price
    if category is not None:
        update_data['category'] = category
    if stock is not None:
        update_data['stock'] = stock
    if discount_rate is not None:
        update_data['discount_rate'] = discount_rate
    if is_new is not None:
        update_data['is_new'] = is_new
    if is_best_seller is not None:
        update_data['is_best_seller'] = is_best_seller
    if is_limited is not None:
        update_data['is_limited'] = is_limited
    
    if update_data:
        product_update = ProductUpdate(**update_data)
        product = product_service.update_product(product_id, product_update)
    
    # 이미지 업로드 처리
    if images:
        # 기존 이미지 삭제
        if product.images:
            for image_url in product.images:
                filename = image_url.split('/')[-1]
                file_uploader.delete_file(f"products/{product_id}/{filename}")
        
        # 새 이미지 업로드
        uploaded_images = []
        for image in images:
            # 파일 크기 체크
            if image.size > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400, 
                    detail=f"파일 크기가 너무 큽니다. 최대 {settings.MAX_FILE_SIZE // (1024*1024)}MB까지 가능합니다."
                )
            
            # 파일 타입 체크
            if not image.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
            
            # S3에 업로드
            filename = f"products/{product_id}/{image.filename}"
            image_url = file_uploader.upload_file(image, filename=filename)
            
            if image_url:
                uploaded_images.append(image_url)
        
        # 상품에 새 이미지 URL 저장
        if uploaded_images:
            product.images = uploaded_images
            db.commit()
            db.refresh(product)
    
    return product

@router.post("/{product_id}/images", status_code=status.HTTP_201_CREATED)
async def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """상품 이미지 추가 업로드 - 관리자 전용"""
    
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    
    uploaded_urls = []
    
    for file in files:
        # 파일 크기 체크
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"파일 크기가 너무 큽니다. 최대 {settings.MAX_FILE_SIZE // (1024*1024)}MB까지 가능합니다."
            )
        
        # 파일 타입 체크
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
        
        # S3에 업로드
        filename = f"products/{product_id}/{file.filename}"
        file_url = file_uploader.upload_file(file, filename=filename)
        
        if file_url:
            uploaded_urls.append(file_url)
    
    # 기존 이미지에 새 이미지 추가
    if uploaded_urls:
        if product.images:
            product.images.extend(uploaded_urls)
        else:
            product.images = uploaded_urls
        
        db.commit()
        db.refresh(product)
    
    return {
        "message": "이미지가 성공적으로 업로드되었습니다.",
        "uploaded_urls": uploaded_urls,
        "total_images": len(product.images)
    }

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """상품 삭제 (관리자 전용)"""
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    
    # S3에서 이미지 삭제
    if product.images:
        for image_url in product.images:
            filename = image_url.split('/')[-1]
            file_uploader.delete_file(f"products/{product_id}/{filename}")
    
    product_service.delete_product(product_id)
    return None
