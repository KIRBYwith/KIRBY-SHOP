// src/components/product/ProductModal.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Star, Heart, ShoppingCart, Plus, Minus, Share2, 
  Truck, Shield, RotateCcw, ChevronLeft, ChevronRight,
  Zap, Crown, Sparkles, MessageCircle, ThumbsUp, Award, Info
} from 'lucide-react';

const ProductModal = ({
  product,
  isOpen,
  onClose,
  isWishlisted = false,
  cartQuantity = 0,
  onWishlistToggle,
  onCartAdd,
  onBuyNow,
  relatedProducts = []
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'specs', 'reviews'
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const modalRef = useRef(null);
  const imageRef = useRef(null);

  // 이미지 배열 (메인 이미지 + 추가 이미지들)
  const images = product?.images || [product?.image].filter(Boolean);

  // 할인된 가격 계산
  const discountedPrice = product?.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product?.price || 0;

  // 총 가격 계산
  const totalPrice = discountedPrice * quantity;

  // 모달 열림/닫힘 처리
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 포커스 트랩
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 수량 변경
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 추가
  const handleAddToCart = () => {
    if (onCartAdd && product) {
      onCartAdd(product, quantity, selectedOption);
    }
  };

  // 바로 구매
  const handleBuyNow = () => {
    if (onBuyNow && product) {
      onBuyNow(product, quantity, selectedOption);
    }
  };

  // 찜하기 토글
  const handleWishlistToggle = () => {
    if (onWishlistToggle && product) {
      onWishlistToggle(product.id);
    }
  };

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  // 이미지 확대/축소
  const handleImageMouseMove = (e) => {
    if (!isImageZoomed || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
  };

  // 이미지 네비게이션
  const goToPrevImage = () => {
    setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const goToNextImage = () => {
    setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  // 평점 별 렌더링
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`rating-star ${index < Math.floor(rating) ? 'filled' : ''}`}
        fill={index < Math.floor(rating) ? '#ffb6c1' : 'none'}
      />
    ));
  };

  // 배지 정보
  const badges = [];
  if (product?.isNew) badges.push({ text: 'NEW', type: 'new', icon: Sparkles });
  if (product?.isBest) badges.push({ text: 'BEST', type: 'best', icon: Crown });
  if (product?.isHot) badges.push({ text: 'HOT', type: 'hot', icon: Zap });

  if (!isOpen || !product) return null;

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div 
        className="product-modal"
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>{product.title}</h2>
            {badges.length > 0 && (
              <div className="modal-badges">
                {badges.map((badge, index) => {
                  const IconComponent = badge.icon;
                  return (
                    <span key={index} className={`badge ${badge.type}`}>
                      <IconComponent size={14} />
                      {badge.text}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="modal-actions">
            <button className="share-btn" onClick={handleShare} aria-label="공유하기">
              <Share2 size={20} />
            </button>
            <button className="close-btn" onClick={onClose} aria-label="모달 닫기">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 모달 콘텐츠 */}
        <div className="modal-content">
          {/* 이미지 영역 */}
          <div className="modal-image-section">
            <div className="main-image-container">
              {images.length > 1 && (
                <button className="image-nav-btn prev" onClick={goToPrevImage}>
                  <ChevronLeft size={24} />
                </button>
              )}
              
              <div 
                className={`main-image-wrapper ${isImageZoomed ? 'zoomed' : ''}`}
                onClick={() => setIsImageZoomed(!isImageZoomed)}
              >
                <img
                  ref={imageRef}
                  src={images[selectedImageIndex]}
                  alt={product.title}
                  className="main-image"
                  onMouseMove={handleImageMouseMove}
                  style={isImageZoomed ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(2)'
                  } : {}}
                />
              </div>

              {images.length > 1 && (
                <button className="image-nav-btn next" onClick={goToNextImage}>
                  <ChevronRight size={24} />
                </button>
              )}

              {/* 이미지 확대 안내 */}
              <div className="zoom-hint">
                클릭하여 {isImageZoomed ? '축소' : '확대'}
              </div>
            </div>

            {/* 썸네일 이미지들 */}
            {images.length > 1 && (
              <div className="thumbnail-images">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 영역 */}
          <div className="modal-info-section">
            {/* 기본 정보 */}
            <div className="product-basic-info">
              {/* 평점 및 리뷰 */}
              <div className="product-rating">
                <div className="stars">
                  {renderStars(product.rating)}
                </div>
                <span className="rating-score">{product.rating}</span>
                <span className="review-count">({product.reviews}개 리뷰)</span>
              </div>

              {/* 가격 */}
              <div className="price-section">
                {product.discount > 0 && (
                  <div className="original-price-section">
                    <span className="original-price">
                      {product.originalPrice?.toLocaleString() || product.price.toLocaleString()}원
                    </span>
                    <span className="discount-rate">{product.discount}% 할인</span>
                  </div>
                )}
                <div className="current-price">
                  {Math.floor(discountedPrice).toLocaleString()}원
                </div>
              </div>

              {/* 배송 정보 */}
              <div className="shipping-info">
                <div className="shipping-item">
                  <Truck size={16} />
                  <span>
                    {product.price >= 30000 ? '무료배송' : '배송비 3,000원 (3만원 이상 무료)'}
                  </span>
                </div>
                <div className="shipping-item">
                  <Shield size={16} />
                  <span>안전결제 보장</span>
                </div>
                <div className="shipping-item">
                  <RotateCcw size={16} />
                  <span>7일 무료 교환/반품</span>
                </div>
              </div>

              {/* 옵션 선택 (있는 경우) */}
              {product.options && product.options.length > 0 && (
                <div className="product-options">
                  <h4>옵션 선택</h4>
                  <select 
                    value={selectedOption} 
                    onChange={(e) => setSelectedOption(e.target.value)}
                    required
                  >
                    <option value="">옵션을 선택해주세요</option>
                    {product.options.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.name} {option.price && `(+${option.price.toLocaleString()}원)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 수량 선택 */}
              <div className="quantity-section">
                <h4>수량</h4>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max={product.stock}
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock || 999)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="stock-info">
                  {product.stock <= 0 ? (
                    <span className="out-of-stock">품절</span>
                  ) : product.stock <= 5 ? (
                    <span className="low-stock">재고 {product.stock}개 남음</span>
                  ) : (
                    <span className="in-stock">재고 충분</span>
                  )}
                </div>
              </div>

              {/* 총 가격 */}
              <div className="total-price-section">
                <div className="total-price">
                  <span>총 금액</span>
                  <span className="total-amount">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="modal-actions-section">
                <button
                  className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                >
                  <Heart size={20} fill={isWishlisted ? '#ff69b4' : 'none'} />
                  {isWishlisted ? '찜 해제' : '찜하기'}
                </button>

                <button
                  className="cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart size={20} />
                  장바구니 담기
                  {cartQuantity > 0 && (
                    <span className="cart-count">({cartQuantity})</span>
                  )}
                </button>

                <button
                  className="buy-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  바로 구매하기
                </button>
              </div>
            </div>

            {/* 상세 정보 탭 */}
            <div className="product-details">
              <div className="tab-headers">
                <button
                  className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  <Info size={16} />
                  상품 설명
                </button>
                <button
                  className={`tab-header ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  <Award size={16} />
                  상품 정보
                </button>
                <button
                  className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <MessageCircle size={16} />
                  리뷰 ({product.reviews})
                </button>
              </div>

              <div className="tab-content">
                {/* 상품 설명 */}
                {activeTab === 'description' && (
                  <div className="description-content">
                    <p className="product-description">{product.description}</p>
                    {product.detailDescription && (
                      <div className={`detail-description ${showFullDescription ? 'expanded' : ''}`}>
                        <div dangerouslySetInnerHTML={{ 
                          __html: product.detailDescription.replace(/\n/g, '<br>') 
                        }} />
                        {!showFullDescription && (
                          <button 
                            className="show-more-btn"
                            onClick={() => setShowFullDescription(true)}
                          >
                            더보기
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* 태그들 */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="product-tags">
                        <h5>관련 태그</h5>
                        <div className="tags">
                          {product.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 상품 정보 */}
                {activeTab === 'specs' && (
                  <div className="specs-content">
                    {product.specifications ? (
                      <table className="specs-table">
                        <tbody>
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <tr key={key}>
                              <td className="spec-label">{key}</td>
                              <td className="spec-value">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>상세 정보가 준비중입니다.</p>
                    )}
                  </div>
                )}

                {/* 리뷰 */}
                {activeTab === 'reviews' && (
                  <div className="reviews-content">
                    <div className="reviews-summary">
                      <div className="rating-summary">
                        <div className="rating-score-large">{product.rating}</div>
                        <div className="rating-details">
                          <div className="stars-large">
                            {renderStars(product.rating)}
                          </div>
                          <div className="review-count">{product.reviews}개의 리뷰</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 리뷰 목록 (샘플) */}
                    <div className="reviews-list">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <span className="reviewer-name">구매자 {index + 1}</span>
                              <div className="review-rating">
                                {renderStars(4.5)}
                              </div>
                            </div>
                            <span className="review-date">2024.03.{15 + index}</span>
                          </div>
                          <p className="review-text">
                            정말 귀엽고 품질도 좋아요! 커비 팬이라면 꼭 구매하세요.
                          </p>
                          <div className="review-actions">
                            <button className="review-helpful">
                              <ThumbsUp size={14} />
                              도움됨 ({5 + index})
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button className="view-all-reviews">
                        모든 리뷰 보기 ({product.reviews}개)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 관련 상품 (있는 경우) */}
            {relatedProducts.length > 0 && (
              <div className="related-products">
                <h4>함께 보면 좋은 상품</h4>
                <div className="related-products-grid">
                  {relatedProducts.slice(0, 4).map(relatedProduct => (
                    <div key={relatedProduct.id} className="related-product-item">
                      <img src={relatedProduct.image} alt={relatedProduct.title} />
                      <div className="related-product-info">
                        <h5>{relatedProduct.title}</h5>
                        <span className="related-product-price">
                          {relatedProduct.price.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;