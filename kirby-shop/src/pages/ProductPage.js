// src/pages/ProductPage.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, ShoppingCart, Plus, Minus, Share2,
  Truck, Shield, RotateCcw, ChevronLeft, ChevronRight,
  Zap, Crown, Sparkles, MessageCircle, ThumbsUp, Award, Info
} from 'lucide-react';
// 상품 리스트 import 필요 (api라면 fetch로 대체)
import { productsData } from '../data/products';

const ProductPage = ({
  isWishlisted = false,
  cartQuantity = 0,
  onWishlistToggle,
  onCartAdd,
  onBuyNow,
  getRelatedProducts, // 필요하다면 prop, 아니면 페이지 내에서 연산
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);

  // 상품 데이터 로딩
  useEffect(() => {
    setLoading(true);
    const prod = productsData.find(p => String(p.id) === String(id));
    setProduct(prod || null);
    setLoading(false);
    setSelectedImageIndex(0);
    setQuantity(1);
    setSelectedOption('');
    setActiveTab('description');
    setShowFullDescription(false);
    setIsImageZoomed(false);
    setZoomPosition({ x: 0, y: 0 });
  }, [id]);

  if (loading) return <div className="product-page-loading">로딩 중...</div>;
  if (!product) return <div className="product-not-found">상품을 찾을 수 없습니다.</div>;

  // 이미지 배열
  const images = product.images || [product.image].filter(Boolean);

  // 할인 및 총 가격 계산
  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;
  const totalPrice = discountedPrice * quantity;

  // 수량 변경
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock || 999)) {
      setQuantity(newQuantity);
    }
  };
  const handleAddToCart = () => {
    if (onCartAdd) onCartAdd(product, quantity, selectedOption);
  };
  const handleBuyNow = () => {
    if (onBuyNow) onBuyNow(product, quantity, selectedOption);
  };
  const handleWishlistToggle = () => {
    if (onWishlistToggle) onWishlistToggle(product.id);
  };

  // 공유
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // 공유 취소
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  // 이미지 확대
  const handleImageMouseMove = (e) => {
    if (!isImageZoomed || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
  };

  const goToPrevImage = () => {
    setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };
  const goToNextImage = () => {
    setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  const renderStars = (rating) => (
    [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`rating-star ${index < Math.floor(rating) ? 'filled' : ''}`}
        fill={index < Math.floor(rating) ? '#ffb6c1' : 'none'}
      />
    ))
  );

  // 배지
  const badges = [];
  if (product.isNew) badges.push({ text: 'NEW', type: 'new', icon: Sparkles });
  if (product.isBest) badges.push({ text: 'BEST', type: 'best', icon: Crown });
  if (product.isHot) badges.push({ text: 'HOT', type: 'hot', icon: Zap });

  // 연관 상품 예시
  const relatedProducts = getRelatedProducts
    ? getRelatedProducts(product)
    : productsData.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="product-page">
      <div className="product-detail-container">
        {/* 좌측: 이미지 */}
        <div className="product-image-section">
          {images.length > 1 && (
            <button className="image-nav-btn prev" onClick={goToPrevImage}>
              <ChevronLeft size={24} />
            </button>
          )}
          <div 
            className={`main-image-wrapper ${isImageZoomed ? 'zoomed' : ''}`}
          >
            <img
              ref={imageRef}
              src={images[selectedImageIndex]}
              alt={product.title}
              className="main-image"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => setIsImageZoomed(true)}
              onMouseLeave={() => setIsImageZoomed(false)}
              style={isImageZoomed ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transform: 'scale(2)'
              } : {}}
            />
            <div className="zoom-hint">마우스를 올려 확대</div>
          </div>
          {images.length > 1 && (
            <button className="image-nav-btn next" onClick={goToNextImage}>
              <ChevronRight size={24} />
            </button>
          )}
          {images.length > 1 && (
            <div className="thumbnail-images">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`thumbnail ${i === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <img src={img} alt={`thumb${i}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* 우측: 상품 정보 */}
        <div className="product-info-section">
          <div className="title-row">
            <h2>{product.title}</h2>
            {/* 배지들 */}
            {badges.length > 0 &&
              <div className="product-badges">
                {badges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <span key={index} className={`badge ${badge.type}`}>
                      <Icon size={14} /> {badge.text}
                    </span>
                  );
                })}
              </div>
            }
            <button className="share-btn" onClick={handleShare} aria-label="공유하기">
              <Share2 size={20} />
            </button>
          </div>
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
            <div className="current-price">{Math.floor(discountedPrice).toLocaleString()}원</div>
          </div>
          {/* 옵션 */}
          {product.options && product.options.length > 0 && (
            <div className="product-options">
              <h4>옵션 선택</h4>
              <select 
                value={selectedOption} 
                onChange={e => setSelectedOption(e.target.value)}
                required
              >
                <option value="">옵션 선택</option>
                {product.options.map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.name} {(option.price ? `(+${option.price.toLocaleString()}원)` : '')}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* 수량 */}
          <div className="quantity-section">
            <h4>수량</h4>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={quantity}
                min="1"
                max={product.stock}
                onChange={e => handleQuantityChange(Number(e.target.value))}
              />
              <button onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= (product.stock || 999)}>
                <Plus size={16} />
              </button>
            </div>
            <div className="stock-info">
              {product.stock <= 0
                ? <span className="out-of-stock">품절</span>
                : product.stock <= 5
                  ? <span className="low-stock">재고 {product.stock}개 남음</span>
                  : <span className="in-stock">재고 충분</span>}
            </div>
          </div>
          {/* 총 가격 */}
          <div className="total-price-section">
            <span>총 금액</span>
            <span className="total-amount">{totalPrice.toLocaleString()}원</span>
          </div>
          {/* 액션 버튼 */}
          <div className="modal-actions-section">
            <button className={`wishlist-btn${isWishlisted ? ' active' : ''}`} onClick={handleWishlistToggle}>
              <Heart size={20} fill={isWishlisted ? '#ff69b4' : 'none'} />
              {isWishlisted ? '찜 해제' : '찜하기'}
            </button>
            <button
              className="cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart size={20} /> 장바구니 담기
              {cartQuantity > 0 && <span className="cart-count">({cartQuantity})</span>}
            </button>
            <button
              className="buy-btn"
              onClick={(e) => { e.preventDefault(); handleBuyNow(); }}
              disabled={product.stock <= 0}
            >
              바로 구매하기
            </button>
          </div>
          {/* 배송/보장 안내 */}
          <div className="shipping-info">
            <div className="shipping-item">
              <Truck size={16} />
              <span>{product.price >= 30000 ? '무료배송' : '배송비 3,000원 (3만원 이상 무료)'}</span>
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
        </div>
      </div>
      {/* 상세/스펙/리뷰 탭 */}
      <div className="product-details">
        <div className="tab-headers">
          <button
            className={`tab-header${activeTab === 'description' ? ' active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            <Info size={16} /> 상품설명
          </button>
          <button
            className={`tab-header${activeTab === 'specs' ? ' active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            <Award size={16} /> 상품정보
          </button>
          <button
            className={`tab-header${activeTab === 'reviews' ? ' active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageCircle size={16} /> 리뷰({product.reviews})
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <p className="product-description">{product.description}</p>
              {product.detailDescription && (
                <div className={`detail-description${showFullDescription ? ' expanded' : ''}`}>
                  <div dangerouslySetInnerHTML={{
                    __html: product.detailDescription.replace(/\n/g, '<br>')
                  }} />
                  {!showFullDescription && (
                    <button className="show-more-btn" onClick={() => setShowFullDescription(true)}>더보기</button>
                  )}
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div className="product-tags">
                  <h5>관련 태그</h5>
                  <div className="tags">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <div className="reviews-summary">
                <div className="rating-summary">
                  <div className="rating-score-large">{product.rating}</div>
                  <div className="rating-details">
                    <div className="stars-large">{renderStars(product.rating)}</div>
                    <div className="review-count">{product.reviews}개의 리뷰</div>
                  </div>
                </div>
              </div>
              <div className="reviews-list">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">구매자 {idx + 1}</span>
                        <div className="review-rating">{renderStars(4.5)}</div>
                      </div>
                      <span className="review-date">2024.03.{15 + idx}</span>
                    </div>
                    <p className="review-text">정말 귀엽고 품질도 좋아요! 커비 팬이라면 꼭 구매하세요.</p>
                    <div className="review-actions">
                      <button className="review-helpful">
                        <ThumbsUp size={14} /> 도움됨 ({5 + idx})
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
      {/* 연관 상품 */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="related-products">
          <h4>함께 보면 좋은 상품</h4>
          <div className="related-products-grid">
            {relatedProducts.map(rp => (
              <div
                key={rp.id}
                className="related-product-item"
                onClick={() => navigate(`/product/${rp.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={rp.image} alt={rp.title} />
                <div className="related-product-info">
                  <h5>{rp.title}</h5>
                  <span className="related-product-price">{rp.price.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
