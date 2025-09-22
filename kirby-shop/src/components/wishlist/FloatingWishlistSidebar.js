// src/components/wishlist/FloatingWishlistSidebar.js

import React, { useState, useEffect } from 'react';
import { Heart, X, ShoppingCart, CreditCard, UserPlus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';

const FloatingWishlistSidebar = ({ isOpen, onClose, onOpenCart }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    wishlistItems, 
    removeFromWishlist, 
    getWishlistStats,
    canPurchaseWishlist 
  } = useWishlist(user);
  const { addToCart } = useCart(user);

  const [isVisible, setIsVisible] = useState(false);
  const [showPurchaseAlert, setShowPurchaseAlert] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const stats = getWishlistStats();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistItems.map(item => item.id)));
    }
  };

  const handleAddToCart = (item) => {
    const result = addToCart(item, 1);
    if (result.success) {
      // 성공 시 알림 표시 (선택사항)
    }
  };

  const handleAddSelectedToCart = () => {
    const selectedWishlistItems = wishlistItems.filter(item => 
      selectedItems.has(item.id)
    );
    
    selectedWishlistItems.forEach(item => {
      addToCart(item, 1);
    });
    
    setSelectedItems(new Set());
    onOpenCart();
  };

  const handlePurchaseSelected = () => {
    const purchaseCheck = canPurchaseWishlist();
    
    if (purchaseCheck.canPurchase) {
      // 선택된 상품들을 장바구니에 추가하고 주문페이지로 이동
      handleAddSelectedToCart();
      navigate('/order');
      onClose();
    } else {
      setShowPurchaseAlert(true);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup', { 
      state: { 
        redirectAfterSignup: '/wishlist',
        message: '회원가입 후 찜목록을 계속 이용하실 수 있습니다!'
      }
    });
    onClose();
  };

  const handleRemoveSelected = () => {
    selectedItems.forEach(itemId => {
      removeFromWishlist(itemId);
    });
    setSelectedItems(new Set());
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
      <div className={`floating-wishlist-sidebar ${isOpen ? 'open' : ''}`}>
        {/* 헤더 */}
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Heart size={20} />
            <span>찜목록</span>
            <span className="item-count">({wishlistItems.length})</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 찜목록 내용 */}
        <div className="sidebar-content">
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
              <Heart size={48} />
              <p>찜한 상품이 없습니다</p>
              <button className="continue-shopping" onClick={onClose}>
                쇼핑 계속하기
              </button>
            </div>
          ) : (
            <>
              {/* 선택 컨트롤 */}
              <div className="selection-controls">
                <label className="select-all">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === wishlistItems.length && wishlistItems.length > 0}
                    onChange={handleSelectAll}
                  />
                  전체선택 ({selectedItems.size}/{wishlistItems.length})
                </label>
                
                {selectedItems.size > 0 && (
                  <div className="selected-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={handleAddSelectedToCart}
                    >
                      장바구니 담기
                    </button>
                    <button 
                      className="remove-selected-btn"
                      onClick={handleRemoveSelected}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* 상품 리스트 */}
              <div className="wishlist-items">
                {wishlistItems.map((item) => (
                  <div key={item.wishlistId} className="wishlist-item">
                    <label className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </label>
                    
                    <div className="item-image">
                      <img src={item.image} alt={item.title} />
                      {item.stock <= 0 && (
                        <div className="stock-overlay">품절</div>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-title">{item.title}</h4>
                      
                      <div className="item-price">
                        {item.discount > 0 ? (
                          <>
                            <span className="original-price">
                              {item.price.toLocaleString()}원
                            </span>
                            <span className="discounted-price">
                              {Math.floor(item.price * (1 - item.discount / 100)).toLocaleString()}원
                            </span>
                            <span className="discount-badge">
                              {item.discount}%
                            </span>
                          </>
                        ) : (
                          <span className="price">
                            {item.price.toLocaleString()}원
                          </span>
                        )}
                      </div>

                      <div className="item-actions">
                        <button 
                          className="cart-add-btn"
                          onClick={() => handleAddToCart(item)}
                          disabled={item.stock <= 0}
                        >
                          <ShoppingCart size={14} />
                          장바구니
                        </button>
                        
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {item.stock <= 5 && item.stock > 0 && (
                        <div className="stock-notice">
                          재고 {item.stock}개 남음
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 찜목록 요약 */}
              <div className="wishlist-summary">
                <div className="summary-row">
                  <span>총 상품수</span>
                  <span>{stats.totalCount}개</span>
                </div>
                
                <div className="summary-row">
                  <span>총 상품금액</span>
                  <span>{stats.totalValue.toLocaleString()}원</span>
                </div>
                
                {stats.discountedCount > 0 && (
                  <div className="summary-row discount">
                    <span>할인 상품</span>
                    <span>{stats.discountedCount}개</span>
                  </div>
                )}
                
                {stats.outOfStockCount > 0 && (
                  <div className="summary-row out-of-stock">
                    <span>품절 상품</span>
                    <span>{stats.outOfStockCount}개</span>
                  </div>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="sidebar-actions">
                <button 
                  className="cart-toggle-btn"
                  onClick={onOpenCart}
                >
                  장바구니 보기
                </button>
                
                {selectedItems.size > 0 && (
                  <button 
                    className="purchase-selected-btn"
                    onClick={handlePurchaseSelected}
                  >
                    <CreditCard size={18} />
                    선택상품 구매 ({selectedItems.size}개)
                  </button>
                )}
              </div>

              {/* 비로그인 사용자 알림 */}
              {stats.hasGuestItems && !isAuthenticated && (
                <div className="guest-notice">
                  <p>회원가입하면 찜목록이 계속 저장됩니다!</p>
                  <button onClick={handleSignupRedirect}>
                    <UserPlus size={16} />
                    회원가입하고 계속 이용하기
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

        .floating-wishlist-sidebar {
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
        
        .floating-wishlist-sidebar.open {
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

        .empty-wishlist {
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

        .selection-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
          background: #f9f9f9;
        }

        .select-all {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .selected-actions {
          display: flex;
          gap: 8px;
        }

        .add-to-cart-btn {
          padding: 0.5rem 1rem;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .remove-selected-btn {
          padding: 0.5rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .wishlist-items {
          flex: 1;
          padding: 0 1rem;
        }

        .wishlist-item {
          display: flex;
          gap: 12px;
          padding: 1rem 0;
          border-bottom: 1px solid #f0f0f0;
          align-items: flex-start;
        }

        .item-checkbox {
          margin-top: 8px;
          cursor: pointer;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-title {
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .item-price {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .original-price {
          font-size: 0.8rem;
          color: #999;
          text-decoration: line-through;
        }

        .discounted-price,
        .price {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ff1493;
        }

        .discount-badge {
          background: #ff1493;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .item-actions {
          display: flex;
          gap: 6px;
          margin-bottom: 4px;
        }

        .cart-add-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0.4rem 0.8rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cart-add-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .cart-add-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .remove-btn:hover {
          color: #ff4757;
          background: #fff1f1;
        }

        .stock-notice {
          font-size: 0.7rem;
          color: #ff6b35;
          background: #fff3e0;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }

        .wishlist-summary {
          padding: 1rem;
          border-top: 1px solid #eee;
          background: #f9f9f9;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 0.9rem;
        }

        .summary-row.discount {
          color: #28a745;
        }

        .summary-row.out-of-stock {
          color: #dc3545;
        }

        .sidebar-actions {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cart-toggle-btn {
          padding: 0.75rem;
          background: #f8f9fa;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .cart-toggle-btn:hover {
          background: #e9ecef;
        }

        .purchase-selected-btn {
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

        .purchase-selected-btn:hover {
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
          .floating-wishlist-sidebar {
            width: 100vw;
            right: -100vw;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingWishlistSidebar;