// src/components/payment/KakaoPayModal.js

import React, { useState, useEffect } from 'react';
import { X, Smartphone, CreditCard, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/KakaoPayModal.css';

const KakaoPayModal = ({ 
  isOpen, 
  onClose, 
  orderData,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  // 카카오페이 테스트 설정
  const KAKAO_PAY_CONFIG = {
    cid: 'TC0ONETIME', // 카카오페이 테스트용 가맹점 코드
    clientId: 'C275E2B9A286D827124B', // 발급받은 Client ID
    clientSecret: '4706F7F3099F52EA2FFA', // 발급받은 Client Secret
    secretKey: 'PRD166E679A31F4B559E772D2426FB8E53C8C9F3', // 발급받은 Secret Key
    baseUrl: 'https://kapi.kakao.com',
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

  // 카카오페이 결제 준비 (실제 API 호출)
  const handleKakaoPay = async () => {
    if (!orderData || !orderData.totalAmount) {
      toast.error('결제 정보가 올바르지 않습니다.');
      return;
    }

    setIsProcessing(true);

    try {
      // 카카오페이 결제 준비 시작

      // 카카오페이 결제 준비 API 호출
      const response = await fetch('/api/payments/kakao/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `KakaoAK ${KAKAO_PAY_CONFIG.secretKey}`
        },
        body: JSON.stringify({
          cid: KAKAO_PAY_CONFIG.cid,
          partner_order_id: orderData.orderId || `KAKAO_${Date.now()}`,
          partner_user_id: orderData.customerId || 'user_001',
          item_name: orderData.orderName || '커비 상품',
          quantity: 1,
          total_amount: orderData.totalAmount,
          tax_free_amount: 0,
          approval_url: `${window.location.origin}/payment/kakao/success`,
          cancel_url: `${window.location.origin}/payment/kakao/cancel`,
          fail_url: `${window.location.origin}/payment/kakao/fail`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`카카오페이 결제 준비 실패: ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      // 카카오페이 결제 준비 성공

      // 실제 카카오페이 결제창 열기
      if (result.next_redirect_pc_url) {
        setPaymentUrl(result.next_redirect_pc_url);
        toast.success('카카오페이 결제창으로 이동합니다.');
        
        // 새 창에서 카카오페이 결제창 열기
        const paymentWindow = window.open(
          result.next_redirect_pc_url,
          '_blank',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        if (!paymentWindow) {
          throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        }

        // 결제창 메시지 리스너
        const handlePaymentMessage = (event) => {
          if (event.data.type === 'KAKAO_PAYMENT_SUCCESS') {
            toast.success('카카오페이 결제가 완료되었습니다!');
            onPaymentSuccess && onPaymentSuccess(event.data.data);
            window.removeEventListener('message', handlePaymentMessage);
          } else if (event.data.type === 'KAKAO_PAYMENT_CANCEL') {
            toast.info('카카오페이 결제가 취소되었습니다.');
            onPaymentError && onPaymentError(new Error('결제 취소'));
            window.removeEventListener('message', handlePaymentMessage);
          }
        };

        window.addEventListener('message', handlePaymentMessage);
      } else {
        throw new Error('결제 URL을 받지 못했습니다.');
      }

    } catch (error) {
      toast.error(`카카오페이 결제 중 오류가 발생했습니다: ${error.message}`);
      onPaymentError && onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 테스트 모드용 시뮬레이션
  const simulateKakaoPay = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPaymentUrl = `https://kapi.kakao.com/v1/payment/ready?tid=T${Date.now()}&order_id=${orderData.orderId}`;
      setPaymentUrl(mockPaymentUrl);
      
      // 카카오페이 결제 준비 성공 (시뮬레이션)
      toast.success('카카오페이 결제창으로 이동합니다. (테스트 모드)');
      
      // 시뮬레이션 결제창 열기
      const paymentWindow = window.open('', '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      if (paymentWindow) {
             paymentWindow.document.write(`
               <!DOCTYPE html>
               <html>
               <head>
                 <title>카카오페이 결제 (테스트)</title>
                 <meta charset="utf-8">
                 <style>
                   * { margin: 0; padding: 0; box-sizing: border-box; }
                   body { 
                     font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                     background: #f7f8fa;
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
                     background: linear-gradient(135deg, #fee500 0%, #ffc107 100%);
                     color: #3c1e1e;
                     padding: 24px;
                     text-align: center;
                     position: relative;
                   }
                   .test-badge {
                     position: absolute;
                     top: 12px;
                     right: 12px;
                     background: rgba(60, 30, 30, 0.1);
                     color: #3c1e1e;
                     padding: 4px 8px;
                     border-radius: 12px;
                     font-size: 11px;
                     font-weight: 500;
                   }
                   .kakao-logo {
                     font-size: 20px;
                     font-weight: 700;
                     margin-bottom: 8px;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     gap: 8px;
                   }
                   .kakao-logo::before {
                     content: "💳";
                     font-size: 24px;
                   }
                   .header-subtitle {
                     font-size: 14px;
                     opacity: 0.8;
                     font-weight: 400;
                     color: #3c1e1e;
                   }
                   .content {
                     padding: 32px 24px;
                   }
                   .order-info {
                     background: #fff8e1;
                     border-radius: 12px;
                     padding: 20px;
                     margin-bottom: 24px;
                     border: 1px solid #ffe082;
                   }
                   .item-name {
                     font-size: 16px;
                     font-weight: 600;
                     color: #1a1a1a;
                     margin-bottom: 8px;
                   }
                   .amount {
                     font-size: 28px;
                     font-weight: 700;
                     color: #3c1e1e;
                     text-align: center;
                     margin: 16px 0;
                   }
                   .payment-btn {
                     width: 100%;
                     background: linear-gradient(135deg, #fee500 0%, #ffc107 100%);
                     color: #3c1e1e;
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
                     box-shadow: 0 8px 24px rgba(254, 229, 0, 0.4);
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
                     border: 2px solid #fee500;
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
                   .kakao-features {
                     background: #f8f9ff;
                     border-radius: 8px;
                     padding: 16px;
                     margin: 20px 0;
                     font-size: 13px;
                     color: #495057;
                   }
                   .kakao-features h4 {
                     color: #3c1e1e;
                     margin-bottom: 8px;
                     font-size: 14px;
                     font-weight: 600;
                   }
                   .kakao-features ul {
                     list-style: none;
                     padding: 0;
                   }
                   .kakao-features li {
                     margin: 4px 0;
                     display: flex;
                     align-items: center;
                     gap: 8px;
                   }
                   .kakao-features li::before {
                     content: "✓";
                     color: #fee500;
                     font-weight: bold;
                   }
                 </style>
               </head>
               <body>
                 <div class="payment-container">
                   <div class="header">
                     <div class="test-badge">TEST MODE</div>
                     <div class="kakao-logo">카카오페이</div>
                     <div class="header-subtitle">간편하고 안전한 결제</div>
                   </div>
                   
                   <div class="content">
                     <div class="order-info">
                       <div class="item-name">${orderData.orderName || '커비 상품'}</div>
                       <div class="amount">${orderData.totalAmount.toLocaleString()}원</div>
                     </div>
                     
                     <div class="kakao-features">
                       <h4>카카오페이 혜택</h4>
                       <ul>
                         <li>간편한 비밀번호 결제</li>
                         <li>카드 정보 자동 입력</li>
                         <li>실시간 결제 내역 확인</li>
                         <li>안전한 암호화 처리</li>
                       </ul>
                     </div>
                     
                     <button class="payment-btn" onclick="simulatePayment()">
                       카카오페이로 결제하기
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
                     console.log('카카오페이 결제 시작');
                     document.getElementById('loading').style.display = 'block';
                     
                     // 결제 진행 애니메이션
                     setTimeout(() => {
                       console.log('카카오페이 결제 완료');
                       
                       // 성공 메시지 표시
                       const successMsg = document.createElement('div');
                       successMsg.innerHTML = '✅ 카카오페이 결제가 완료되었습니다! (테스트 모드)';
                       successMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #4caf50; color: white; padding: 20px; border-radius: 10px; z-index: 10000; font-weight: bold;';
                       document.body.appendChild(successMsg);
                       
                       // 부모 창에 성공 메시지 전송
                       if (window.opener) {
                         window.opener.postMessage({
                           type: 'KAKAO_PAY_SUCCESS',
                           data: {
                             tid: 'T' + Date.now(),
                             orderId: '${orderData.orderId}',
                             amount: ${orderData.totalAmount},
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
                     console.log('카카오페이 결제 취소');
                     
                     // 취소 메시지 표시
                     const cancelMsg = document.createElement('div');
                     cancelMsg.innerHTML = '❌ 카카오페이 결제가 취소되었습니다';
                     cancelMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #f44336; color: white; padding: 20px; border-radius: 10px; z-index: 10000; font-weight: bold;';
                     document.body.appendChild(cancelMsg);
                     
                     // 부모 창에 취소 메시지 전송
                     if (window.opener) {
                       window.opener.postMessage({
                         type: 'KAKAO_PAY_CANCEL',
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
                   console.log('카카오페이 결제창 로드됨:', {
                     orderId: '${orderData.orderId}',
                     amount: ${orderData.totalAmount}
                   });
                 </script>
               </body>
               </html>
             `);
      }
    } catch (error) {
      // 시뮬레이션 오류
      toast.error('결제 처리 중 오류가 발생했습니다.');
    }
  };

  // 모바일 카카오페이 앱으로 결제
  const handleMobileKakaoPay = () => {
    if (!paymentUrl) {
      toast.error('결제 URL이 없습니다. 먼저 결제를 준비해주세요.');
      return;
    }

    // 모바일 카카오페이 앱 URL로 변경
    const mobileUrl = paymentUrl.replace('https://kapi.kakao.com', 'kakaotalk://kakaopay');
    window.location.href = mobileUrl;
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="kakao-pay-modal-overlay" onClick={onClose}>
      <div className="kakao-pay-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon kakao-icon">
              <Smartphone size={24} />
            </div>
            <div>
              <h2>카카오페이 결제</h2>
              <p>간편하고 안전한 카카오페이로 결제하세요</p>
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
            <span>{orderData?.orderId || `KAKAO_${Date.now()}`}</span>
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

        {/* 카카오페이 안내 */}
        <div className="kakao-info">
          <div className="info-card">
            <div className="info-icon">
              <CheckCircle size={20} />
            </div>
            <div className="info-text">
              <h4>카카오페이의 장점</h4>
              <ul>
                <li>간편한 비밀번호 또는 생체인증</li>
                <li>카드 정보 입력 없이 빠른 결제</li>
                <li>안전한 토스페이먼츠 보안 시스템</li>
                <li>실시간 결제 내역 확인</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 결제 방법 선택 */}
        <div className="payment-methods">
          <h3>결제 방법 선택</h3>
          <div className="method-options">
            <button 
              className="method-btn pc-btn"
              onClick={handleKakaoPay}
              disabled={isProcessing}
            >
              <CreditCard size={20} />
              <div>
                <h4>PC 카카오페이</h4>
                <p>웹 브라우저에서 카카오페이로 결제</p>
              </div>
              <ExternalLink size={16} />
            </button>
            
            <button 
              className="method-btn mobile-btn"
              onClick={handleMobileKakaoPay}
              disabled={!paymentUrl || isProcessing}
            >
              <Smartphone size={20} />
              <div>
                <h4>모바일 카카오페이</h4>
                <p>카카오톡 앱에서 카카오페이로 결제</p>
              </div>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="security-notice">
          <AlertCircle size={16} />
          <span>카카오페이는 토스페이먼츠의 보안 시스템으로 안전하게 결제됩니다</span>
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
            className="kakao-pay-btn"
            onClick={handleKakaoPay}
            disabled={isProcessing}
          >
            {isProcessing ? '결제 준비중...' : `${formatAmount(orderData?.totalAmount || 0)}원 카카오페이로 결제`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KakaoPayModal;
