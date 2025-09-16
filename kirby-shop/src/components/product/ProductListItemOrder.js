// src/components/product/ProductListItem.js

import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Share2 } from 'lucide-react';
import styles from '../../styles/ProductListItem.module.css';
import ProductImages from '../detail/ProductImages';

const ProductListItem = ({
  product,
  onProductClick,
  onWishlistToggle,
  onCartAdd,
  onQuantityChange,
  wishlistIds = [],
  cartItems = [],
  cartQuantity = 0,
  showRating = true,
  showStock = true,
  showDescription = true,
  showShippingInfo = true,
  layout = 'default' // 'default' or 'detail'
}) => {
  const [quantity, setQuantity] = useState(cartQuantity || 1);
  const isWishlisted = wishlistIds && Array.isArray(wishlistIds) ? wishlistIds.includes(product.id) : false;

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const handleCartAdd = (e) => {
    e.stopPropagation();
    if (onCartAdd) {
      onCartAdd(product, quantity);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) return;

    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(product.id, newQuantity);
    }
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} fill="currentColor" style={{ opacity: 0.5 }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} />);
    }

    return stars;
  };

  if (layout === 'detail') {
    return (
      <div className={`${styles.productItem} ${styles.detailLayout}`}>
        {/* 왼쪽: 상품 이미지 갤러리 */}
        <div className={styles.imageContainer}>
          <div className="product-image-area">
            <ProductImages images={product?.images || [product?.image]} />
          </div>
        </div>

        {/* 오른쪽: 상품 정보 */}
        <div className={styles.info}>
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.price}>{product.price.toLocaleString()}원</p>

          {showRating && product.rating && (
            <div className={styles.rating}>
              <div className={styles.stars}>
                {renderStars(product.rating)}
              </div>
              <span className={styles.reviewCount}>
                ({product.reviewCount || 0}개 리뷰)
              </span>
            </div>
          )}

          {showDescription && product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          {/* 수량 선택 */}
          <div className={styles.quantityControls}>
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className={styles.quantity}>{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>

          {showStock && (
            <p className={styles.stock}>
              재고: {product.stock > 0 ? `${product.stock}개` : '품절'}
            </p>
          )}

          {/* 하단 오른쪽: 배송/반품 정보 박스 */}
          {showShippingInfo && (
            <div className={styles.shippingInfo}>
              <h4>배송/반품 정보</h4>
              <ul>
                <li>무료배송</li>
                <li>평균 2-3일 내 도착</li>
                <li>7일 이내 교환/반품 가능</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 기본 레이아웃 (기존 코드)
  return (
    <div className={styles.productItem} onClick={handleProductClick}>
      <div className={styles.imageContainer}>
        <div className="product-image-area">
          <ProductImages images={product?.images || [product?.image]} />
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.iconButton} ${isWishlisted ? styles.wishlisted : ''}`}
            onClick={handleWishlistToggle}
            disabled={!onWishlistToggle}
          >
            <Heart size={20} />
          </button>
          <button
            className={styles.iconButton}
            onClick={handleCartAdd}
            disabled={!onCartAdd}
          >
            <ShoppingCart size={20} />
            {cartQuantity > 0 && (
              <span className={styles.cartCount}>({cartQuantity})</span>
            )}
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.price}>{product.price.toLocaleString()}원</p>
        {showStock && (
          <p className={styles.stock}>
            재고: {product.stock > 0 ? `${product.stock}개` : '품절'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductListItem;