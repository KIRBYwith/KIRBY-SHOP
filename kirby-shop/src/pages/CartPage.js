import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductInfoAnother from '../components/detail/ProductInfoAnother';
import ProductImages from '../components/detail/ProductImages';
import '../styles/CartPage.css';

import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, finalPrice, shippingFee, cartSummary } = useCart(user);
  const navigate = useNavigate();

  // === 추가: 옵션/수량/공유 핸들러 ===
  const [selectedOption, setSelectedOption] = useState('');
  const handleShare = () => {
    alert('공유 버튼 클릭됨');
  };
  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };
  // ==============================

  // 개별 아이템 삭제 함수
  const handleRemoveItem = (cartItemId) => {
    if (window.confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) {
      removeFromCart(cartItemId);
    }
  };


  const handleOrder = () => {
    if (!user) {
      alert('로그인 후 주문해 주세요!');
      return;
    }
    navigate('/order');
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
                <div key={item.cartItemId || item.id} className="order-item-wrapper">
                  <ProductImages images={item.images || [item.image]} />

                  <ProductInfoAnother
                    product={item}
                    quantity={item.quantity}
                    setQuantity={(newQty) => handleQuantityChange(item.cartItemId, newQty)}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    handleShare={handleShare}
                    showRating={true}
                    showStock={true}
                    showDescription={true}
                    showShippingInfo={true}
                    layout="detail"
                  />

                  <button
                    className="delete-btn"
                    onClick={() => handleRemoveItem(item.cartItemId)}
                    title="상품 제외"
                  >
                    ✕
                  </button>
                </div>
              ))}


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
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CartPage;
