// src/components/product/ProductListItem.js

import React from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";

const ProductListItem = ({
  product,
  isWishlisted = false,
  cartQuantity = 0,
  onProductClick,
  onWishlistToggle,
  onCartAdd,
  showRating = true,
  showStock = true,
  showBadges = true,
}) => {
  if (!product) return null;

  // 할인 가격 계산
  const discountedPrice =
    product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

  return (
    <div
      className="product-list-item"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1.3rem",
        borderRadius: 16,
        background: "#fff",
        marginBottom: 18,
        boxShadow: "0 2px 12px rgba(253, 121, 168, 0.05)",
        border: "1.5px solid #fcf1fa",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => onProductClick && onProductClick(product)}
      tabIndex={0}
    >
      <div
        style={{
          minWidth: 105,
          minHeight: 105,
          width: 105,
          height: 105,
          overflow: "hidden",
          borderRadius: 14,
          marginRight: 22,
          background: "#f8f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={product.image}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold", fontSize: 18 }}>
          {product.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#666",
            margin: "0.3rem 0 0.2rem 0",
            wordBreak: "break-all",
          }}
        >
          {product.description}
        </div>
        {showRating && (
          <div style={{ display: "flex", alignItems: "center", margin: "0.15rem 0" }}>
            {[...Array(5)].map((_, idx) => (
              <Star
                key={idx}
                size={14}
                style={{ marginRight: 1 }}
                color={idx < Math.round(product.rating) ? "#ff69b4" : "#ede7ef"}
                fill={idx < Math.round(product.rating) ? "#ff69b4" : "none"}
              />
            ))}
            <span style={{ fontSize: 13, marginLeft: 5, color: "#b892bc" }}>
              ({product.reviews || 0})
            </span>
          </div>
        )}
        <div style={{ margin: "0.5rem 0", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 17, fontWeight: 700, color: "#ff1493"
          }}>
            {discountedPrice.toLocaleString()}원
          </span>
          {product.discount > 0 && (
            <span style={{
              textDecoration: "line-through",
              fontSize: 13,
              color: "#bbb",
            }}>
              {product.price.toLocaleString()}원
            </span>
          )}
          {showBadges && product.discount > 0 && (
            <span style={{
              fontWeight: "bold",
              color: "#fff",
              background: "linear-gradient(45deg, #ff76c3, #fdcb6e)",
              borderRadius: 9,
              fontSize: 12,
              padding: "2px 8px",
              marginLeft: 6,
            }}>
              -{product.discount}%
            </span>
          )}
        </div>
        {showStock && (
          <div style={{
            fontSize: 13,
            color:
              product.stock > 10
                ? "#31c48d"
                : product.stock > 0
                ? "#f6b93b"
                : "#e74c3c",
            fontWeight: 600,
            marginTop: 1,
          }}>
            {product.stock > 10
              ? "재고 있음"
              : product.stock > 0
              ? `재고 ${product.stock}개`
              : "품절"}
          </div>
        )}
      </div>
      {/* 오른쪽 액션버튼 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 15 }}>
        {/* 찜 */}
        <button
          aria-label={isWishlisted ? "찜 해제" : "찜하기"}
          onClick={e => {
            e.stopPropagation();
            onWishlistToggle && onWishlistToggle(product.id);
          }}
          style={{
            background: isWishlisted ? "#ff69b4" : "#f7f7f7",
            color: isWishlisted ? "#fff" : "#ff69b4",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0.5px 4px rgba(253, 121, 168, 0.09)",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          <Heart fill={isWishlisted ? "#ff69b4" : "none"} strokeWidth={2.3} />
        </button>
        {/* 장바구니 */}
        <button
          aria-label="장바구니에 담기"
          onClick={e => {
            e.stopPropagation();
            onCartAdd && onCartAdd(product);
          }}
          disabled={product.stock < 1}
          style={{
            background: "#ffe0f4",
            color: "#df38a1",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: product.stock < 1 ? "not-allowed" : "pointer",
            fontSize: 18,
            opacity: product.stock < 1 ? 0.5 : 1
          }}
        >
          <ShoppingCart />
          {cartQuantity > 0 && (
            <span style={{
              position: "absolute",
              top: 7,
              right: 7,
              fontSize: 11,
              fontWeight: "bold",
              color: "#fff",
              background: "#ff69b4",
              borderRadius: "50%",
              padding: "1.5px 5px",
              lineHeight: 1.1
            }}>
              {cartQuantity}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductListItem;
