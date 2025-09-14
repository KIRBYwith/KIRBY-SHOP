import React from 'react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
// 장바구니 목록: ProductListItem, ProductCard 등 원하는 컴포넌트 사용
import ProductListItem from '../components/product/ProductListItem'; // 리스트형
import ProductCard from '../components/product/ProductCard'; // 카드형

import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
// import { useHistory } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, finalPrice, shippingFee, cartSummary } = useCart();
  const { isAuthenticated, user } = useAuth();
  // const history = useHistory();

  const handleOrder = () => {
    if (!isAuthenticated) {
      alert('로그인 후 주문해 주세요!');
      // history.push('/login');
      return;
    }
    alert('주문 페이지로 이동(연동 필요)');
    // 실제 주문페이지 연동: history.push('/order');
  };

  if (cartSummary.isEmpty) {
    return (
      <>
        <Header />
        <div style={{ minHeight: 300, textAlign: 'center', padding: 80 }}>
          <h2>장바구니가 비어 있습니다.</h2>
          <p>원하는 상품을 장바구니에 담아보세요!</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        <h2 style={{ marginBottom: 20 }}>장바구니</h2>
        <button onClick={clearCart} style={{ float: 'right', color: 'red', marginBottom: 16 }}>전체 비우기</button>
        <div>
          {cartItems.map(item => (
            <ProductListItem
              key={item.cartItemId || item.id}
              product={item}
              cartQuantity={item.quantity}
              onCartAdd={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              onWishlistToggle={null}
              showRating={false}
              showStock={true}
              onProductClick={null}
              // 장바구니 수량 조정 예시
            />
          ))}
        </div>
        <div style={{
          borderTop: '1px solid #eee', margin: '32px 0 0'
        }}>
          <h4 style={{ margin: '32px 0 10px 0' }}>결제 정보</h4>
          <div>총 상품금액: {cartSummary.originalTotalPrice.toLocaleString()}원</div>
          <div>총 할인: -{cartSummary.totalDiscount.toLocaleString()}원</div>
          <div>배송비: {shippingFee === 0 ? '무료' : shippingFee.toLocaleString() + '원'}</div>
          <div style={{ fontWeight: 700, marginTop: 8, fontSize: 20, color: 'hotpink' }}>
            최종 결제금액: {finalPrice.toLocaleString()}원
          </div>
          <button style={{
            marginTop: 18, background: "#FF69B4", color: "#fff", fontWeight: 600, fontSize: 18, padding: "14px 40px", border: "none", borderRadius: 8
          }} onClick={handleOrder}>
            주문하기
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
};

export default CartPage;
