import React, { useState } from 'react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// 주문 스텝, 장바구니, 인증정보
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import { useAuth } from '../hooks/useAuth';

// 장바구니 상품 단순 리스트 렌더 예시 컴포넌트
import ProductListItem from '../components/product/ProductListItem';

const OrderPage = () => {
  const { cartItems, clearCart } = useCart();
  const { order, setStep, updateItem, setAddress, setReceiver, setRequest, getSummary, submitOrder } = useOrder(cartItems);
  const { isAuthenticated, user } = useAuth();

  // 배송지, 받는사람 등 입력 상태 관리
  const [receiver, _setReceiver] = useState({
    name: '',
    phone: '',
    address: '',
    zip: ''
  });
  const [address, _setAddress] = useState({
    address: '',
    zip: ''
  });
  const [requestMsg, setRequestMsg] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div style={{ minHeight: 300, padding: 32, textAlign: 'center' }}>
          <h2>장바구니가 비었습니다.</h2>
        </div>
        <Footer />
      </>
    );
  }

  // 총 결제 정보
  const summary = getSummary();

  // 주문 제출 핸들러
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setReceiver(receiver);
    setAddress(address);
    setRequest(requestMsg);
    const result = await submitOrder();
    setSubmitStatus(result.success ? 'success' : 'fail');
    if (result.success) clearCart();
  };

  if (order.status === 'done' || submitStatus === 'success') {
    return (
      <>
        <Header />
        <div style={{ minHeight: 300, textAlign: 'center', padding: 80 }}>
          <h2>주문이 완료되었습니다!</h2>
          <p>주문번호: {order.orderId}</p>
          <p>결제 페이지로 이동하여 결제를 마무리해주세요.</p>
          {/* 실제 앱에서는 자동으로 PaymentPage로 이동 처리 */}
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        <h2 style={{ marginBottom: 24 }}>주문/배송지 입력</h2>
        <form onSubmit={handleOrderSubmit}>
          <div style={{ marginBottom: 32 }}>
            <h3>주문상품</h3>
            {cartItems.map(item => (
              <ProductListItem
                key={item.cartItemId || item.id}
                product={item}
                cartQuantity={item.quantity}
                showRating={false}
                showStock={true}
                onWishlistToggle={null}
                onCartAdd={null}
              />
            ))}
          </div>
          <div style={{ marginBottom: 28 }}>
            <h3>받는 사람</h3>
            <label>
              이름 <input value={receiver.name} onChange={e => _setReceiver(r => ({...r, name: e.target.value}))} required />
            </label>
            <br/>
            <label>
              연락처 <input value={receiver.phone} onChange={e => _setReceiver(r => ({...r, phone: e.target.value}))} required />
            </label>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h3>배송지 정보</h3>
            <label>
              주소 <input value={address.address} onChange={e => _setAddress(r => ({...r, address: e.target.value}))} required style={{ width:300 }}/>
            </label>
            <br/>
            <label>
              우편번호 <input value={address.zip} onChange={e => _setAddress(r => ({...r, zip: e.target.value}))} style={{ width:140 }}/>
            </label>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h3>배송요청사항</h3>
            <textarea
              placeholder="문 앞에 놓아주세요 등"
              value={requestMsg}
              onChange={e => setRequestMsg(e.target.value)}
              style={{ width:320, height: 40}}
            />
          </div>
          <div style={{ border: '1px solid #eee', margin: '32px 0 18px', padding: 18, fontWeight: 600 }}>
            총 결제금액: {summary.payable.toLocaleString()}원
          </div>
          <button type="submit" style={{
            background: "#FF69B4", color: "#fff", fontWeight: 600, fontSize: 18,
            padding: "14px 40px", border: "none", borderRadius: 8, marginTop: 16
          }}>
            결제하기
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default OrderPage;
