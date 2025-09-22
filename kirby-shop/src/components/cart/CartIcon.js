// src/components/cart/CartIcon.js

import React from "react";
import { ShoppingCart } from "lucide-react";

const CartIcon = ({
  count = 0,
  onClick = null,
  size = 25,
  color = null,
  showBadge = true,
  ariaLabel = "장바구니",
}) => (
  <button
    className="cart-icon-btn"
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      position: "relative",
      cursor: "pointer",
      padding: 0,
      margin: 0,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    aria-label={ariaLabel}
  >
    <ShoppingCart
      size={size}
      color={color || "#ff69b4"}
      style={{ verticalAlign: "middle" }}
      strokeWidth={2.3}
    />
    {showBadge && count > 0 && (
      <span
        className="cart-icon-badge"
        style={{
          position: "absolute",
          top: -3,
          right: -3,
          minWidth: 18,
          padding: "2px 6px",
          borderRadius: "10px",
          fontSize: 12,
          background: "#ff69b4",
          color: "#fff",
          fontWeight: 700,
          lineHeight: 1.1,
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(253,121,168,0.10)",
        }}
      >
        {count}
      </span>
    )}
  </button>
);

export default CartIcon;
