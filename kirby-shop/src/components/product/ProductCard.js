// src/components/product/ProductCard.js

import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye, Zap, Crown, Sparkles, Tag, Truck } from 'lucide-react';

const ProductCard = ({
  product,
  viewMode = 'grid', // 'grid' | 'list'
  isWishlisted = false,
  cartQuantity = 0,
  onProductClick,
  onWishlistToggle,
  onCartAdd,
  onQuickView,
  showBadges = true,
  showRating = true,
  showReviews = true,
  showStock = true,
  compact = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 할인된 가격 계산
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // 재고 상태 확인
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;

  // 배지 정보
  const badges = [];
  if (product.isNew) badges.push({ text: 'NEW', type: 'new' });
  if (product.isBest) badges.push({ text: 'BEST', type: 'best' });
  if (product.isHot) badges.push({ text: 'HOT', type: 'hot' });
  if (product.discount > 0) badges.push({ text: `${product.discount}%`, type: 'discount' });

  // 상품 클릭 핸들러
  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // 찜하기 토글
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  // 장바구니 추가
  const handleCartAdd = (e) => {
    e.stopPropagation();
    if (onCartAdd) {
      onCartAdd(product);
    }
  };

  // 빠른 보기
  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  // 이미지 에러 처리
  const handleImageError = () => {
    setImageError(true);
  };

  // 평점 별 렌더링
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={14}
        className={`rating-star ${index < Math.floor(rating) ? 'filled' : ''}`}
        fill={index < Math.floor(rating) ? '#ffb6c1' : 'none'}
      />
    ));
  };

  // 리스트 뷰 렌더링
  if (viewMode === 'list') {
    return (
      <div 
        className={`product-card list-view ${isOutOfStock ? 'out-of-stock' : ''} ${compact ? 'compact' : ''}`}
        onClick={handleProductClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 이미지 영역 */}
        <div className="product-image-container">
          {imageError ? (
            <div className="image-placeholder">
              <Sparkles size={24} />
              <span>이미지 준비중</span>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.title}
              className={`product-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* 배지들 */}
          {showBadges && badges.length > 0 && (
            <div className="product-badges">
              {badges.slice(0, 2).map((badge, index) => (
                <span key={index} className={`badge ${badge.type}`}>
                  {badge.text}
                </span>
              ))}
            </div>
          )}

          {/* 재고 없음 오버레이 */}
          {isOutOfStock && (
            <div className="out-of-stock-overlay">
              <span>품절</span>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="product-info">
          <div className="product-main-info">
            <h3 className="product-title">{product.title}</h3>
            <p className="product-description">{product.description}</p>

            {/* 평점 및 리뷰 */}
            {(showRating || showReviews) && (
              <div className="product-rating">
                {showRating && (
                  <div className="stars">
                    {renderStars(product.rating)}
                  </div>
                )}
                {showRating && <span className="rating-score">{product.rating}</span>}
                {showReviews && (
                  <span className="review-count">({product.reviews}개 리뷰)</span>
                )}
              </div>
            )}

            {/* 태그들 */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="product-tag">
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 가격 및 액션 */}
          <div className="product-price-actions">
            <div className="price-section">
              {product.discount > 0 && (
                <span className="original-price">
                  {product.originalPrice?.toLocaleString() || product.price.toLocaleString()}원
                </span>
              )}
              <span className="current-price">
                {discountedPrice.toLocaleString()}원
              </span>
              {product.discount > 0 && (
                <span className="discount-rate">{product.discount}% 할인</span>
              )}
            </div>

            {/* 재고 정보 */}
            {showStock && (
              <div className="stock-info">
                {isOutOfStock ? (
                  <span className="stock-status out-of-stock">품절</span>
                ) : isLowStock ? (
                  <span className="stock-status low-stock">
                    재고 {product.stock}개 남음
                  </span>
                ) : (
                  <span className="stock-status in-stock">재고 충분</span>
                )}
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="product-actions">
              <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? '찜 해제' : '찜하기'}
              >
                <Heart size={18} fill={isWishlisted ? '#ff69b4' : 'none'} />
              </button>

              <button
                className="cart-btn"
                onClick={handleCartAdd}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} />
                {cartQuantity > 0 ? `담긴수량 ${cartQuantity}` : '장바구니'}
              </button>

              {onQuickView && (
                <button
                  className="quick-view-btn"
                  onClick={handleQuickView}
                >
                  <Eye size={18} />
                  빠른보기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 그리드 뷰 렌더링 (기본)
  return (
    <div 
      className={`product-card grid-view ${isOutOfStock ? 'out-of-stock' : ''} ${compact ? 'compact' : ''}`}
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 이미지 영역 */}
      <div className="product-image-container">
        {imageError ? (
          <div className="image-placeholder">
            <Sparkles size={32} />
            <span>이미지 준비중</span>
          </div>
        ) : (
          <>
            <img
              src={product.image}
              alt={product.title}
              className={`product-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* 호버 시 추가 이미지 */}
            {isHovered && product.images && product.images.length > 1 && (
              <img
                src={product.images[1]}
                alt={`${product.title} 추가 이미지`}
                className="product-image-hover"
                loading="lazy"
              />
            )}
          </>
        )}

        {/* 배지들 */}
        {showBadges && badges.length > 0 && (
          <div className="product-badges">
            {badges.map((badge, index) => (
              <span key={index} className={`badge ${badge.type}`}>
                {badge.type === 'best' && <Crown size={12} />}
                {badge.type === 'hot' && <Zap size={12} />}
                {badge.type === 'new' && <Sparkles size={12} />}
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* 찜하기 버튼 */}
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? '찜 해제' : '찜하기'}
        >
          <Heart size={20} fill={isWishlisted ? '#ff69b4' : 'none'} />
        </button>

        {/* 호버 액션 버튼들 */}
        <div className={`hover-actions ${isHovered ? 'visible' : ''}`}>
          {onQuickView && (
            <button
              className="hover-action-btn quick-view"
              onClick={handleQuickView}
              aria-label="빠른 보기"
            >
              <Eye size={20} />
            </button>
          )}
        </div>

        {/* 재고 없음 오버레이 */}
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>품절</span>
          </div>
        )}

        {/* 무료배송 아이콘 */}
        {product.price >= 30000 && (
          <div className="free-shipping-badge">
            <Truck size={16} />
            <span>무료배송</span>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>

        {/* 평점 및 리뷰 */}
        {(showRating || showReviews) && (
          <div className="product-rating">
            {showRating && (
              <div className="stars">
                {renderStars(product.rating)}
              </div>
            )}
            {showRating && <span className="rating-score">{product.rating}</span>}
            {showReviews && (
              <span className="review-count">({product.reviews})</span>
            )}
          </div>
        )}

        {/* 가격 */}
        <div className="price-section">
          {product.discount > 0 && (
            <span className="original-price">
              {product.originalPrice?.toLocaleString() || product.price.toLocaleString()}원
            </span>
          )}
          <span className="current-price">
            {Math.floor(discountedPrice).toLocaleString()}원
          </span>
          {product.discount > 0 && (
            <span className="discount-rate">{product.discount}%</span>
          )}
        </div>

        {/* 재고 정보 */}
        {showStock && !compact && (
          <div className="stock-info">
            {isOutOfStock ? (
              <span className="stock-status out-of-stock">품절</span>
            ) : isLowStock ? (
              <span className="stock-status low-stock">
                재고 {product.stock}개
              </span>
            ) : null}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="product-actions">
          <button
            className="cart-btn"
            onClick={handleCartAdd}
            disabled={isOutOfStock}
          >
            <ShoppingCart size={16} />
            {cartQuantity > 0 ? (
              <span className="cart-quantity">{cartQuantity}</span>
            ) : (
              '담기'
            )}
          </button>
        </div>

        {/* 상품 태그 (컴팩트 모드가 아닐 때만) */}
        {!compact && product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="product-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 로딩 스켈레톤 */}
      {!imageLoaded && !imageError && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;