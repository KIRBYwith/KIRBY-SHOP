import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const paymentMethod = searchParams.get('method');

  useEffect(() => {
    // 결제 성공 메시지를 부모 창에 전송
    if (window.opener) {
      window.opener.postMessage({
        type: paymentMethod === 'kakao' ? 'KAKAO_PAYMENT_SUCCESS' : 'TOSS_PAYMENT_SUCCESS',
        data: {
          orderId: orderId,
          amount: parseInt(amount) || 0,
          method: paymentMethod || 'card',
          timestamp: new Date().toISOString()
        }
      }, '*');
      
      // 창 닫기
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, [orderId, amount, paymentMethod]);

  return (
    <>
      <Header />
      <div className="payment-success-container">
        <div className="payment-success-content">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          
          <h1 className="success-title">결제가 완료되었습니다!</h1>
          
          <div className="payment-info">
            <div className="info-item">
              <span className="info-label">주문번호</span>
              <span className="info-value">{orderId || 'ORDER-123456'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">결제금액</span>
              <span className="info-value">{amount ? parseInt(amount).toLocaleString() : '0'}원</span>
            </div>
            <div className="info-item">
              <span className="info-label">결제수단</span>
              <span className="info-value">
                {paymentMethod === 'kakao' ? '카카오페이' : 
                 paymentMethod === 'toss' ? '토스페이먼츠' : '신용카드'}
              </span>
            </div>
          </div>
          
          <div className="success-message">
            <p>주문이 성공적으로 완료되었습니다.</p>
            <p>주문 내역은 마이페이지에서 확인하실 수 있습니다.</p>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/order-history')}
            >
              주문 내역 보기
              <ArrowRight size={16} />
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccessPage;
