// src/hooks/usePayment.js (카카오, 이니시스, 네이버페이, 토스페이 통합 예시)
import { useState } from "react";

/** [카카오] */
const KAKAO_API_BASE = "https://kapi.kakao.com/v1/payment";
const KAKAO_CID = "TC0ONETIME"; // 공식 테스트 CID
const KAKAO_ADMIN_KEY = "KakaoAK YOUR_KAKAO_TEST_KEY";

/** [이니시스] */
const INICIS_API_BASE = "https://sandbox-api.inicis.com/v1";
const INICIS_CLIENT_ID = "INIpayTest";
const INICIS_CLIENT_PW = "1234567890";
const INICIS_MID = "INIpayTest";

/** [네이버페이] */
const NAVER_API_BASE = "https://dev-pay.paygate.naver.com/v2";
const NAVER_SANDBOX_CLIENT_ID = "YOUR_NAVERPAY_SANDBOX_ID";
const NAVER_SANDBOX_SECRET = "YOUR_NAVERPAY_SANDBOX_SECRET";

/** [토스페이] */
const TOSS_API_BASE = "https://api.tosspayments.com/v1";
const TOSS_TEST_SECRET = "test_sk_YOUR_TOSS_SECRET"; // 토스 샌드박스 SecretKey

export function usePayment() {
  const [method, setMethod] = useState("kakao"); // 'kakao' | 'inicis' | 'naver' | 'toss'
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const selectMethod = (payMethod) => setMethod(payMethod);

  /** ---- 카카오페이 ---- */
  const requestKakaoPay = async ({
    orderId, userId, itemName, quantity, totalAmount,
    successUrl = `${window.location.origin}/payment/success`,
    failUrl = `${window.location.origin}/payment/fail`,
    cancelUrl = `${window.location.origin}/payment/cancel`,
  }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const params = new URLSearchParams({
        cid: KAKAO_CID,
        partner_order_id: orderId,
        partner_user_id: userId,
        item_name: itemName,
        quantity,
        total_amount: totalAmount,
        vat_amount: (totalAmount / 11).toFixed(0),
        tax_free_amount: 0,
        approval_url: successUrl,
        cancel_url: cancelUrl,
        fail_url: failUrl,
      });
      const resp = await fetch(`${KAKAO_API_BASE}/ready`, {
        method: "POST",
        headers: {
          Authorization: KAKAO_ADMIN_KEY,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: params,
      });
      if (!resp.ok) throw new Error((await resp.json()).msg || "카카오페이 결제 실패");
      const data = await resp.json();
      setPaymentResult(data);
      window.location.href = data.next_redirect_pc_url;
      return data;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };
  const approveKakaoPay = async ({ tid, pgToken, partner_order_id, partner_user_id }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const params = new URLSearchParams({
        cid: KAKAO_CID, tid, partner_order_id, partner_user_id, pg_token: pgToken,
      });
      const resp = await fetch(`${KAKAO_API_BASE}/approve`, {
        method: "POST",
        headers: {
          Authorization: KAKAO_ADMIN_KEY,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: params,
      });
      if (!resp.ok) throw new Error((await resp.json()).msg || "카카오페이 승인 실패");
      const data = await resp.json();
      setPaymentResult(data); setPaymentLoading(false);
      return data;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };

  /** ---- 이니시스 ---- */
  const requestInicis = async ({
    orderId, itemName, totalAmount, userId,
    successUrl = `${window.location.origin}/payment/success`,
    failUrl = `${window.location.origin}/payment/fail`,
    cancelUrl = `${window.location.origin}/payment/cancel`,
  }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const tokenResp = await fetch(`${INICIS_API_BASE}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "client_cert", id: INICIS_CLIENT_ID, pw: INICIS_CLIENT_PW
        })
      });
      const tokenJson = await tokenResp.json();
      if (!tokenJson.access_token) throw new Error("이니시스 토큰 발급 실패");

      const payData = {
        mid: INICIS_MID,
        oid: orderId,
        price: totalAmount,
        goodname: itemName,
        buyername: userId,
        returndetailurl: successUrl,
        returnurl: successUrl,
      };
      const paymentResp = await fetch(`${INICIS_API_BASE}/pay/open`, {
        method: "POST",
        headers: {
          "Authorization": tokenJson.access_token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payData),
      });
      const paymentJson = await paymentResp.json();
      if (paymentJson.resultCode !== "00") throw new Error(paymentJson.resultMsg || "이니시스 결제 실패");
      setPaymentResult(paymentJson);
      window.location.href = paymentJson.payUrl;
      return paymentJson;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };
  const approveInicis = async ({ authToken, oid }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const resp = await fetch(`${INICIS_API_BASE}/pay/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authToken, mid: INICIS_MID, oid, price: 0 })
      });
      const approveJson = await resp.json();
      if (approveJson.resultCode !== "00") throw new Error(approveJson.resultMsg || "이니시스 승인 실패");
      setPaymentResult(approveJson); setPaymentLoading(false);
      return approveJson;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };

  /** ---- 네이버페이 ---- */
  const requestNaverPay = async ({
    orderId, userId, itemName, totalAmount,
    successUrl = `${window.location.origin}/payment/success`,
    failUrl = `${window.location.origin}/payment/fail`,
    cancelUrl = `${window.location.origin}/payment/cancel`,
  }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      // 네이버페이 샌드박스: dev-pay.paygate.naver.com
      const payData = {
        merchantPayKey: orderId,
        merchantUserKey: userId,
        productName: itemName,
        totalPayAmount: totalAmount,
        returnUrl: successUrl, // 결과 콜백
        cancelUrl,
        failUrl,
        // ...기타 샌드박스 파라미터 및 사양에 맞게 확장
      };
      const resp = await fetch(`${NAVER_API_BASE}/payments/request`, {
        method: "POST",
        headers: {
          "X-Naver-Client-Id": NAVER_SANDBOX_CLIENT_ID,
          "X-Naver-Client-Secret": NAVER_SANDBOX_SECRET,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payData),
      });
      const result = await resp.json();
      if (result.code !== "Success") throw new Error(result.message || "네이버페이 결제 실패");
      setPaymentResult(result);
      window.location.href = result.body.confirmUrl; // 결제창(모의) 이동
      return result;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };

  const approveNaverPay = async ({ paymentId, authToken }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const resp = await fetch(`${NAVER_API_BASE}/payments/confirm`, {
        method: "POST",
        headers: {
          "X-Naver-Client-Id": NAVER_SANDBOX_CLIENT_ID,
          "X-Naver-Client-Secret": NAVER_SANDBOX_SECRET,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentId, authToken }),
      });
      const result = await resp.json();
      if (result.code !== "Success") throw new Error(result.message || "네이버페이 승인 실패");
      setPaymentResult(result); setPaymentLoading(false);
      return result;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };

  /** ---- 토스페이 ---- */
  const requestTossPay = async ({
    orderId, itemName, totalAmount, userId,
    successUrl = `${window.location.origin}/payment/success`,
    failUrl = `${window.location.origin}/payment/fail`,
    cancelUrl = `${window.location.origin}/payment/cancel`,
  }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const payData = {
        orderId,
        orderName: itemName,
        amount: totalAmount,
        customerName: userId,
        successUrl,
        failUrl,
        // ...기타 토스 파라미터는 공식 문서 참고(필요시)
      };
      const resp = await fetch(`${TOSS_API_BASE}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(TOSS_TEST_SECRET + ":")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payData),
      });
      const result = await resp.json();
      if (result.code && result.code !== "SUCCESS") throw new Error(result.message || "토스페이 결제 실패");
      setPaymentResult(result);
      window.location.href = result.next_redirect_pc_url; // 샌드박스용 결제창 URL
      return result;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };

  const approveTossPay = async ({ paymentKey, orderId, amount }) => {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const resp = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(TOSS_TEST_SECRET + ":")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      const result = await resp.json();
      if (result.code && result.code !== "SUCCESS") throw new Error(result.message || "토스페이 승인 실패");
      setPaymentResult(result); setPaymentLoading(false);
      return result;
    } catch (err) {
      setPaymentError(err.message); setPaymentLoading(false);
      throw err;
    }
  };

  // 통합 결제 요청
  const requestPayment = async (payload) => {
    if (method === "kakao") return requestKakaoPay(payload);
    if (method === "inicis") return requestInicis(payload);
    if (method === "naver") return requestNaverPay(payload);
    if (method === "toss") return requestTossPay(payload);
    throw new Error("지원하지 않는 결제수단입니다.");
  };

  const approvePayment = async (payload) => {
    if (method === "kakao") return approveKakaoPay(payload);
    if (method === "inicis") return approveInicis(payload);
    if (method === "naver") return approveNaverPay(payload);
    if (method === "toss") return approveTossPay(payload);
    throw new Error("지원하지 않는 결제수단입니다.");
  };

  const resetPayment = () => {
    setPaymentLoading(false); setPaymentError(null); setPaymentResult(null);
  };

  return {
    paymentMethod: method,
    selectMethod,
    paymentLoading,
    paymentError,
    paymentResult,
    requestPayment,
    approvePayment,
    resetPayment,
    // 각각의 메서드도 직접 사용 가능
    requestKakaoPay, approveKakaoPay,
    requestInicis, approveInicis,
    requestNaverPay, approveNaverPay,
    requestTossPay, approveTossPay,
  };
}

export default usePayment;
