// src/components/detail/RelatedProducts.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RelatedProducts = ({ products = [] }) => {
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

  if (products.length === 0) return null;

  return (
    <div className="related-products">
      <h2>관련 상품</h2>
      <div className="related-products-grid">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="related-product-card"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="product-image">
              <img src={product.image} alt={product.title} />
              {product.discount > 0 && (
                <span className="discount-badge">{product.discount}%</span>
              )}
            </div>
            <div className="product-info">
              <h4>{product.title}</h4>
              <div className="price">
                {product.discount > 0 ? (
                  <>
                    <span className="discounted">
                      {Math.floor(product.price * (1 - product.discount / 100)).toLocaleString()}원
                    </span>
                    <span className="original">
                      {product.price.toLocaleString()}원
                    </span>
                  </>
                ) : (
                  <span>{product.price.toLocaleString()}원</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;