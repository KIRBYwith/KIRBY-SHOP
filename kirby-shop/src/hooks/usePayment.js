// src/hooks/usePayment.js
import { useState } from 'react';

const usePayment = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // 결제 수단 선택
  const selectMethod = (method) => {
    setPaymentMethod(method);
    setPaymentError(null);
  };

  // 실제 결제 요청 함수
  const requestPayment = async (orderData) => {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      switch (paymentMethod) {
        case 'kakao':
          await initKakaoPayment(orderData);
          break;
        case 'naver':
          await initNaverPayment(orderData);
          break;
        case 'inicis':
          await initInicisPayment(orderData);
          break;
        case 'toss':
          await initTossPayment(orderData);
          break;
        default:
          throw new Error('결제 수단을 선택해주세요.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
      setPaymentLoading(false);
    }
  };

  // 카카오페이 초기화
  const initKakaoPayment = async (orderData) => {
    try {
      // 카카오페이 SDK 로드
      if (!window.Kakao) {
        await loadKakaoPayScript();
      }

      // 카카오페이 결제 요청
      const response = await fetch('/api/payment/kakao/ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_order_id: orderData.orderId,
          partner_user_id: orderData.userId,
          item_name: orderData.itemName,
          quantity: orderData.quantity,
          total_amount: orderData.totalAmount,
          vat_amount: Math.floor(orderData.totalAmount / 11),
          tax_free_amount: 0,
          approval_url: `${window.location.origin}/payment/success`,
          fail_url: `${window.location.origin}/payment/fail`,
          cancel_url: `${window.location.origin}/payment/cancel`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // 카카오페이 결제창 오픈
        window.location.href = data.next_redirect_pc_url;
      } else {
        throw new Error(data.message || '카카오페이 결제 준비 중 오류가 발생했습니다.');
      }
    } catch (error) {
      throw new Error(`카카오페이 오류: ${error.message}`);
    }
  };

  // 네이버페이 초기화
  const initNaverPayment = async (orderData) => {
    try {
      // 네이버페이 SDK 로드
      if (!window.naver) {
        await loadNaverPayScript();
      }

      const oPay = window.Naver.Pay.create({
        mode: 'development', // 'production' for live
        clientId: process.env.REACT_APP_NAVER_CLIENT_ID, // 환경변수에서 가져오기
        chainId: orderData.orderId,
        payType: 'normal'
      });

      const oReq = {
        merchantPayKey: orderData.orderId,
        productName: orderData.itemName,
        productCount: orderData.quantity,
        totalPayAmount: orderData.totalAmount,
        taxScopeAmount: orderData.totalAmount,
        taxExScopeAmount: 0,
        returnUrl: `${window.location.origin}/payment/naver/callback`
      };

      oPay.open(oReq);
      setPaymentLoading(false);
    } catch (error) {
      throw new Error(`네이버페이 오류: ${error.message}`);
    }
  };

  // 이니시스 초기화
  const initInicisPayment = async (orderData) => {
    try {
      // 이니시스 SDK 로드
      if (!window.INIStdPay) {
        await loadInicisScript();
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://mobile.inicis.com/smart/payment/';
      
      const fields = {
        P_MID: process.env.REACT_APP_INICIS_MID, // 상점 ID
        P_OID: orderData.orderId,
        P_AMT: orderData.totalAmount,
        P_UNAME: '구매자',
        P_GOODS: orderData.itemName,
        P_NOTI: orderData.orderId,
        P_NEXT_URL: `${window.location.origin}/payment/inicis/callback`,
        P_NOTI_URL: `${window.location.origin}/api/payment/inicis/noti`
      };

      Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      setPaymentLoading(false);
    } catch (error) {
      throw new Error(`이니시스 오류: ${error.message}`);
    }
  };

  // 토스페이 초기화
  const initTossPayment = async (orderData) => {
    try {
      // 토스페이 SDK 로드
      if (!window.TossPayments) {
        await loadTossPayScript();
      }

      const tossPayments = window.TossPayments(process.env.REACT_APP_TOSS_CLIENT_KEY);
      
      // 결제창 호출
      tossPayments.requestPayment('카드', {
        amount: orderData.totalAmount,
        orderId: orderData.orderId,
        orderName: orderData.itemName,
        customerName: '구매자',
        successUrl: `${window.location.origin}/payment/toss/success`,
        failUrl: `${window.location.origin}/payment/toss/fail`,
      });
      
      setPaymentLoading(false);
    } catch (error) {
      throw new Error(`토스페이 오류: ${error.message}`);
    }
  };

  // 스크립트 로드 함수들
  const loadKakaoPayScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('kakao-pay-script')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'kakao-pay-script';
      script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
      script.onload = () => {
        window.Kakao.init(process.env.REACT_APP_KAKAO_APP_KEY);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadNaverPayScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('naver-pay-script')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'naver-pay-script';
      script.src = 'https://nsp.pay.naver.com/sdk/js/naverpay.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadInicisScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('inicis-script')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'inicis-script';
      script.src = 'https://stdpay.inicis.com/stdjs/INIStdPay.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadTossPayScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('toss-pay-script')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'toss-pay-script';
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // 결제 상태 초기화
  const resetPayment = () => {
    setPaymentMethod('');
    setPaymentLoading(false);
    setPaymentError(null);
    setPaymentResult(null);
  };

  return {
    paymentMethod,
    paymentLoading,
    paymentError,
    paymentResult,
    selectMethod,
    requestPayment,
    resetPayment
  };
};

export default usePayment;