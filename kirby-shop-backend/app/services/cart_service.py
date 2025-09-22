"""
장바구니 관련 비즈니스 로직
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartSummary
from app.schemas.product import ProductResponse

class CartService:
    def __init__(self, db: Session):
        self.db = db
    
    def add_to_cart(self, user_id: int, cart_data: CartItemCreate) -> CartItem:
        """장바구니에 상품 추가"""
        # 상품 존재 확인
        product = self.db.query(Product).filter(Product.id == cart_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="상품을 찾을 수 없습니다"
            )
        
        # 재고 확인
        if product.stock < cart_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="재고가 부족합니다"
            )
        
        # 기존 장바구니 아이템 확인
        existing_item = self.db.query(CartItem).filter(
            and_(
                CartItem.user_id == user_id,
                CartItem.product_id == cart_data.product_id,
                CartItem.selected_option == cart_data.selected_option
            )
        ).first()
        
        if existing_item:
            # 기존 아이템 수량 증가
            existing_item.quantity += cart_data.quantity
            self.db.commit()
            self.db.refresh(existing_item)
            return existing_item
        else:
            # 새 아이템 추가
            cart_item = CartItem(
                user_id=user_id,
                product_id=cart_data.product_id,
                quantity=cart_data.quantity,
                selected_option=cart_data.selected_option
            )
            self.db.add(cart_item)
            self.db.commit()
            self.db.refresh(cart_item)
            return cart_item
    
    def get_cart_items(self, user_id: int) -> List[CartItem]:
        """사용자 장바구니 조회"""
        return self.db.query(CartItem).filter(CartItem.user_id == user_id).all()
    
    def update_cart_item(self, cart_item_id: int, user_id: int, update_data: CartItemUpdate) -> CartItem:
        """장바구니 아이템 수정"""
        cart_item = self.db.query(CartItem).filter(
            and_(CartItem.id == cart_item_id, CartItem.user_id == user_id)
        ).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="장바구니 아이템을 찾을 수 없습니다"
            )
        
        # 상품 재고 확인
        if update_data.quantity:
            product = self.db.query(Product).filter(Product.id == cart_item.product_id).first()
            if product.stock < update_data.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="재고가 부족합니다"
                )
            cart_item.quantity = update_data.quantity
        
        if update_data.selected_option is not None:
            cart_item.selected_option = update_data.selected_option
        
        self.db.commit()
        self.db.refresh(cart_item)
        return cart_item
    
    def remove_from_cart(self, cart_item_id: int, user_id: int) -> bool:
        """장바구니에서 아이템 제거"""
        cart_item = self.db.query(CartItem).filter(
            and_(CartItem.id == cart_item_id, CartItem.user_id == user_id)
        ).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="장바구니 아이템을 찾을 수 없습니다"
            )
        
        self.db.delete(cart_item)
        self.db.commit()
        return True
    
    def clear_cart(self, user_id: int) -> bool:
        """장바구니 비우기"""
        self.db.query(CartItem).filter(CartItem.user_id == user_id).delete()
        self.db.commit()
        return True
    
    def calculate_cart_summary(self, cart_items: List[CartItem]) -> CartSummary:
        """장바구니 요약 계산"""
        if not cart_items:
            return CartSummary(
                total_quantity=0,
                total_price=0,
                original_total_price=0,
                total_discount=0,
                shipping_fee=0,
                final_price=0,
                free_shipping_remaining=30000,
                is_empty=True,
                has_guest_items=False
            )
        
        total_quantity = sum(item.quantity for item in cart_items)
        total_price = 0
        original_total_price = 0
        
        for item in cart_items:
            product = item.product
            item_price = product.price
            if product.discount > 0:
                item_price = product.price * (1 - product.discount / 100)
            
            total_price += item_price * item.quantity
            original_total_price += product.price * item.quantity
        
        total_discount = original_total_price - total_price
        
        # 배송비 계산 (기본 배송비 - 장바구니에서는 지역 정보 없음)
        FREE_SHIPPING_THRESHOLD = 30000
        BASE_SHIPPING_FEE = 3000
        shipping_fee = BASE_SHIPPING_FEE if total_price < FREE_SHIPPING_THRESHOLD else 0
        final_price = total_price + shipping_fee
        free_shipping_remaining = max(0, FREE_SHIPPING_THRESHOLD - total_price)
        
        return CartSummary(
            total_quantity=total_quantity,
            total_price=int(total_price),
            original_total_price=original_total_price,
            total_discount=int(total_discount),
            shipping_fee=shipping_fee,
            final_price=int(final_price),
            free_shipping_remaining=int(free_shipping_remaining),
            is_empty=False,
            has_guest_items=False
        )
