import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { formatPrice } from '../../utils/priceCalculator';
import './PaymentModal.css';

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
  const [paymentStep, setPaymentStep] = useState('select'); // select, processing, success, error
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (selectedMethod && isOpen && orderData) {
      handlePayment();
    }
  }, [selectedMethod]);

  const handlePayment = async () => {
    if (!selectedMethod || !orderData) {
      toast.error('결제 정보가 올바르지 않습니다.');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      console.log('결제 시작:', { selectedMethod, orderData });

      let apiUrl, requestData;

      if (selectedMethod === 'toss') {
        apiUrl = 'http://localhost:8000/api/payments/toss/prepare';
        requestData = {
          amount: orderData.totalAmount || 1000,
          orderId: orderData.orderId || `TOSS_${Date.now()}`,
          orderName: `커비 상품 주문 (${orderData.items?.length || 1}개)`,
          customerName: orderData.userInfo?.name || '고객',
          customerEmail: orderData.userInfo?.email || 'customer@example.com',
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`
        };
      } else if (selectedMethod === 'kakao') {
        apiUrl = 'http://localhost:8000/api/payments/kakao/prepare';
        requestData = {
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
      } else {
        throw new Error('지원하지 않는 결제 수단입니다.');
      }

      console.log('API 요청:', { apiUrl, requestData });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(requestData)
      });

      console.log('API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('API 응답 데이터:', result);
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError);
        const errorText = await response.text();
        console.error('원본 응답:', errorText);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }

      if (!result.success) {
        throw new Error(result.message || '결제 준비에 실패했습니다.');
      }

      // 결제 데이터 설정
      const paymentInfo = {
        payment_id: selectedMethod === 'toss' ? result.paymentKey : result.tid,
        payment_url: selectedMethod === 'toss' ? result.checkoutUrl : result.next_redirect_pc_url,
        amount: requestData.amount || requestData.total_amount,
        order_id: requestData.orderId || requestData.partner_order_id
      };

      setPaymentData(paymentInfo);
      console.log('결제 데이터 설정:', paymentInfo);

      // 실제 결제창 열기
      await openPaymentWindow(paymentInfo, selectedMethod);

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

  const openPaymentWindow = async (paymentData, method) => {
    return new Promise((resolve, reject) => {
      console.log('결제창 열기:', paymentData.payment_url);
      console.log('결제 수단:', method);
      console.log('결제 데이터:', paymentData);
      
      // 실제 API에서 받은 결제 URL 사용
      let paymentUrl = paymentData.payment_url;
      
      // API URL이 없거나 유효하지 않은 경우에만 시뮬레이션 사용
      if (!paymentUrl || paymentUrl.includes('localhost:3000')) {
        console.log('API URL이 없어서 시뮬레이션 사용');
        if (method === 'toss') {
          paymentUrl = `http://localhost:3000/toss-pay-qr.html?amount=${paymentData.amount}&orderId=${paymentData.order_id}`;
        } else if (method === 'kakao') {
          paymentUrl = `http://localhost:3000/kakao-pay-qr.html?amount=${paymentData.amount}&orderId=${paymentData.order_id}`;
        } else {
          paymentUrl = 'http://localhost:3000/payment-test.html';
        }
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
          
          if (onPaymentSuccess) {
            onPaymentSuccess(event.data.data);
          }
          resolve(event.data.data);
        } else if (event.data.type === 'payment_cancelled') {
          // 결제 취소
          clearInterval(checkPaymentStatus);
          clearInterval(checkClosed);
          paymentWindow.close();
          setPaymentStep('error');
          setIsProcessing(false);
          toast.error('결제가 취소되었습니다.');
          reject(new Error('결제가 취소되었습니다.'));
        }
      };

      // 결제 상태 확인 (실제 API 사용 시)
      const checkPaymentStatus = setInterval(async () => {
        try {
          const statusUrl = `http://localhost:8000/api/payments/status/${paymentData.payment_id}`;
          const statusResponse = await fetch(statusUrl, {
            headers: {
              'Authorization': 'Bearer test-token'
            }
          });
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.status === 'completed') {
              clearInterval(checkPaymentStatus);
              clearInterval(checkClosed);
              paymentWindow.close();
              setPaymentStep('success');
              setIsProcessing(false);
              toast.success('결제가 완료되었습니다!');
              resolve(statusData);
            }
          }
        } catch (error) {
          console.log('결제 상태 확인 중 오류:', error);
        }
      }, 3000);

      // 창이 닫혔는지 확인
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkPaymentStatus);
          clearInterval(checkClosed);
          setPaymentStep('error');
          setIsProcessing(false);
          toast.error('결제창이 닫혔습니다.');
          reject(new Error('결제창이 닫혔습니다.'));
        }
      }, 1000);

      // 메시지 리스너 등록
      window.addEventListener('message', messageHandler);

      // 정리 함수
      const cleanup = () => {
        clearInterval(checkPaymentStatus);
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
      };

      // 5분 후 자동 정리
      setTimeout(cleanup, 300000);
    });
  };

  const handleMethodSelect = (method) => {
    if (isProcessing) return;
    setSelectedMethod(method);
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
  };

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
              </div>
            </>
          )}

          {paymentStep === 'processing' && (
            <div className="processing-state">
              <div className="loading-spinner"></div>
              <h3>결제 처리 중...</h3>
              <p>잠시만 기다려주세요.</p>
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

