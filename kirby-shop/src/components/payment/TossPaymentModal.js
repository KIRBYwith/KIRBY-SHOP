// src/components/payment/TossPaymentModal.js

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Banknote, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/TossPaymentModal.css';

const TossPaymentModal = ({ 
  isOpen, 
  onClose, 
  orderData,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 토스페이먼츠 테스트 설정
  const TOSS_PAY_CONFIG = {
    clientKey: 'test_ck_AQ92ymxN34dgjqjm4wyK3ajRKXvd', // 발급받은 테스트 클라이언트 키
    secretKey: 'test_sk_26DIbXAaV0MRmQ6RXeDxrqY50Q9R', // 발급받은 테스트 시크릿 키
    baseUrl: 'https://api.tosspayments.com/v1',
    testMode: true // 테스트 모드 활성화
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const paymentMethods = [
    {
      id: 'card',
      name: '신용카드',
      icon: <CreditCard size={24} />,
      description: '모든 신용카드 및 체크카드'
    },
    {
      id: 'virtual_account',
      name: '가상계좌',
      icon: <Banknote size={24} />,
      description: '무통장입금'
    },
    {
      id: 'phone',
      name: '휴대폰',
      icon: <Smartphone size={24} />,
      description: '휴대폰 소액결제'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('결제 수단을 선택해주세요.');
      return;
    }

    if (!orderData || !orderData.totalAmount) {
      toast.error('결제 정보가 올바르지 않습니다.');
      return;
    }

    setIsProcessing(true);

    try {
      // 토스페이먼츠 결제 준비 API 호출
      const response = await fetch('/api/payments/toss/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(TOSS_PAY_CONFIG.secretKey + ':')}`
        },
        body: JSON.stringify({
          amount: orderData.totalAmount,
          orderId: orderData.orderId || `TOSS_${Date.now()}`,
          orderName: orderData.orderName || '커비 상품',
          customerName: orderData.customerName || '고객',
          customerEmail: orderData.customerEmail || 'customer@example.com',
          successUrl: `${window.location.origin}/payment/toss/success`,
          failUrl: `${window.location.origin}/payment/toss/fail`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`토스페이먼츠 결제 준비 실패: ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // 실제 토스페이먼츠 결제창 열기
      toast.success('토스페이먼츠 결제창으로 이동합니다.');
      
      // 새 창에서 결제창 열기
      const paymentWindow = window.open(
        result.checkoutUrl || `https://checkout.tosspayments.com/v1/payments/${result.paymentKey}`,
        '_blank',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!paymentWindow) {
        throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      }

      // 결제창 메시지 리스너
      const handlePaymentMessage = (event) => {
        if (event.data.type === 'TOSS_PAYMENT_SUCCESS') {
          toast.success('토스페이먼츠 결제가 완료되었습니다!');
          onPaymentSuccess && onPaymentSuccess(event.data.data);
          window.removeEventListener('message', handlePaymentMessage);
        } else if (event.data.type === 'TOSS_PAYMENT_CANCEL') {
          toast.info('토스페이먼츠 결제가 취소되었습니다.');
          onPaymentError && onPaymentError(new Error('결제 취소'));
          window.removeEventListener('message', handlePaymentMessage);
        }
      };

      window.addEventListener('message', handlePaymentMessage);

    } catch (error) {
      toast.error(`토스페이먼츠 결제 중 오류가 발생했습니다: ${error.message}`);
      onPaymentError && onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 테스트 모드용 시뮬레이션
  const simulateTossPay = async (result = null) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('토스페이먼츠 결제창으로 이동합니다. (테스트 모드)');
      
      // 시뮬레이션 결제창 열기
      const paymentWindow = window.open('', '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      if (paymentWindow) {
        const methodNames = {
          'card': '신용카드',
          'virtual_account': '가상계좌',
          'phone': '휴대폰'
        };
        
        paymentWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>토스페이먼츠 결제 (테스트)</title>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8f9fa;
                margin: 0; 
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .payment-container {
                background: white;
                border-radius: 16px;
                padding: 0;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                max-width: 480px;
                width: 100%;
                margin: 20px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #0064ff 0%, #0047cc 100%);
                color: white;
                padding: 24px;
                text-align: center;
                position: relative;
              }
              .test-badge {
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(255,255,255,0.2);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
              }
              .toss-logo {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              }
              .toss-logo::before {
                content: "💳";
                font-size: 24px;
              }
              .header-subtitle {
                font-size: 14px;
                opacity: 0.9;
                font-weight: 400;
              }
              .content {
                padding: 32px 24px;
              }
              .order-info {
                background: #f8f9ff;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid #e3f2fd;
              }
              .item-name {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 8px;
              }
              .method-name {
                font-size: 14px;
                color: #666;
                margin-bottom: 16px;
              }
              .amount {
                font-size: 28px;
                font-weight: 700;
                color: #0064ff;
                text-align: center;
                margin: 16px 0;
              }
              .card-info {
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                font-size: 13px;
                color: #495057;
              }
              .card-info p {
                margin: 4px 0;
                font-weight: 500;
              }
              .card-info .card-number {
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #0064ff;
                font-weight: 600;
              }
              .payment-btn {
                width: 100%;
                background: linear-gradient(135deg, #0064ff 0%, #0047cc 100%);
                color: white;
                border: none;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin: 8px 0;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
              }
              .payment-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 100, 255, 0.3);
              }
              .payment-btn:active {
                transform: translateY(0);
              }
              .cancel-btn {
                background: #f8f9fa;
                color: #6c757d;
                border: 1px solid #e9ecef;
              }
              .cancel-btn:hover {
                background: #e9ecef;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              .loading {
                display: none;
                text-align: center;
                padding: 20px;
                color: #666;
              }
              .loading::after {
                content: "";
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid #0064ff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
                margin-left: 8px;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .security-notice {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 12px;
                margin-top: 16px;
                font-size: 12px;
                color: #856404;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="payment-container">
              <div class="header">
                <div class="test-badge">TEST MODE</div>
                <div class="toss-logo">토스페이먼츠</div>
                <div class="header-subtitle">안전하고 간편한 결제</div>
              </div>
              
              <div class="content">
                <div class="order-info">
                  <div class="item-name">${orderData.orderName || '커비 상품'}</div>
                  <div class="method-name">${methodNames[selectedMethod] || selectedMethod}</div>
                  <div class="amount">${orderData.totalAmount.toLocaleString()}원</div>
                </div>
                
                ${selectedMethod === 'card' ? `
                  <div class="card-info">
                    <p><strong>💳 토스페이먼츠 테스트 카드</strong></p>
                    <p>카드번호: <span class="card-number">4242-4242-4242-4242</span></p>
                    <p>유효기간: 12/25</p>
                    <p>CVC: 123</p>
                    <p>비밀번호: 12**</p>
                  </div>
                ` : ''}
                
                <button class="payment-btn" onclick="simulatePayment()">
                  ${methodNames[selectedMethod] || selectedMethod}로 결제하기
                </button>
                <button class="payment-btn cancel-btn" onclick="cancelPayment()">
                  취소
                </button>
                
                <div class="loading" id="loading">
                  결제 처리 중...
                </div>
                
                <div class="security-notice">
                  🔒 모든 결제정보는 암호화되어 안전하게 처리됩니다
                </div>
              </div>
            </div>
            
            <script>
              function simulatePayment() {
                console.log('토스페이먼츠 결제 시작');
                document.getElementById('loading').style.display = 'block';
                
                // 결제 진행 애니메이션
                setTimeout(() => {
                  console.log('토스페이먼츠 결제 완료');
                  
                  // 성공 메시지 표시
                  const successMsg = document.createElement('div');
                  successMsg.innerHTML = '✅ 결제가 완료되었습니다! (테스트 모드)';
                  successMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #4caf50; color: white; padding: 20px; border-radius: 10px; z-index: 10000; font-weight: bold;';
                  document.body.appendChild(successMsg);
                  
                  // 부모 창에 성공 메시지 전송
                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'TOSS_PAY_SUCCESS',
                      data: {
                        paymentKey: 'T' + Date.now(),
                        orderId: '${orderData.orderId}',
                        amount: ${orderData.totalAmount},
                        method: '${selectedMethod}',
                        timestamp: new Date().toISOString()
                      }
                    }, '*');
                  }
                  
                  // 2초 후 창 닫기
                  setTimeout(() => {
                    window.close();
                  }, 2000);
                }, 2000);
              }
              
              function cancelPayment() {
                console.log('토스페이먼츠 결제 취소');
                
                // 취소 메시지 표시
                const cancelMsg = document.createElement('div');
                cancelMsg.innerHTML = '❌ 결제가 취소되었습니다';
                cancelMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #f44336; color: white; padding: 20px; border-radius: 10px; z-index: 10000; font-weight: bold;';
                document.body.appendChild(cancelMsg);
                
                // 부모 창에 취소 메시지 전송
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TOSS_PAY_CANCEL',
                    data: {
                      orderId: '${orderData.orderId}',
                      timestamp: new Date().toISOString()
                    }
                  }, '*');
                }
                
                // 1초 후 창 닫기
                setTimeout(() => {
                  window.close();
                }, 1000);
              }
              
              // 페이지 로드 시 디버깅 정보 출력
              console.log('토스페이먼츠 결제창 로드됨:', {
                orderId: '${orderData.orderId}',
                amount: ${orderData.totalAmount},
                method: '${selectedMethod}'
              });
            </script>
          </body>
          </html>
        `);
      }
    } catch (error) {
      toast.error('결제 처리 중 오류가 발생했습니다.');
    }
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="toss-payment-modal-overlay" onClick={onClose}>
      <div className="toss-payment-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <CreditCard size={24} />
            </div>
            <div>
              <h2>토스페이먼츠 결제</h2>
              <p>안전하고 편리한 결제를 진행하세요</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 결제 정보 */}
        <div className="payment-info">
          <div className="info-row">
            <span>주문번호</span>
            <span>{orderData?.orderId || `ORDER_${Date.now()}`}</span>
          </div>
          <div className="info-row">
            <span>상품명</span>
            <span>{orderData?.orderName || '커비 상품'}</span>
          </div>
          <div className="info-row total">
            <span>결제금액</span>
            <span className="amount">{formatAmount(orderData?.totalAmount || 0)}원</span>
          </div>
        </div>

        {/* 결제 수단 선택 */}
        <div className="payment-methods">
          <h3>결제 수단 선택</h3>
          <div className="methods-grid">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                className={`method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
              >
                <div className="method-icon">
                  {method.icon}
                </div>
                <div className="method-info">
                  <h4>{method.name}</h4>
                  <p>{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="selected-indicator">
                    <CheckCircle size={20} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="security-notice">
          <AlertCircle size={16} />
          <span>토스페이먼츠의 보안 시스템으로 안전하게 결제됩니다</span>
        </div>

        {/* 결제 버튼 */}
        <div className="payment-actions">
          <button 
            className="cancel-btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            취소
          </button>
          <button 
            className="pay-btn"
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
          >
            {isProcessing ? '결제 진행중...' : `${formatAmount(orderData?.totalAmount || 0)}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TossPaymentModal;
