"""
위시리스트 관련 비즈니스 로직
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from typing import List
from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.schemas.wishlist import WishlistCreate, WishlistSummary
from app.utils.cache import cache_manager, get_wishlist_cache_key

class WishlistService:
    def __init__(self, db: Session):
        self.db = db
    
    async def add_to_wishlist(self, user_id: int, wishlist_data: WishlistCreate) -> WishlistItem:
        """위시리스트에 상품 추가"""
        # 상품 존재 확인
        product = self.db.query(Product).filter(Product.id == wishlist_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="상품을 찾을 수 없습니다"
            )
        
        # 이미 위시리스트에 있는지 확인
        existing_item = self.db.query(WishlistItem).filter(
            and_(
                WishlistItem.user_id == user_id,
                WishlistItem.product_id == wishlist_data.product_id
            )
        ).first()
        
        if existing_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 위시리스트에 추가된 상품입니다"
            )
        
        # 위시리스트에 추가
        wishlist_item = WishlistItem(
            user_id=user_id,
            product_id=wishlist_data.product_id
        )
        
        self.db.add(wishlist_item)
        self.db.commit()
        self.db.refresh(wishlist_item)
        
        # 캐시 무효화
        await cache_manager.delete(get_wishlist_cache_key(user_id))
        
        return wishlist_item
    
    async def get_wishlist(self, user_id: int) -> List[WishlistItem]:
        """사용자 위시리스트 조회"""
        # 캐시에서 먼저 확인
        cache_key = get_wishlist_cache_key(user_id)
        cached_data = await cache_manager.get(cache_key)
        if cached_data:
            return cached_data
        
        wishlist_items = self.db.query(WishlistItem).filter(
            WishlistItem.user_id == user_id
        ).order_by(WishlistItem.added_at.desc()).all()
        
        # 캐시에 저장 (1시간)
        await cache_manager.set(cache_key, wishlist_items, 3600)
        
        return wishlist_items
    
    async def remove_from_wishlist(self, wishlist_item_id: int, user_id: int) -> bool:
        """위시리스트에서 상품 제거"""
        wishlist_item = self.db.query(WishlistItem).filter(
            and_(WishlistItem.id == wishlist_item_id, WishlistItem.user_id == user_id)
        ).first()
        
        if not wishlist_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="위시리스트 아이템을 찾을 수 없습니다"
            )
        
        self.db.delete(wishlist_item)
        self.db.commit()
        
        # 캐시 무효화
        await cache_manager.delete(get_wishlist_cache_key(user_id))
        
        return True
    
    async def clear_wishlist(self, user_id: int) -> bool:
        """위시리스트 비우기"""
        self.db.query(WishlistItem).filter(WishlistItem.user_id == user_id).delete()
        self.db.commit()
        
        # 캐시 무효화
        await cache_manager.delete(get_wishlist_cache_key(user_id))
        
        return True
    
    async def calculate_wishlist_summary(self, wishlist_items: List[WishlistItem]) -> WishlistSummary:
        """위시리스트 요약 계산"""
        if not wishlist_items:
            return WishlistSummary(
                total_count=0,
                total_value=0,
                discounted_value=0
            )
        
        total_value = 0
        discounted_value = 0
        
        for item in wishlist_items:
            product = item.product
            total_value += product.price
            
            # 할인 가격 계산
            if product.discount > 0:
                discounted_price = product.price * (1 - product.discount / 100)
                discounted_value += discounted_price
            else:
                discounted_value += product.price
        
        return WishlistSummary(
            total_count=len(wishlist_items),
            total_value=int(total_value),
            discounted_value=int(discounted_value)
        )
    
    async def is_in_wishlist(self, user_id: int, product_id: int) -> bool:
        """상품이 위시리스트에 있는지 확인"""
        wishlist_item = self.db.query(WishlistItem).filter(
            and_(
                WishlistItem.user_id == user_id,
                WishlistItem.product_id == product_id
            )
        ).first()
        
        return wishlist_item is not None
