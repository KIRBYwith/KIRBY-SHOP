import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

import usePayment from '../hooks/usePayment'; // default export
import { useOrder } from '../hooks/useOrder';

const PaymentResultPage = () => {
  const {
    paymentResult,
    paymentError,
    paymentLoading,
    resetPayment,
  } = usePayment();

  const { order, resetOrder } = useOrder();

  // 결제 성공 판정(공통적으로 paymentResult나 order 상태 등으로 구분)
  const isSuccess = paymentResult && !paymentError;

  // 완료 시 재주문·홈가기 등 안내
  const handleGotoHome = () => {
    resetPayment && resetPayment();
    resetOrder && resetOrder();
    window.location.href = '/'; // 실제 앱에서는 Router 사용 추천
  };

  return (
    <>
      <Header />
      <div style={{
        maxWidth: 600,
        margin: '40px auto',
        background: "#fafafd",
        borderRadius: 10,
        padding: 36,
        boxShadow: "0 8px 36px rgba(0,0,0,0.045)"
      }}>
        <h2>결제 결과</h2>
        {paymentLoading && <p>결제 결과를 확인하는 중입니다...</p>}
        {isSuccess ? (
          <>
            <p style={{ color: "#29c869", fontWeight: 700, fontSize: 20, margin: '18px 0' }}>결제가 정상적으로 완료되었습니다!</p>
            <div style={{ background: "#fff", borderRadius: 8, padding: 18, margin: '0 0 24px 0' }}>
              <strong>주문번호:</strong> {order?.orderId} <br />
              <strong>결제 수단/상태:</strong> {paymentResult?.payment_method_type || paymentResult?.method || "성공"} <br />
              <strong>결제금액:</strong>{" "}
              {(paymentResult?.amount || paymentResult?.totalAmount || paymentResult?.total_price || order?.getSummary?.().payable)?.toLocaleString()}원
            </div>
            <div>
              <details>
                <summary style={{ cursor: "pointer", color: "#888", marginBottom: 8 }}>상세 결제 응답 펼치기</summary>
                <pre style={{ fontSize: 14, background: "#f7f7fa", padding: 12, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(paymentResult, null, 2)}
                </pre>
              </details>
            </div>
            <button
              style={{ marginTop: 32, padding: "12px 40px", background: "#FF69B4", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 16, border: "none" }}
              onClick={handleGotoHome}
            >
              홈으로 이동
            </button>
          </>
        ) : paymentError ? (
          <>
            <p style={{ color: "red", fontWeight: 700, fontSize: 18, margin: '18px 0' }}>결제에 실패하였습니다.</p>
            <div>
              <strong>사유: </strong> {paymentError}
            </div>
            <button
              style={{ marginTop: 32, padding: "12px 40px", background: "#888", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 16, border: "none" }}
              onClick={handleGotoHome}
            >
              홈으로 이동
            </button>
          </>
        ) : (
          <p>결제 정보가 없습니다.<br />메인 화면으로 이동해주세요.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentResultPage;
