// src/components/detail/ProductTabs.js
import React, { useState } from 'react';
import { Info, Package, MessageCircle, Star } from 'lucide-react';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={14}
        fill={index < Math.floor(rating) ? '#ffb6c1' : 'none'}
        stroke={index < Math.floor(rating) ? '#ffb6c1' : '#ddd'}
      />
    ));
  };

  return (
    <div className="product-tabs">
      <div className="tab-headers">
        <button
          className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          <Info size={16} />
          상품 상세
        </button>
        <button
          className={`tab-header ${activeTab === 'specs' ? 'active' : ''}`}
          onClick={() => setActiveTab('specs')}
        >
          <Package size={16} />
          상품 정보
        </button>
        <button
          className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <MessageCircle size={16} />
          리뷰 ({product?.reviewCount || 0})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'description' && (
          <div className="description-content">
            <h3>상품 설명</h3>
            <p>{product?.description || '상품 설명이 준비중입니다.'}</p>
            
            {product?.features && (
              <>
                <h4>특징</h4>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}

            {product?.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <h4>관련 태그</h4>
                <div className="tags">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="specs-content">
            <h3>상품 정보</h3>
            <table className="specs-table">
              <tbody>
                <tr>
                  <td>상품명</td>
                  <td>{product?.title}</td>
                </tr>
                <tr>
                  <td>카테고리</td>
                  <td>{product?.category}</td>
                </tr>
                <tr>
                  <td>가격</td>
                  <td>{product?.price?.toLocaleString()}원</td>
                </tr>
                {product?.specs && Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-content">
            <h3>상품 리뷰</h3>
            <div className="reviews-summary">
              <div className="rating-overview">
                <div className="rating-score">{product?.rating || 0}</div>
                <div className="rating-stars">{renderStars(product?.rating || 0)}</div>
                <div className="review-count">{product?.reviewCount || 0}개의 리뷰</div>
              </div>
            </div>

            {/* 샘플 리뷰 */}
            <div className="reviews-list">
              {[1, 2, 3].map((num) => (
                <div key={num} className="review-item">
                  <div className="review-header">
                    <span className="reviewer">구매자{num}</span>
                    <div className="review-rating">{renderStars(4)}</div>
                    <span className="review-date">2024.03.{10 + num}</span>
                  </div>
                  <p className="review-text">
                    정말 귀엽고 품질도 좋아요! 커비 팬이라면 꼭 구매하세요.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;