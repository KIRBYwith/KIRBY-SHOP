// src/components/detail/ProductInfo.js
import React from 'react';
import { Plus, Minus, Star } from 'lucide-react';

const ProductInfo = ({ 
  product, 
  quantity, 
  setQuantity, 
  selectedOption, 
  setSelectedOption 
}) => {
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < Math.floor(rating) ? '#ffb6c1' : 'none'}
        stroke={index < Math.floor(rating) ? '#ffb6c1' : '#ddd'}
      />
    ));
  };

  return (
    <div className="product-info">
      {/* 평점 */}
      <div className="rating-section">
        <div className="stars">{renderStars(product?.rating || 0)}</div>
        <span className="rating-text">
          {product?.rating || 0} ({product?.reviewCount || 0}개 리뷰)
        </span>
      </div>

      {/* 상품 설명 */}
      <p className="product-description">{product?.description}</p>

      {/* 배지 */}
      <div className="product-badges">
        {product?.isNew && <span className="badge new">NEW</span>}
        {product?.isBestSeller && <span className="badge best">BEST</span>}
        {product?.isLimited && <span className="badge limited">LIMITED</span>}
      </div>

      {/* 옵션 선택 (있는 경우) */}
      {product?.options && product.options.length > 0 && (
        <div className="option-section">
          <h4>옵션 선택</h4>
          <select 
            value={selectedOption} 
            onChange={(e) => setSelectedOption(e.target.value)}
            className="option-select"
          >
            <option value="">옵션을 선택하세요</option>
            {product.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      )}

      {/* 수량 선택 */}
      <div className="quantity-section">
        <h4>수량</h4>
        <div className="quantity-controls">
          <button 
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="quantity-btn"
          >
            <Minus size={16} />
          </button>
          <input 
            type="number" 
            value={quantity} 
            readOnly 
            className="quantity-input"
          />
          <button 
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= (product?.stock || 99)}
            className="quantity-btn"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* 재고 정보 */}
      <div className="stock-info">
        {product?.stock === 0 ? (
          <span className="out-of-stock">품절</span>
        ) : product?.stock <= 5 ? (
          <span className="low-stock">재고 {product?.stock}개 남음</span>
        ) : (
          <span className="in-stock">재고 있음</span>
        )}
      </div>

      {/* 배송 정보 */}
      <div className="shipping-info">
        <p>• {product?.price >= 30000 ? '무료배송' : '배송비 3,000원 (3만원 이상 무료)'}</p>
        <p>• 평균 2-3일 내 도착</p>
        <p>• 7일 이내 교환/반품 가능</p>
      </div>
    </div>
  );
};

export default ProductInfo;