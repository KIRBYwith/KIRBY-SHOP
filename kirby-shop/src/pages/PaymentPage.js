import React, { useState } from 'react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

import { useOrder } from '../hooks/useOrder';
import usePayment from '../hooks/usePayment'; // default export
import { useAuth } from '../hooks/useAuth';

const PaymentPage = () => {
  // 주문 Hook에서 마지막 주문정보(실제 앱에서는 전역 등 사용)
  const { order } = useOrder();
  const { user } = useAuth();

  // 결제 Hook (카카오, 네이버, 이니시스, 토스)
  const {
    paymentMethod, selectMethod, requestPayment, paymentLoading, paymentError, paymentResult
  } = usePayment();

  const [payStatus, setPayStatus] = useState('');

  // 결제 요청 핸들러
  const handlePayment = async () => {
    // 결제 API 요청
    if (!order || !order.items.length) {
      alert('주문정보가 없습니다.');
      return;
    }
    const mainItem = order.items[0]?.product || order.items[0];
    try {
      setPayStatus('loading');
      await requestPayment({
        orderId: order.orderId || `ORDER-${Date.now()}`,
        userId: user?.id || 'guest',
        itemName: mainItem.title,
        quantity: order.items.length,
        totalAmount: order.getSummary ? order.getSummary().payable : (order.payable || 0), // order 구조에 따라
        // successUrl, failUrl, cancelUrl은 usePayment 내부에서 기본값 자동 지정
      });
      setPayStatus('pending');
    } catch (err) {
      setPayStatus('fail');
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
        <h2 style={{ marginBottom: 24 }}>결제수단 선택</h2>
        <div style={{ marginBottom: 32 }}>
          <strong>주문번호: </strong>{order?.orderId}<br />
          <strong>총 결제금액: </strong>{order?.getSummary ? order.getSummary().payable.toLocaleString() : (order.payable || 0)}원
        </div>
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => selectMethod("kakao")}
            style={{ marginRight: 12, background: paymentMethod==="kakao" ? "#f7e600":"#eee" }}
          >카카오페이</button>
          <button
            onClick={() => selectMethod("naver")}
            style={{ marginRight: 12, background: paymentMethod==="naver" ? "#19ce60":"#eee", color: paymentMethod==="naver" ? "white":"black" }}
          >네이버페이</button>
          <button
            onClick={() => selectMethod("inicis")}
            style={{ marginRight: 12, background: paymentMethod==="inicis" ? "#2340cb":"#eee", color: paymentMethod==="inicis" ? "white":"black" }}
          >이니시스</button>
          <button
            onClick={() => selectMethod("toss")}
            style={{ marginRight: 12, background: paymentMethod==="toss" ? "#3182f6":"#eee", color: paymentMethod==="toss" ? "white":"black" }}
          >토스페이</button>
        </div>
        <button
          onClick={handlePayment}
          disabled={paymentLoading || payStatus === 'pending'}
          style={{
            background: "#FF69B4", color: "#fff", fontWeight: 600, fontSize: 18,
            padding: "14px 40px", border: "none", borderRadius: 8
          }}>
          결제하기
        </button>
        <div style={{ marginTop: 32 }}>
          {payStatus === 'loading' && <p>결제를 요청 중입니다...</p>}
          {payStatus === 'pending' && <p>결제창이 열렸습니다.<br/>결제를 완료해주세요.</p>}
          {paymentError && <p style={{ color: "red" }}>결제 오류: {paymentError}</p>}
          {paymentResult && <div>
            <h4>결제 결과</h4>
            <pre>{JSON.stringify(paymentResult, null, 2)}</pre>
          </div>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;
