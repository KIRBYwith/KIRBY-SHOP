"""
장바구니 관련 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse, CartSummary
from app.schemas.user import UserResponse
from app.schemas.product import ProductResponse
from app.services.cart_service import CartService
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["장바구니"])

@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """장바구니 조회"""
    cart_service = CartService(db)
    cart_items = cart_service.get_cart_items(current_user.id)
    summary = cart_service.calculate_cart_summary(cart_items)
    
    # CartItemResponse로 변환
    cart_item_responses = []
    for item in cart_items:
        cart_item_responses.append(CartItemResponse(
            cart_item_id=str(item.id),
            product=ProductResponse.model_validate(item.product),
            quantity=item.quantity,
            selected_option=item.selected_option,
            added_at=item.added_at,
            is_guest=False
        ))
    
    return CartResponse(items=cart_item_responses, summary=summary)

@router.post("/add", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    cart_data: CartItemCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """장바구니에 상품 추가"""
    cart_service = CartService(db)
    cart_item = cart_service.add_to_cart(current_user.id, cart_data)
    
    return CartItemResponse(
        cart_item_id=str(cart_item.id),
        product=cart_item.product,
        quantity=cart_item.quantity,
        selected_option=cart_item.selected_option,
        added_at=cart_item.added_at,
        is_guest=False
    )

@router.put("/{cart_item_id}", response_model=CartItemResponse)
async def update_cart_item(
    cart_item_id: int,
    update_data: CartItemUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """장바구니 아이템 수정"""
    cart_service = CartService(db)
    cart_item = cart_service.update_cart_item(cart_item_id, current_user.id, update_data)
    
    return CartItemResponse(
        cart_item_id=str(cart_item.id),
        product=cart_item.product,
        quantity=cart_item.quantity,
        selected_option=cart_item.selected_option,
        added_at=cart_item.added_at,
        is_guest=False
    )

@router.delete("/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    cart_item_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """장바구니에서 아이템 제거"""
    cart_service = CartService(db)
    cart_service.remove_from_cart(cart_item_id, current_user.id)
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """장바구니 비우기"""
    cart_service = CartService(db)
    cart_service.clear_cart(current_user.id)
    return None

@router.get("/summary", response_model=CartSummary)
async def get_cart_summary(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """장바구니 요약 조회"""
    cart_service = CartService(db)
    cart_items = cart_service.get_cart_items(current_user.id)
    summary = cart_service.calculate_cart_summary(cart_items)
    return summary
