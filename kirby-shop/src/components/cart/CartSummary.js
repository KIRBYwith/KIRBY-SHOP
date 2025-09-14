// src/components/cart/CartSummary.js

import React from "react";
import { ShoppingCart, CreditCard, Truck, BadgeCheck } from "lucide-react";

const CartSummary = ({
  totalQuantity = 0,
  totalPrice = 0,
  shippingFee = 3000,
  freeShippingThreshold = 30000,
  discount = 0,
  finalPrice = 0,
  onOrder = null,
  isOrdering = false,
}) => {
  // 무료배송 안내 계산
  const isFree = totalPrice >= freeShippingThreshold || totalPrice === 0 || shippingFee === 0;
  const payableShippingFee = isFree ? 0 : shippingFee;
  const displayFinalPrice =
    finalPrice ||
    Math.max(totalPrice + payableShippingFee - discount, 0);

  return (
    <div
      className="cart-summary-box"
      style={{
        background: "#fff",
        border: "1.5px solid #fde7f7",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(253, 121, 168, 0.08)",
        padding: "2rem 1.5rem",
        margin: "1.5rem 0",
        minWidth: 300,
        maxWidth: 430,
        width: "100%",
      }}
    >
      <h3 style={{ display: "flex", alignItems: "center", fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#ff1493" }}>
        <ShoppingCart size={22} style={{ marginRight: 8 }} /> 장바구니 요약
      </h3>
      <div
        className="cart-summary-list"
        style={{ fontSize: 16, fontWeight: 500, marginBottom: 18 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span>상품수량</span>
          <span>{totalQuantity || 0}개</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span>총 상품금액</span>
          <span>{totalPrice.toLocaleString()}원</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span>배송비</span>
          <span>
            {isFree ? (
              <span style={{ color: "#31c48d", fontWeight: 600 }}>무료</span>
            ) : (
              `${payableShippingFee.toLocaleString()}원`
            )}
          </span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "#339af0", marginBottom: 10 }}>
            <span>할인 (-)</span>
            <span>-{discount.toLocaleString()}원</span>
          </div>
        )}
        <div style={{ borderTop: "1px dashed #ffd1ea", marginTop: 14, marginBottom: 14 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700 }}>
          <span>결제 예정금액</span>
          <span style={{ color: "#df38a1" }}>{displayFinalPrice.toLocaleString()}원</span>
        </div>
      </div>
      {!isFree && (
        <div style={{ color: "#aaa", fontSize: 14, marginBottom: 13 }}>
          {freeShippingThreshold
            ? `${freeShippingThreshold.toLocaleString()}원 이상 구매 시 배송비 무료`
            : ""}
        </div>
      )}
      <button
        className="cart-summary-order-btn"
        disabled={totalQuantity < 1 || isOrdering}
        style={{
          width: "100%",
          padding: "1rem",
          marginTop: 10,
          background: totalQuantity < 1 ? "#e0e0e0" : "linear-gradient(90deg,#ff77bb,#ff69b4)",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 17,
          borderRadius: 12,
          border: "none",
          cursor: totalQuantity < 1 ? "not-allowed" : "pointer",
          boxShadow: totalQuantity < 1 ? "none" : "0 2px 10px #ffd7ee44",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: isOrdering ? 0.6 : 1,
        }}
        onClick={onOrder}
        aria-label="주문하기"
      >
        <CreditCard size={20} style={{ marginRight: 8 }} />
        {isOrdering ? "주문 접수중..." : "주문하기"}
      </button>
    </div>
  );
};

export default CartSummary;
