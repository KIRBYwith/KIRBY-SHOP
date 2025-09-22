import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { formatPrice } from '../../utils/priceCalculator';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import './PaymentModal.css';

const TOSS_CLIENT_KEY = "test_gck_AQ92ymxN34dgjqjm4wyK3ajRKXvd";

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  orderData, 
  selectedMethod: initialMethod = '',
  onPaymentSuccess,
  onPaymentError 
}) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState(initialMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select');
  const [paymentWidget, setPaymentWidget] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const widgetRef = useRef(null);

  const cardTypes = [
    { name: 'black', title: '블랙 카드', color: '#1a1a1a', logo: 'TOSS', brand: 'VISA' },
    { name: 'neon', title: '네온 카드', color: '#00ff88', logo: 'TOSS', brand: 'MASTERCARD' },
    { name: 'sky', title: '하늘 카드', color: '#87ceeb', logo: 'TOSS', brand: 'AMEX' }
  ];

  const initializeTossWidget = useCallback(async () => {
    if (!orderData || !widgetRef.current) return;

    try {
      const tossPayments = await loadPaymentWidget(TOSS_CLIENT_KEY, {
        customerKey: orderData.userInfo?.id || 'user_001',
        orderId: orderData.orderId || `TOSS_${Date.now()}`,
        orderName: `커비 상품 주문 (${orderData.items?.length || 1}개)`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
      setPaymentWidget(tossPayments);

      await tossPayments.renderPaymentMethods(widgetRef.current, {
        value: orderData.totalAmount || 1000,
        currency: 'KRW',
        country: 'KR',
      });
      
      await tossPayments.renderAgreement('#agreement');

    } catch (error) {
      console.error('토스페이먼츠 위젯 초기화 오류:', error);
      toast.error('토스페이먼츠 결제 위젯 초기화에 실패했습니다.');
      setPaymentStep('error');
      setIsProcessing(false);
    }
  }, [orderData, toast]);

  useEffect(() => {
    if (isOpen && selectedMethod === 'toss' && orderData) {
      initializeTossWidget();
    }
  }, [isOpen, selectedMethod, orderData, initializeTossWidget]);

  const handleKakaoPayment = async () => {
    try {
      const apiUrl = 'http://localhost:8000/api/payments/kakao/prepare';
      const requestData = {
        cid: 'TC0ONETIME',
        partner_order_id: orderData.orderId || `KAKAO_${Date.now()}`,
        partner_user_id: orderData.userInfo?.id || 'user_001',
        item_name: `커비 상품 주문 (${orderData.items?.length || 1}개)`,
        quantity: 1,
        total_amount: orderData.totalAmount || 1000,
        tax_free_amount: 0,
        approval_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        fail_url: `${window.location.origin}/payment/fail`
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || result.error || '카카오페이 결제 준비에 실패했습니다.');
      }

      // 카카오페이 QR 코드 페이지로 이동
      const qrUrl = `http://localhost:3000/kakao-pay-qr.html?amount=${orderData.totalAmount}&orderId=${orderData.orderId}`;
      const paymentWindow = window.open(qrUrl, 'kakao_payment', 'width=1000,height=800,scrollbars=yes,resizable=yes');

      if (!paymentWindow) {
        throw new Error('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');
      }

      // 팝업에서 메시지 받기
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'payment_completed' && event.data.success) {
          paymentWindow.close();
          setPaymentStep('success');
          setIsProcessing(false);
          toast.success('카카오페이 결제가 완료되었습니다!');

          // 주문 내역에 추가
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          const newOrder = {
            orderId: orderData.orderId || `KAKAO_${Date.now()}`,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            paymentMethod: 'kakao',
            paymentDate: new Date().toISOString(),
            status: 'completed',
          };
          orderHistory.unshift(newOrder);
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

          if (onPaymentSuccess) {
            onPaymentSuccess({ method: 'kakao', orderId: orderData.orderId });
          }
        } else if (event.data.type === 'payment_cancelled') {
          paymentWindow.close();
          setPaymentStep('error');
          setIsProcessing(false);
          toast.error('카카오페이 결제가 취소되었습니다.');
        }
      };

      window.addEventListener('message', messageHandler);

      // 팝업 닫힘 감지
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (paymentStep === 'processing') {
            setPaymentStep('error');
            setIsProcessing(false);
            toast.error('카카오페이 결제창이 닫혔습니다.');
          }
        }
      }, 1000);

    } catch (error) {
      throw new Error(`카카오페이 결제 실패: ${error.message}`);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod || !orderData) {
      toast.error('결제 정보가 올바르지 않습니다.');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      if (selectedMethod === 'toss') {
        // 토스페이먼츠는 시뮬레이션으로 성공 처리
        setTimeout(() => {
          setPaymentStep('success');
          setIsProcessing(false);
          toast.success('토스페이먼츠 결제가 완료되었습니다!');

          // 주문 내역에 추가
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          const newOrder = {
            orderId: orderData.orderId || `TOSS_${Date.now()}`,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            paymentMethod: 'toss',
            paymentDate: new Date().toISOString(),
            status: 'completed',
          };
          orderHistory.unshift(newOrder);
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

          if (onPaymentSuccess) {
            onPaymentSuccess({ method: 'toss', orderId: orderData.orderId });
          }
        }, 2000);
        
      } else if (selectedMethod === 'kakao') {
        await handleKakaoPayment();
      } else {
        throw new Error('지원하지 않는 결제 수단입니다.');
      }

    } catch (error) {
      console.error('결제 오류:', error);
      setPaymentStep('error');
      setIsProcessing(false);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('네트워크 오류가 발생했습니다. 서버 상태를 확인해주세요.');
      } else {
        toast.error(`결제 중 오류가 발생했습니다: ${error.message}`);
      }
      
      if (onPaymentError) {
        onPaymentError(error.message);
      }
    }
  };

  const handleMethodSelect = (method) => {
    if (isProcessing) return;
    setSelectedMethod(method);
    setPaymentStep('select');
    setPaymentWidget(null);
  };

  const handleCardChange = (direction) => {
    if (direction === 'prev') {
      setCurrentCardIndex((prev) => (prev === 0 ? cardTypes.length - 1 : prev - 1));
    } else {
      setCurrentCardIndex((prev) => (prev === cardTypes.length - 1 ? 0 : prev + 1));
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
  };

  const currentCard = cardTypes[currentCardIndex];

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>결제하기</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="payment-content">
          {paymentStep === 'select' && (
            <>
              <div className="payment-summary">
                <h3>결제 요약</h3>
                <div className="summary-item">
                  <span>상품 금액:</span>
                  <span>{formatPrice(orderData?.totalAmount || 0)}</span>
                </div>
                <div className="summary-item">
                  <span>배송비:</span>
                  <span>{formatPrice(orderData?.shippingFee || 0)}</span>
                </div>
                <div className="summary-item total">
                  <span>총 결제 금액:</span>
                  <span>{formatPrice(orderData?.totalAmount || 0)}</span>
                </div>
              </div>

              <div className="payment-methods">
                <h3>결제 수단 선택</h3>
                
                {selectedMethod === 'toss' && (
                  <div className="toss-payment-container">
                    <div className="card-selector">
                      <button 
                        className="card-arrow left" 
                        onClick={() => handleCardChange('prev')}
                        disabled={isProcessing}
                      >
                        ‹
                      </button>
                      
                      <div className={`toss-card ${currentCard.name}`}>
                        <div className="toss-card-header">
                          <div className="toss-logo">{currentCard.logo}</div>
                          <div className="toss-chip"></div>
                        </div>
                        <div className="toss-card-number">4532 •••• •••• 1234</div>
                        <div className="toss-card-info">
                          <div className="toss-card-holder">KIRBY SHOP</div>
                          <div className="toss-card-expiry">12/25</div>
                        </div>
                        <div className="toss-card-brand">{currentCard.brand}</div>
                        <div className="card-title">{currentCard.title}</div>
                      </div>
                      
                      <button 
                        className="card-arrow right" 
                        onClick={() => handleCardChange('next')}
                        disabled={isProcessing}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="method-options">
                  <button 
                    className={`method-btn ${selectedMethod === 'toss' ? 'active' : ''}`}
                    onClick={() => handleMethodSelect('toss')}
                    disabled={isProcessing}
                  >
                    <div className="method-icon toss">T</div>
                    <div className="method-info">
                      <div className="method-name">토스페이먼츠</div>
                      <div className="method-desc">간편하고 안전한 결제</div>
                    </div>
                  </button>
                  
                  <button 
                    className={`method-btn ${selectedMethod === 'kakao' ? 'active' : ''}`}
                    onClick={() => handleMethodSelect('kakao')}
                    disabled={isProcessing}
                  >
                    <div className="method-icon kakao">K</div>
                    <div className="method-info">
                      <div className="method-name">카카오페이</div>
                      <div className="method-desc">카카오톡으로 간편 결제</div>
                    </div>
                  </button>
                </div>
                
                {selectedMethod && (
                  <button 
                    className="payment-btn"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '결제 처리 중...' : `${selectedMethod === 'toss' ? '토스페이먼츠로' : '카카오페이로'} 결제하기`}
                  </button>
                )}
              </div>
            </>
          )}

          {selectedMethod === 'toss' && paymentStep === 'processing' && (
            <div className="toss-payment-widget-container">
              <div className="processing-state">
                <div className="loading-spinner"></div>
                <h3>토스페이먼츠 결제 처리 중...</h3>
                <p>잠시만 기다려주세요. 결제를 진행하고 있습니다.</p>
              </div>
            </div>
          )}

          {selectedMethod === 'kakao' && paymentStep === 'processing' && (
            <div className="processing-state">
              <div className="loading-spinner"></div>
              <h3>카카오페이 결제 처리 중...</h3>
              <p>잠시만 기다려주세요. 팝업창을 확인해주세요.</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="success-state">
              <div className="success-icon">✅</div>
              <h3>결제 완료!</h3>
              <p>결제가 성공적으로 완료되었습니다.</p>
            </div>
          )}

          {paymentStep === 'error' && (
            <div className="error-state">
              <div className="error-icon">❌</div>
              <h3>결제 실패</h3>
              <p>결제 중 오류가 발생했습니다.</p>
              <button className="retry-btn" onClick={() => setPaymentStep('select')}>
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
