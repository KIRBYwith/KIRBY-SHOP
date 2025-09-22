"""
주문 관련 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderSummary, ReceiverInfo
from app.schemas.user import UserResponse
from app.schemas.product import ProductResponse
from app.services.order_service import OrderService
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["주문"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """주문 생성"""
    order_service = OrderService(db)
    order = order_service.create_order(current_user.id, order_data)
    
    # OrderResponse로 변환
    order_items = []
    for item in order.order_items:
        order_items.append({
            "id": item.id,
            "product": item.product,
            "quantity": item.quantity,
            "price": item.price,
            "selected_option": item.selected_option
        })
    
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        items=order_items,
        receiver=ReceiverInfo(
            name=order.receiver_name,
            phone=order.receiver_phone,
            address=order.receiver_address,
            address_detail=order.receiver_address_detail,
            zip=order.receiver_zip
        ),
        summary=OrderSummary(
            total_amount=order.total_amount,
            discount_amount=order.discount_amount,
            shipping_fee=order.shipping_fee,
            final_amount=order.final_amount
        ),
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        request_message=order.request_message,
        created_at=order.created_at,
        updated_at=order.updated_at
    )

@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자 주문 목록 조회"""
    order_service = OrderService(db)
    orders = order_service.get_user_orders(current_user.id, limit, offset)
    
    # OrderResponse로 변환
    order_responses = []
    for order in orders:
        order_items = []
        for item in order.order_items:
            order_items.append({
                "id": item.id,
                "product": ProductResponse.model_validate(item.product),
                "quantity": item.quantity,
                "price": item.price,
                "selected_option": item.selected_option
            })
        
        order_responses.append(OrderResponse(
            id=order.id,
            user_id=order.user_id,
            items=order_items,
            receiver=ReceiverInfo(
                name=order.receiver_name,
                phone=order.receiver_phone,
                address=order.receiver_address,
                address_detail=order.receiver_address_detail,
                zip=order.receiver_zip
            ),
            summary=OrderSummary(
                total_amount=order.total_amount,
                discount_amount=order.discount_amount,
                shipping_fee=order.shipping_fee,
                final_amount=order.final_amount
            ),
            status=order.status,
            payment_method=order.payment_method,
            payment_status=order.payment_status,
            request_message=order.request_message,
            created_at=order.created_at,
            updated_at=order.updated_at
        ))
    
    return order_responses

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """주문 상세 조회"""
    order_service = OrderService(db)
    order = order_service.get_order(order_id, current_user.id)
    
    # OrderResponse로 변환
    order_items = []
    for item in order.order_items:
        order_items.append({
            "id": item.id,
            "product": item.product,
            "quantity": item.quantity,
            "price": item.price,
            "selected_option": item.selected_option
        })
    
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        items=order_items,
        receiver=ReceiverInfo(
            name=order.receiver_name,
            phone=order.receiver_phone,
            address=order.receiver_address,
            address_detail=order.receiver_address_detail,
            zip=order.receiver_zip
        ),
        summary=OrderSummary(
            total_amount=order.total_amount,
            discount_amount=order.discount_amount,
            shipping_fee=order.shipping_fee,
            final_amount=order.final_amount
        ),
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        request_message=order.request_message,
        created_at=order.created_at,
        updated_at=order.updated_at
    )

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    update_data: OrderUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """주문 상태 수정"""
    order_service = OrderService(db)
    order = order_service.update_order_status(order_id, current_user.id, update_data)
    
    # OrderResponse로 변환
    order_items = []
    for item in order.order_items:
        order_items.append({
            "id": item.id,
            "product": item.product,
            "quantity": item.quantity,
            "price": item.price,
            "selected_option": item.selected_option
        })
    
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        items=order_items,
        receiver=ReceiverInfo(
            name=order.receiver_name,
            phone=order.receiver_phone,
            address=order.receiver_address,
            address_detail=order.receiver_address_detail,
            zip=order.receiver_zip
        ),
        summary=OrderSummary(
            total_amount=order.total_amount,
            discount_amount=order.discount_amount,
            shipping_fee=order.shipping_fee,
            final_amount=order.final_amount
        ),
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        request_message=order.request_message,
        created_at=order.created_at,
        updated_at=order.updated_at
    )

@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """주문 취소"""
    order_service = OrderService(db)
    order = order_service.cancel_order(order_id, current_user.id)
    
    # OrderResponse로 변환
    order_items = []
    for item in order.order_items:
        order_items.append({
            "id": item.id,
            "product": item.product,
            "quantity": item.quantity,
            "price": item.price,
            "selected_option": item.selected_option
        })
    
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        items=order_items,
        receiver=ReceiverInfo(
            name=order.receiver_name,
            phone=order.receiver_phone,
            address=order.receiver_address,
            address_detail=order.receiver_address_detail,
            zip=order.receiver_zip
        ),
        summary=OrderSummary(
            total_amount=order.total_amount,
            discount_amount=order.discount_amount,
            shipping_fee=order.shipping_fee,
            final_amount=order.final_amount
        ),
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        request_message=order.request_message,
        created_at=order.created_at,
        updated_at=order.updated_at
    )
