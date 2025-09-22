"""
주문 관련 비즈니스 로직
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime
import uuid
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderUpdate, OrderSummary, ReceiverInfo

class OrderService:
    def __init__(self, db: Session):
        self.db = db
    
    def _calculate_shipping_fee(self, address: str, total_amount: int) -> int:
        """지역별 배송비 계산"""
        FREE_SHIPPING_THRESHOLD = 30000
        
        # 무료배송 조건 확인
        if total_amount >= FREE_SHIPPING_THRESHOLD:
            return 0
        
        # 지역별 배송비 매핑
        shipping_fees = {
            '서울': 3000,
            '경기': 3000,
            '인천': 3000,
            '부산': 4000,
            '대구': 4000,
            '광주': 4000,
            '대전': 4000,
            '울산': 4000,
            '세종': 4000,
            '강원': 5000,
            '충북': 5000,
            '충남': 5000,
            '전북': 5000,
            '전남': 5000,
            '경북': 5000,
            '경남': 5000,
            '제주': 8000,
        }
        
        # 주소에서 지역 추출
        if not address:
            return 6000  # 기본 배송비
        
        address_lower = address.lower()
        
        # 지역 키워드 매핑
        region_keywords = {
            '서울': ['서울', '서울시', '서울특별시'],
            '경기': ['경기', '경기도', '수원', '성남', '의정부', '안양', '부천', '광명', '평택', '과천', '오산', '시흥', '군포', '의왕', '하남', '용인', '파주', '이천', '안성', '김포', '화성', '광주', '여주', '양평', '동두천', '가평', '연천'],
            '인천': ['인천', '인천시', '인천광역시'],
            '부산': ['부산', '부산시', '부산광역시'],
            '대구': ['대구', '대구시', '대구광역시'],
            '광주': ['광주', '광주시', '광주광역시'],
            '대전': ['대전', '대전시', '대전광역시'],
            '울산': ['울산', '울산시', '울산광역시'],
            '세종': ['세종', '세종시', '세종특별자치시'],
            '강원': ['강원', '강원도', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'],
            '충북': ['충북', '충청북도', '청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양'],
            '충남': ['충남', '충청남도', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안'],
            '전북': ['전북', '전라북도', '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안'],
            '전남': ['전남', '전라남도', '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'],
            '경북': ['경북', '경상북도', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉'],
            '경남': ['경남', '경상남도', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천'],
            '제주': ['제주', '제주도', '제주특별자치도', '제주시', '서귀포']
        }
        
        # 지역 매핑에서 찾기
        for region, keywords in region_keywords.items():
            for keyword in keywords:
                if keyword in address_lower:
                    return shipping_fees.get(region, 6000)
        
        return 6000  # 기본 배송비
    
    def create_order(self, user_id: int, order_data: OrderCreate) -> Order:
        """주문 생성"""
        # 사용자 확인
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용자를 찾을 수 없습니다"
            )
        
        # 주문 ID 생성
        order_id = f"ORDER-{int(datetime.now().timestamp() * 1000)}"
        
        # 주문 아이템 검증 및 가격 계산
        total_amount = 0
        order_items = []
        
        for item_data in order_data.items:
            product = self.db.query(Product).filter(Product.id == item_data.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"상품 ID {item_data.product_id}를 찾을 수 없습니다"
                )
            
            # 재고 확인
            if product.stock < item_data.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{product.title}의 재고가 부족합니다"
                )
            
            # 할인 가격 계산
            item_price = product.price
            if product.discount > 0:
                item_price = product.price * (1 - product.discount / 100)
            
            total_amount += item_price * item_data.quantity
            
            # 주문 아이템 생성
            order_item = OrderItem(
                order_id=order_id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                price=int(item_price),
                selected_option=item_data.selected_option
            )
            order_items.append(order_item)
        
        # 지역별 배송비 계산
        shipping_fee = self._calculate_shipping_fee(
            order_data.receiver.address, 
            total_amount
        )
        final_amount = total_amount + shipping_fee
        
        # 주문 생성
        order = Order(
            id=order_id,
            user_id=user_id,
            total_amount=int(total_amount),
            shipping_fee=shipping_fee,
            final_amount=int(final_amount),
            receiver_name=order_data.receiver.name,
            receiver_phone=order_data.receiver.phone,
            receiver_address=order_data.receiver.address,
            receiver_address_detail=order_data.receiver.address_detail,
            receiver_zip=order_data.receiver.zip,
            request_message=order_data.request_message,
            payment_method=order_data.payment_method
        )
        
        try:
            self.db.add(order)
            self.db.add_all(order_items)
            
            # 상품 재고 차감
            for item_data in order_data.items:
                product = self.db.query(Product).filter(Product.id == item_data.product_id).first()
                product.stock -= item_data.quantity
            
            # 사용자 주문 횟수 증가
            user.order_count += 1
            
            self.db.commit()
            self.db.refresh(order)
            return order
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"주문 생성 중 오류가 발생했습니다: {str(e)}"
            )
    
    def get_order(self, order_id: str, user_id: int) -> Order:
        """주문 조회"""
        order = self.db.query(Order).filter(
            and_(Order.id == order_id, Order.user_id == user_id)
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="주문을 찾을 수 없습니다"
            )
        
        return order
    
    def get_user_orders(self, user_id: int, limit: int = 20, offset: int = 0) -> List[Order]:
        """사용자 주문 목록 조회"""
        return self.db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    
    def update_order_status(self, order_id: str, user_id: int, update_data: OrderUpdate) -> Order:
        """주문 상태 수정"""
        order = self.get_order(order_id, user_id)
        
        if update_data.status:
            order.status = update_data.status
        if update_data.payment_status:
            order.payment_status = update_data.payment_status
        
        try:
            self.db.commit()
            self.db.refresh(order)
            return order
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"주문 상태 수정 중 오류가 발생했습니다: {str(e)}"
            )
    
    def cancel_order(self, order_id: str, user_id: int) -> Order:
        """주문 취소"""
        order = self.get_order(order_id, user_id)
        
        if order.status not in ["pending", "processing"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="취소할 수 없는 주문입니다"
            )
        
        try:
            # 주문 상태 변경
            order.status = "cancelled"
            
            # 상품 재고 복구
            for order_item in order.order_items:
                product = self.db.query(Product).filter(Product.id == order_item.product_id).first()
                product.stock += order_item.quantity
            
            self.db.commit()
            self.db.refresh(order)
            return order
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"주문 취소 중 오류가 발생했습니다: {str(e)}"
            )
    
    def calculate_order_summary(self, order: Order) -> OrderSummary:
        """주문 요약 계산"""
        return OrderSummary(
            total_amount=order.total_amount,
            discount_amount=order.discount_amount,
            shipping_fee=order.shipping_fee,
            final_amount=order.final_amount
        )
