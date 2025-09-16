import React from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
// 장바구니 목록: ProductListItem, ProductCard 등 원하는 컴포넌트 사용
import ProductListItem from '../components/product/ProductListItemOrder'; // 리스트형
import '../styles/CartPage.css';

import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
// import { useHistory } from 'react-router-dom';

const CartPage = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, finalPrice, shippingFee, cartSummary } = useCart(user);
  const navigate = useNavigate();

  const handleOrder = () => {
    if (!user) {
      alert('로그인 후 주문해 주세요!');
      return;
    }
    navigate('/order');
  };

  // 개별 아이템 삭제 함수
  const handleRemoveItem = (cartItemId) => {
    if (window.confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) {
      removeFromCart(cartItemId);
    }
  };

  if (cartSummary.isEmpty) {
    return (
      <div className="page-container cart-page">
        <Header />
        <div className="page-content">
          <div className="empty-cart">
            <h2>장바구니가 비어 있습니다.</h2>
            <p>원하는 상품을 장바구니에 담아보세요!</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      <Header />
      <div className="page-content">
        <div className="cart-main">
          {/* 헤더 */}
          <div className="cart-header">
            <h2 className="cart-title">장바구니</h2>
            <button onClick={clearCart} className="clear-cart-btn">전체 비우기</button>
          </div>

          {/* 상품 리스트 */}
          <div className="cart-items-container">
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.cartItemId || item.id} className="cart-item-wrapper">
                  <ProductListItem
                    product={item}
                    cartQuantity={item.quantity}
                    onCartAdd={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    onQuantityChange={(productId, newQuantity) => {
                      // 수량이 0 이하가 되면 삭제 확인
                      if (newQuantity <= 0) {
                        handleRemoveItem(item.cartItemId);
                      } else {
                        updateQuantity(item.cartItemId, newQuantity);
                      }
                    }}
                    onWishlistToggle={null}
                    showRating={true}
                    showStock={true}
                    showDescription={true}
                    showShippingInfo={true}
                    layout="detail"
                    onProductClick={null}
                    wishlistIds={[]}
                    cartItems={cartItems}
                  />
                  {/* 개별 삭제 버튼 */}
                  <button 
                    className="remove-item-btn" 
                    onClick={() => handleRemoveItem(item.cartItemId)}
                    title="상품 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="payment-summary">
            <h4>결제 정보</h4>
            <div className="payment-row">
              <span>총 상품금액</span>
              <span>{cartSummary.originalTotalPrice.toLocaleString()}원</span>
            </div>
            <div className="payment-row">
              <span>총 할인</span>
              <span className="discount">-{cartSummary.totalDiscount.toLocaleString()}원</span>
            </div>
            <div className="payment-row">
              <span>배송비</span>
              <span>{shippingFee === 0 ? '무료' : shippingFee.toLocaleString() + '원'}</span>
            </div>
            <div className="payment-row final">
              <span>최종 결제금액</span>
              <span>{finalPrice.toLocaleString()}원</span>
            </div>
            <button className="order-btn" onClick={handleOrder}>
              주문하기
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;