// src/components/product/ProductListItem.js

import React from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";

/**
 * 상품 리스트(목록형) 컴포넌트
 * @param {{
 *   product: 상품정보,
 *   isWishlisted: boolean,
 *   cartQuantity: number,
 *   onProductClick: function,
 *   onWishlistToggle: function,
 *   onCartAdd: function,
 *   showRating: boolean,
 *   showStock: boolean,
 *   showBadges: boolean
 * }} props
 */
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

  // 찜하기 버튼 핸들러
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!onWishlistToggle) return;
    const result = onWishlistToggle(product);
    if (result && result.success === false && result.message) {
      alert(result.message);
    }
  };

  // 장바구니 버튼 핸들러
  const handleCartAdd = (e) => {
    e.stopPropagation();
    if (!onCartAdd) return;
    const result = onCartAdd(product, 1);
    if (result && result.success === false && result.message) {
      alert(result.message);
    }
  };

  // 상품 상세 클릭
  const handleProductClick = () => {
    if (onProductClick) onProductClick(product);
  };

  // 평점 별 렌더링
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} color={i < (rating || 0) ? "#FFD700" : "#E0E0E0"} />
    ));
  };

  return (
    <div
      className="product-list-item"
      onClick={handleProductClick}
      tabIndex={0}
    >
      <div className="pli-left">
        <div className="pli-thumbnail">
          {product.image ? (
            <img src={product.image} alt={product.title} loading="lazy" />
          ) : (
            <div className="pic-fallback">이미지 없음</div>
          )}
          {/* 찜 버튼 */}
          <button
            className={`icon-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
            title={isWishlisted ? "찜 해제" : "찜하기"}
            onClick={handleWishlistToggle}
          >
            <Heart size={20} />
          </button>
        </div>
      </div>
      <div className="pli-right">
        <div className="pli-title">{product.title}</div>
        <div className="pli-price-area">
          <span className="pli-final-price">{discountedPrice.toLocaleString()}원</span>
          {product.discount > 0 && (
            <span className="pli-origin-price">{product.price.toLocaleString()}원</span>
          )}
        </div>
        {/* 장바구니 버튼 */}
        <button className="icon-btn cart-btn" onClick={handleCartAdd} title="장바구니에 담기">
          <ShoppingCart size={20} />
          {cartQuantity > 0 && <span className="pli-cart-qty">{cartQuantity}</span>}
        </button>
        {/* 재고/평점/리뷰 등 표시 */}
        <div className="pli-info-row">
          {showStock && (
            <span className={`pli-stock ${product.stock <= 0 ? 'out' : ''}`}>
              {product.stock <= 0 ? "품절" : `재고: ${product.stock}개`}
            </span>
          )}
          {showRating && (
            <span className="pli-rating">
              {renderStars(product.rating)}
              <span className="pli-review-count">({product.reviews || 0})</span>
            </span>
          )}
        </div>
        {/* 뱃지 */}
        {showBadges && (
          <div className="pli-badges">
            {product.isNew && <span className="pli-badge new">NEW</span>}
            {product.isBest && <span className="pli-badge best">BEST</span>}
            {product.isHot && <span className="pli-badge hot">HOT</span>}
            {product.discount > 0 && <span className="pli-badge discount">{product.discount}%</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListItem;
