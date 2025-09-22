"""
위시리스트 관련 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.wishlist import WishlistCreate, WishlistResponse, WishlistItemResponse, WishlistSummary
from app.schemas.user import UserResponse
from app.schemas.product import ProductResponse
from app.services.wishlist_service import WishlistService
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["위시리스트"])

@router.get("/", response_model=WishlistResponse)
async def get_wishlist(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """위시리스트 조회"""
    wishlist_service = WishlistService(db)
    wishlist_items = await wishlist_service.get_wishlist(current_user.id)
    
    # WishlistItemResponse로 변환
    wishlist_item_responses = []
    for item in wishlist_items:
        wishlist_item_responses.append(WishlistItemResponse(
            id=item.id,
            product=ProductResponse.model_validate(item.product),
            added_at=item.added_at
        ))
    
    return WishlistResponse(
        items=wishlist_item_responses,
        total_count=len(wishlist_item_responses)
    )

@router.post("/add", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    wishlist_data: WishlistCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """위시리스트에 상품 추가"""
    wishlist_service = WishlistService(db)
    wishlist_item = await wishlist_service.add_to_wishlist(current_user.id, wishlist_data)
    
    return WishlistItemResponse(
        id=wishlist_item.id,
        product=ProductResponse.model_validate(wishlist_item.product),
        added_at=wishlist_item.added_at
    )

@router.delete("/{wishlist_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    wishlist_item_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """위시리스트에서 상품 제거"""
    wishlist_service = WishlistService(db)
    await wishlist_service.remove_from_wishlist(wishlist_item_id, current_user.id)
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_wishlist(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """위시리스트 비우기"""
    wishlist_service = WishlistService(db)
    await wishlist_service.clear_wishlist(current_user.id)
    return None

@router.get("/summary", response_model=WishlistSummary)
async def get_wishlist_summary(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """위시리스트 요약 조회"""
    wishlist_service = WishlistService(db)
    wishlist_items = await wishlist_service.get_wishlist(current_user.id)
    summary = await wishlist_service.calculate_wishlist_summary(wishlist_items)
    return summary

@router.get("/check/{product_id}")
async def check_in_wishlist(
    product_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """상품이 위시리스트에 있는지 확인"""
    wishlist_service = WishlistService(db)
    is_in_wishlist = await wishlist_service.is_in_wishlist(current_user.id, product_id)
    return {"is_in_wishlist": is_in_wishlist}
