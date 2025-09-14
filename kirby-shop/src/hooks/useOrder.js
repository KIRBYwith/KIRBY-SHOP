// src/hooks/useOrder.js

import { useState, useCallback } from "react";

// 기본 주문 상태 구조 (상품, 수량, 옵션, 배송지, 결제 등)
const initialOrderState = {
  step: 0,            // 0:장바구니, 1:주문입력, 2:결제, 3:완료
  items: [],          // [{product, quantity, selectedOption}]
  address: null,      // 배송지 정보
  receiver: null,     // 받는사람 정보
  payment: null,      // 결제정보 (결제수단, 결제결과 등)
  coupon: null,       // 사용한 쿠폰정보
  shippingFee: 3000,  // 기본배송비
  discount: 0,        // 총 할인 금액
  request: "",        // 배송요청사항
  orderId: null,      // 주문 고유번호(주문완료시)
  status: "ready",    // ready,paying,paid,failed,done
  error: null,
};

export const useOrder = (cartItems = []) => {
  // 주문 오브젝트 정의 (cartItems가 변경될 때 자동 sync)
  const [order, setOrder] = useState({
    ...initialOrderState,
    items: cartItems?.map((item) => ({
      product: item.product || item,
      quantity: item.quantity || 1,
      selectedOption: item.selectedOption || null,
    })) || [],
  });

  // step 변경
  const setStep = (newStep) => setOrder((o) => ({ ...o, step: newStep }));

  // 상품/수량/옵션 조정
  const updateItem = useCallback((idx, data) => {
    setOrder((o) => {
      const items = o.items.map((it, i) => (i === idx ? { ...it, ...data } : it));
      return { ...o, items };
    });
  }, []);

  const addItem = (item) => setOrder((o) => ({ ...o, items: [...o.items, item] }));
  const removeItem = (idx) => setOrder((o) => ({ ...o, items: o.items.filter((_, i) => i !== idx) }));

  // 배송지, 받는사람, 결제 등 입력
  const setAddress = (addressObj) => setOrder((o) => ({ ...o, address: addressObj }));
  const setReceiver = (receiverObj) => setOrder((o) => ({ ...o, receiver: receiverObj }));
  const setPayment = (paymentObj) => setOrder((o) => ({ ...o, payment: paymentObj }));
  const setCoupon = (couponObj) => setOrder((o) => ({ ...o, coupon: couponObj }));

  // 배송요청사항/메시지
  const setRequest = (request) => setOrder((o) => ({ ...o, request }));

  // 전체 금액 계산
  const getSummary = useCallback(() => {
    const items = order.items || [];
    let total = 0;
    let quantity = 0;
    let discount = 0;
    for (const { product, quantity: qty } of items) {
      const price = (product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price);
      total += price * qty;
      quantity += qty;
      if (product.discount > 0) discount += (product.price - price) * qty;
    }
    // 쿠폰 적용
    if (order.coupon?.discountAmount) discount += order.coupon.discountAmount;
    // 배송비 계산(무료조건 예시: 3만원 이상)
    const needShippingFee = total < 30000 && order.shippingFee > 0;
    return {
      totalQuantity: quantity,
      totalPrice: total,
      discount,
      shippingFee: needShippingFee ? order.shippingFee : 0,
      payable: Math.max(total + (needShippingFee ? order.shippingFee : 0) - discount, 0),
    };
  }, [order.items, order.shippingFee, order.coupon]);

  // 주문 제출(결제 진행 등)
  const submitOrder = async () => {
    // 주문 로직, 결제 API 연동, etc
    setOrder((o) => ({ ...o, status: "paying", error: null }));
    try {
      // 실제 결제 연동 로직(Gateway 등) 필요
      // 아래는 placeholder -- 성공 시:
      await new Promise((res) => setTimeout(res, 1300));
      const newOrderId = `ORD-${Date.now()}`;
      setOrder((o) => ({
        ...o,
        status: "done",
        step: 3,
        orderId: newOrderId,
        error: null,
      }));
      return { success: true, orderId: newOrderId };
    } catch (error) {
      setOrder((o) => ({ ...o, status: "failed", error: error?.message || "결제 실패" }));
      return { success: false, error };
    }
  };

  // 리셋
  const resetOrder = () => setOrder(initialOrderState);

  return {
    order,
    setOrder,
    setStep,
    addItem,
    updateItem,
    removeItem,
    setAddress,
    setReceiver,
    setPayment,
    setCoupon,
    setRequest,
    getSummary,
    submitOrder,
    resetOrder,
  };
};

export default useOrder;
