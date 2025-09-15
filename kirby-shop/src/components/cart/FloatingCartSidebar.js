// src/components/cart/FloatingCartSidebar.js

import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, CreditCard, UserPlus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';

const FloatingCartSidebar = ({ isOpen, onClose, onOpenWishlist }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartSummary, 
    canPurchase 
  } = useCart(user);

  const [isVisible, setIsVisible] = useState(false);
  const [showPurchaseAlert, setShowPurchaseAlert] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handlePurchase = () => {
    const purchaseCheck = canPurchase();
    
    if (purchaseCheck.canPurchase) {
      navigate('/order');
      onClose();
    } else {
      setShowPurchaseAlert(true);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup', { 
      state: { 
        redirectAfterSignup: '/order',
        message: '회원가입 후 바로 구매할 수 있습니다!'
      }
    });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className={`floating-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* 사이드바 */}
      <div className={`floating-cart-sidebar ${isOpen ? 'open' : ''}`}>
        {/* 헤더 */}
        <div className="sidebar-header">
          <div className="sidebar-title">
            <ShoppingCart size={20} />
            <span>장바구니</span>
            <span className="item-count">({cartSummary.totalQuantity})</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 장바구니 내용 */}
        <div className="sidebar-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={48} />
              <p>장바구니가 비어있습니다</p>
              <button className="continue-shopping" onClick={onClose}>
                쇼핑 계속하기
              </button>
            </div>
          ) : (
            <>
              {/* 상품 리스트 */}
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.title} />
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-title">{item.title}</h4>
                      {item.selectedOption && (
                        <p className="item-option">옵션: {item.selectedOption}</p>
                      )}
                      
                      <div className="item-price">
                        {item.discount > 0 ? (
                          <>
                            <span className="original-price">
                              {item.price.toLocaleString()}원
                            </span>
                            <span className="discounted-price">
                              {Math.floor(item.price * (1 - item.discount / 100)).toLocaleString()}원
                            </span>
                          </>
                        ) : (
                          <span className="price">
                            {item.price.toLocaleString()}원
                          </span>
                        )}
                      </div>

                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.cartItemId)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 주문 요약 */}
              <div className="order-summary">
                <div className="summary-row">
                  <span>상품금액</span>
                  <span>{cartSummary.totalPrice.toLocaleString()}원</span>
                </div>
                
                {cartSummary.totalDiscount > 0 && (
                  <div className="summary-row discount">
                    <span>할인</span>
                    <span>-{cartSummary.totalDiscount.toLocaleString()}원</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>배송비</span>
                  <span>
                    {cartSummary.shippingFee === 0 ? '무료' : `${cartSummary.shippingFee.toLocaleString()}원`}
                  </span>
                </div>
                
                {cartSummary.freeShippingRemaining > 0 && (
                  <div className="free-shipping-notice">
                    {cartSummary.freeShippingRemaining.toLocaleString()}원 더 구매하면 무료배송!
                  </div>
                )}
                
                <div className="summary-total">
                  <span>총 결제금액</span>
                  <span>{cartSummary.finalPrice.toLocaleString()}원</span>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="sidebar-actions">
                <button 
                  className="wishlist-toggle-btn"
                  onClick={onOpenWishlist}
                >
                  찜목록 보기
                </button>
                
                <button 
                  className="purchase-btn"
                  onClick={handlePurchase}
                >
                  <CreditCard size={18} />
                  {isAuthenticated ? '구매하기' : '로그인 후 구매'}
                </button>
              </div>

              {/* 비로그인 사용자 알림 */}
              {cartSummary.hasGuestItems && !isAuthenticated && (
                <div className="guest-notice">
                  <p>회원가입하면 장바구니가 계속 저장됩니다!</p>
                  <button onClick={handleSignupRedirect}>
                    <UserPlus size={16} />
                    회원가입하고 구매하기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 구매 불가 알림 모달 */}
      {showPurchaseAlert && (
        <div className="purchase-alert-modal">
          <div className="alert-content">
            <h3>로그인이 필요합니다</h3>
            <p>회원가입을 하신 후 구입하실 수 있어요.</p>
            <div className="alert-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowPurchaseAlert(false)}
              >
                취소
              </button>
              <button 
                className="signup-btn"
                onClick={handleSignupRedirect}
              >
                회원가입하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .floating-sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .floating-sidebar-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .floating-cart-sidebar {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          height: 100vh;
          background: white;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          transition: right 0.3s ease;
        }
        
        .floating-cart-sidebar.open {
          right: 0;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: #ff69b4;
          color: white;
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .item-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .empty-cart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 2rem;
          text-align: center;
          color: #666;
        }

        .continue-shopping {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #ff69b4;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .cart-items {
          flex: 1;
          padding: 1rem;
        }

        .cart-item {
          display: flex;
          gap: 12px;
          padding: 1rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-title {
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .item-option {
          font-size: 0.8rem;
          color: #666;
          margin: 0 0 8px 0;
        }

        .item-price {
          margin-bottom: 8px;
        }

        .original-price {
          font-size: 0.8rem;
          color: #999;
          text-decoration: line-through;
          margin-right: 4px;
        }

        .discounted-price,
        .price {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ff1493;
        }

        .item-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 2px;
        }

        .quantity-controls button {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 4px;
        }

        .quantity-controls button:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .quantity-controls button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quantity {
          min-width: 30px;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .remove-btn:hover {
          color: #ff4757;
          background: #fff1f1;
        }

        .order-summary {
          padding: 1rem;
          border-top: 1px solid #eee;
          background: #f9f9f9;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .summary-row.discount {
          color: #28a745;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 1.1rem;
          color: #ff1493;
          padding-top: 8px;
          border-top: 1px solid #ddd;
          margin-top: 8px;
        }

        .free-shipping-notice {
          background: #e8f4fd;
          color: #1976d2;
          padding: 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          text-align: center;
          margin: 8px 0;
        }

        .sidebar-actions {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wishlist-toggle-btn {
          padding: 0.75rem;
          background: #f8f9fa;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .wishlist-toggle-btn:hover {
          background: #e9ecef;
        }

        .purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 1rem;
          background: #ff69b4;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .purchase-btn:hover {
          background: #ff1493;
        }

        .guest-notice {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          padding: 1rem;
          margin: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .guest-notice p {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #d84315;
        }

        .guest-notice button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          background: #ff6f00;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0 auto;
        }

        .purchase-alert-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        }

        .alert-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          max-width: 300px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .alert-content h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .alert-content p {
          margin: 0 0 1.5rem 0;
          color: #666;
          line-height: 1.5;
        }

        .alert-actions {
          display: flex;
          gap: 8px;
        }

        .cancel-btn {
          flex: 1;
          padding: 0.75rem;
          background: #f8f9fa;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
        }

        .signup-btn {
          flex: 1;
          padding: 0.75rem;
          background: #ff69b4;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .floating-cart-sidebar {
            width: 100vw;
            right: -100vw;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingCartSidebar;