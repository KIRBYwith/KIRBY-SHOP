import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Shield, Zap } from 'lucide-react';
import { formatPrice } from '../../utils/priceCalculator';
import '../../styles/PaymentModal.css';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  orderData, 
  selectedMethod: initialMethod = '',
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [selectedMethod, setSelectedMethod] = useState(initialMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('method'); // method, processing, success, error

  const paymentMethods = [
    {
      id: 'kakao',
      name: '카카오페이',
      icon: <div style={{ width: '32px', height: '32px', background: '#FFEB00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#3c1e1e' }}>K</div>,
      color: '#FFEB00',
      description: '간편하고 안전한 카카오페이',
      popular: true
    },
    {
      id: 'naver',
      name: '네이버페이',
      icon: <div style={{ width: '32px', height: '32px', background: '#03C75A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' }}>N</div>,
      color: '#03C75A',
      description: '네이버 계정으로 간편결제',
      popular: true
    },
    {
      id: 'inicis',
      name: '이니시스',
      icon: <div style={{ width: '32px', height: '32px', background: '#0066CC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' }}>I</div>,
      color: '#0066CC',
      description: '신용카드/계좌이체/무통장입금',
      popular: false
    },
    {
      id: 'toss',
      name: '토스페이',
      icon: <div style={{ width: '32px', height: '32px', background: '#0064FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' }}>T</div>,
      color: '#0064FF',
      description: '토스로 간편결제',
      popular: true
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('method');
      setSelectedMethod(initialMethod);
      setIsProcessing(false);
    }
  }, [isOpen, initialMethod]);

  // selectedMethod가 설정되면 자동으로 결제 진행
  useEffect(() => {
    if (selectedMethod && isOpen && orderData) {
      handlePayment();
    }
  }, [selectedMethod]);

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('결제 수단을 선택해주세요.');
      return;
    }

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      alert('주문할 상품이 없습니다.');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const token = localStorage.getItem('token') || 'test-token';
      
      // 디버깅 정보
      console.log('PaymentModal Debug:', {
        orderData,
        selectedMethod,
        token
      });
      
      let response;
      
      if (selectedMethod === 'toss') {
        // 토스페이먼츠 API 직접 호출
        const tossRequestData = {
          amount: orderData.totalAmount || 1000,
          orderId: orderData.orderId || `TOSS_${Date.now()}`,
          orderName: `커비 상품 주문 (${orderData.items?.length || 1}개)`,
          customerName: orderData.userInfo?.name || '고객',
          customerEmail: orderData.userInfo?.email || 'customer@example.com',
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`
        };
        
        console.log('토스페이먼츠 API 요청 데이터:', tossRequestData);
        
        response = await fetch('http://localhost:8000/api/payments/toss/prepare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(tossRequestData)
        });
      } else if (selectedMethod === 'kakao') {
        // 카카오페이 API 직접 호출
        const kakaoRequestData = {
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
        
        console.log('카카오페이 API 요청 데이터:', kakaoRequestData);
        
        response = await fetch('http://localhost:8000/api/payments/kakao/prepare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(kakaoRequestData)
        });
      } else {
        throw new Error('지원하지 않는 결제 수단입니다.');
      }
      
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);

      // 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`API 오류 (${response.status}): ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('API 응답 데이터:', result);
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError);
        const responseText = await response.text();
        console.error('응답 텍스트:', responseText);
        throw new Error(`서버 응답을 파싱할 수 없습니다: ${responseText.substring(0, 100)}...`);
      }

      if (result.success) {
        console.log('결제 준비 성공, 결제창 열기 시작');
        
        // 결제 데이터 설정
        const paymentData = {
          payment_id: result.paymentKey || result.tid,
          payment_url: result.checkoutUrl || result.next_redirect_pc_url,
          amount: orderData.totalAmount,
          order_id: orderData.orderId
        };
        
        // 결제창 열기
        await openPaymentWindow(paymentData, selectedMethod);
      } else {
        throw new Error(result.message || '결제 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('결제 오류:', error);
      setPaymentStep('error');
      setIsProcessing(false);
      
      // 네트워크 오류인지 확인
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        onPaymentError?.('네트워크 연결을 확인해주세요. 백엔드 서버가 실행 중인지 확인하세요.');
      } else {
        onPaymentError?.(error.message);
      }
    }
  };

  const openPaymentWindow = async (paymentData, method) => {
    return new Promise((resolve, reject) => {
      console.log('결제창 열기:', paymentData.payment_url);
      console.log('결제 수단:', method);
      console.log('결제 데이터:', paymentData);
      
      // 실제 결제 수단별 QR 결제창 사용
      let paymentUrl;
      if (method === 'toss') {
        paymentUrl = `http://localhost:3000/toss-pay-qr.html?amount=${paymentData.amount}&orderId=${paymentData.order_id}`;
      } else if (method === 'kakao') {
        paymentUrl = `http://localhost:3000/kakao-pay-qr.html?amount=${paymentData.amount}&orderId=${paymentData.order_id}`;
      } else {
        paymentUrl = 'http://localhost:3000/payment-test.html';
      }
      
      console.log('최종 결제 URL:', paymentUrl);
      
      // 결제 수단별 창 크기 조정 (더 큰 창으로 설정)
      const windowOptions = method === 'toss' || method === 'kakao' 
        ? 'width=1000,height=800,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=no,top=50,left=50'
        : 'width=600,height=700,scrollbars=yes,resizable=yes,top=50,left=50';
      
      const paymentWindow = window.open(
        paymentUrl,
        `${method}_payment`,
        windowOptions
      );

      if (!paymentWindow) {
        console.error('팝업이 차단되었습니다.');
        alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');
        setPaymentStep('error');
        setIsProcessing(false);
        reject(new Error('팝업이 차단되었습니다.'));
        return;
      }

      // 결제 완료 메시지 리스너
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'payment_completed' && event.data.success) {
          // 결제 성공
          clearInterval(checkPaymentStatus);
          clearInterval(checkClosed);
          paymentWindow.close();
          setPaymentStep('success');
          setIsProcessing(false);
          
          // 주문내역에 저장
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          const newOrder = {
            orderId: paymentData.payment_id || paymentData.order_id,
            items: orderData.items,
            totalAmount: paymentData.amount || orderData.totalAmount,
            paymentMethod: method,
            paymentDate: new Date().toISOString(),
            status: 'completed',
            paymentKey: paymentData.payment_id,
            tid: paymentData.payment_id
          };
          orderHistory.unshift(newOrder);
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
          
          // 성공 메시지 표시
          setTimeout(() => {
            alert('결제가 완료되었습니다! 주문 내역 페이지로 이동합니다.');
            window.location.href = '/order-history';
          }, 1000);
          
          onPaymentSuccess?.(event.data);
          window.removeEventListener('message', messageHandler);
          resolve(event.data);
        } else if (event.data.type === 'payment_failed' || event.data.type === 'payment_cancelled') {
          // 결제 실패 또는 취소
          clearInterval(checkPaymentStatus);
          clearInterval(checkClosed);
          paymentWindow.close();
          setPaymentStep('error');
          setIsProcessing(false);
          onPaymentError?.(event.data.error || '결제가 취소되었습니다.');
          window.removeEventListener('message', messageHandler);
          reject(new Error(event.data.error || '결제가 취소되었습니다.'));
        }
      };
      
      window.addEventListener('message', messageHandler);

      // 결제 완료 확인을 위한 폴링 (백업용)
      const checkPaymentStatus = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://localhost:8000/api/payments/status/${paymentData.payment_id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const statusResult = await statusResponse.json();
          
          if (statusResult.status === 'completed') {
            clearInterval(checkPaymentStatus);
            clearInterval(checkClosed);
            paymentWindow.close();
            setPaymentStep('success');
            setIsProcessing(false);
            onPaymentSuccess?.(statusResult);
            window.removeEventListener('message', messageHandler);
            resolve(statusResult);
          } else if (statusResult.status === 'failed') {
            clearInterval(checkPaymentStatus);
            clearInterval(checkClosed);
            paymentWindow.close();
            setPaymentStep('error');
            setIsProcessing(false);
            window.removeEventListener('message', messageHandler);
            reject(new Error('결제가 실패했습니다.'));
          }
        } catch (error) {
          console.error('결제 상태 확인 오류:', error);
        }
      }, 3000);

      // 창이 닫힌 경우 처리
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          clearInterval(checkPaymentStatus);
          window.removeEventListener('message', messageHandler);
          
          // 성공 상태가 아니라면 취소로 처리
          if (paymentStep === 'processing') {
            setPaymentStep('error');
            setIsProcessing(false);
            reject(new Error('결제가 취소되었습니다.'));
          }
        }
      }, 1000);
    });
  };

  // formatPrice는 utils에서 import

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="payment-modal-header">
          <h2>결제하기</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* 결제 단계별 화면 */}
        {paymentStep === 'method' && (
          <div className="payment-content">
            {/* 주문 정보 */}
            <div className="order-summary">
              <h3>주문 정보</h3>
              <div className="order-items">
                {orderData.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">수량: {item.quantity}</span>
                    </div>
                    <span className="item-price">{formatPrice(item.total || (item.price * item.quantity))}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <div className="total-row">
                  <span>상품금액</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>배송비</span>
                  <span>{formatPrice(orderData.shippingFee)}</span>
                </div>
                {orderData.discountAmount > 0 && (
                  <div className="total-row discount">
                    <span>할인금액</span>
                    <span>-{formatPrice(orderData.discountAmount)}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>총 결제금액</span>
                  <span>{formatPrice(orderData.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* 결제 수단 선택 */}
            <div className="payment-methods">
              <h3>결제 수단 선택</h3>
              <div className="methods-grid">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`method-card ${selectedMethod === method.id ? 'selected' : ''} ${method.popular ? 'popular' : ''}`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    {method.popular && <span className="popular-badge">인기</span>}
                    <div className="method-icon" style={{ color: method.color }}>
                      {method.icon}
                      {method.fallbackIcon}
                    </div>
                    <div className="method-info">
                      <h4>{method.name}</h4>
                      <p>{method.description}</p>
                    </div>
                    <div className="method-radio">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={() => handlePaymentMethodSelect(method.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 버튼 */}
            <div className="payment-actions">
              <button
                className="payment-btn"
                onClick={handlePayment}
                disabled={!selectedMethod}
              >
                {formatPrice(orderData.totalAmount)} 결제하기
              </button>
            </div>
          </div>
        )}

        {/* 결제 처리 중 */}
        {paymentStep === 'processing' && (
          <div className="payment-processing">
            <div className="processing-spinner"></div>
            <div className="payment-logo-processing">
              {selectedMethod && (
                <div 
                  className="processing-logo"
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: paymentMethods.find(m => m.id === selectedMethod)?.color || '#ff1493',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  {selectedMethod.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3>결제 처리 중입니다...</h3>
            <p>잠시만 기다려주세요.</p>
            <div className="processing-steps">
              <div className="step active">결제 수단 확인</div>
              <div className="step active">결제창 열기</div>
              <div className="step">결제 완료</div>
            </div>
          </div>
        )}

        {/* 결제 성공 */}
        {paymentStep === 'success' && (
          <div className="payment-success">
            <div className="success-icon">✅</div>
            <div className="payment-logo-success">
              {selectedMethod && (
                <div 
                  className="success-logo"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: paymentMethods.find(m => m.id === selectedMethod)?.color || '#ff1493',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'white',
                    animation: 'successBounce 0.6s ease-out'
                  }}
                >
                  {selectedMethod.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3>결제가 완료되었습니다!</h3>
            <p>주문이 정상적으로 처리되었습니다.</p>
            <button className="success-btn" onClick={onClose}>
              확인
            </button>
          </div>
        )}

        {/* 결제 실패 */}
        {paymentStep === 'error' && (
          <div className="payment-error">
            <div className="error-icon">❌</div>
            <h3>결제에 실패했습니다</h3>
            <p>다시 시도해주세요.</p>
            <div className="error-actions">
              <button className="retry-btn" onClick={() => setPaymentStep('method')}>
                다시 시도
              </button>
              <button className="cancel-btn" onClick={onClose}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
