// src/pages/PaymentPage.js
import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ShippingAddressSelector from '../components/shipping/ShippingAddressSelector';
import '../styles/EcommercePages.css';
import { useOrder } from '../hooks/useOrder';
import usePayment from '../hooks/usePayment';
import { useAuth } from '../contexts/AuthContext';
import DaumPostcode from 'react-daum-postcode';
import { ShoppingCart, CreditCard, Truck, Shield } from 'lucide-react';

const PaymentPage = () => {
  const { order } = useOrder();
  const savedOrder = (() => {
    try { 
      return JSON.parse(localStorage.getItem('kirby-shop-current-order') || 'null'); 
    } catch { 
      return null; 
    }
  })();
  
  const activeOrder = order && order.items && order.items.length > 0 ? order : (savedOrder || order);
  const { user } = useAuth();
  const { 
    paymentMethod, 
    selectMethod, 
    requestPayment, 
    paymentLoading, 
    paymentError, 
    paymentResult 
  } = usePayment();

  const [payStatus, setPayStatus] = useState('');
  const [shipping, setShipping] = useState(order?.receiver ? { ...order.receiver } : { 
    name: "", 
    phone: "", 
    address: "", 
    addressDetail: "", 
    zip: "",
    deliveryRequest: "",
    _selectedAddressId: null
  });
  const [sameAsMember, setSameAsMember] = useState(false);
  const [showPostCode, setShowPostCode] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(true);

  // 결제 금액 및 할인 정보
  const baseAmount = activeOrder?.baseAmount || activeOrder?.summary?.payable || 0;
  const discount = activeOrder?.discountAmount || 0;
  const finalAmount = activeOrder?.payable || (baseAmount - discount);

  const handleSameAsMember = (e) => {
    if (e.target.checked) {
      setShipping({
        name: user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        addressDetail: user?.addressDetail || "",
        zip: user?.postcode || "",
      });
      setSameAsMember(true);
    } else if (order?.receiver) {
      setShipping({ ...order.receiver });
      setSameAsMember(false);
    } else {
      setShipping({ name: "", phone: "", address: "", addressDetail: "", zip: "" });
      setSameAsMember(false);
    }
  };

  const handleCompletePostCode = (data) => {
    setShipping(prev => ({
      ...prev,
      address: data.address,
      zip: data.zonecode,
    }));
    setShowPostCode(false);
  };

  const handlePayment = async () => {
    if (!activeOrder || !activeOrder.items?.length) {
      alert('주문 정보가 없습니다.');
      return;
    }
    if (!paymentMethod) {
      alert('결제 수단을 선택해주세요.');
      return;
    }
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.zip) {
      alert('수령인, 연락처, 주소, 우편번호를 모두 입력해주세요.');
      return;
    }

    const mainItem = activeOrder.items[0]?.product || activeOrder.items[0];
    try {
      setPayStatus('loading');
      await requestPayment({
        orderId: activeOrder.orderId || `ORDER-${Date.now()}`,
        userId: user?.id || 'guest',
        itemName: mainItem.title,
        quantity: activeOrder.items.length,
        totalAmount: finalAmount,
        shippingInfo: shipping,
        couponId: activeOrder?.couponId,
        discountAmount: activeOrder?.discountAmount,
      });
      setPayStatus('pending');
    } catch (err) {
      setPayStatus('fail');
      console.error('Payment initiation failed:', err);
    }
  };

  // 결제 수단별 스타일
  const getPaymentMethodStyle = (method) => {
    const baseStyle = "payment-method-btn";
    if (paymentMethod !== method) return baseStyle;
    
    switch (method) {
      case 'kakao': return `${baseStyle} active kakao`;
      case 'naver': return `${baseStyle} active naver`;
      case 'inicis': return `${baseStyle} active inicis`;
      case 'toss': return `${baseStyle} active toss`;
      default: return `${baseStyle} active`;
    }
  };

  if (!activeOrder || !activeOrder.items?.length) {
    return (
      <div className="page-container payment-page">
        <Header />
        <div className="page-content">
          <div className="section-card">
            <div className="page-header">
              <div className="page-title">
                <ShoppingCart size={28} />
                주문 정보 없음
              </div>
              <p className="page-subtitle">결제할 상품이 없습니다. 장바구니를 확인해주세요.</p>
            </div>
            <button 
              className="order-btn"
              onClick={() => window.location.href = '/cart'}
            >
              장바구니로 이동
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container payment-page">
      <Header />
      <div className="page-content">
        {/* 페이지 헤더 */}
        <div className="page-header">
          <div className="page-title">
            <CreditCard size={28} />
            결제하기
          </div>
          <p className="page-subtitle">안전하고 빠른 결제를 진행해보세요</p>
        </div>

        {/* 주문 정보 요약 */}
        <div className="order-summary">
          <div className="section-header">
            <div className="section-title">
              <ShoppingCart size={20} />
              주문 정보
            </div>
          </div>
          
          <div className="order-number">
            주문번호: {activeOrder?.orderId}
          </div>
          
          <div className="order-items-section">
            {activeOrder?.items?.map((item, idx) => (
              <div key={item.id || item.product?.id || idx} className="order-item">
                <img 
                  src={item.image || item.product?.image} 
                  alt={item.title || item.product?.title}
                  className="order-item-image"
                />
                <div className="order-item-info">
                  <div className="order-item-title">
                    {item.title || item.product?.title}
                  </div>
                  <div className="order-item-quantity">
                    수량: {item.quantity || 1}개
                  </div>
                </div>
                <div className="order-item-price">
                  {(item.price || item.product?.price)?.toLocaleString()}원
                </div>
              </div>
            ))}
          </div>

          <div className="payment-summary">
            <div className="payment-row">
              <span>상품 금액</span>
              <span>{baseAmount.toLocaleString()}원</span>
            </div>
            {discount > 0 && (
              <div className="payment-row">
                <span>쿠폰 할인</span>
                <span className="discount">-{discount.toLocaleString()}원</span>
              </div>
            )}
            <div className="payment-row final">
              <span>총 결제금액</span>
              <span>{finalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 배송지 정보 */}
        <div className="shipping-section">
          <div className="section-header">
            <div className="section-title">
              <Truck size={20} />
              배송지 정보
            </div>
          </div>
          
          {/* 새로운 배송지 선택 컴포넌트 */}
          {showAddressSelector ? (
            <div className="shipping-address-section">
              <ShippingAddressSelector
                user={user}
                selectedAddress={shipping}
                onAddressSelect={(address) => {
                  setShipping({
                    ...address,
                    _selectedAddressId: address._selectedAddressId || null
                  });
                  setSameAsMember(false);
                }}
                onNewAddressCreated={() => {
                  // 새 주소가 생성되면 목록을 다시 로드
                }}
                showManualInput={true}
              />
              
              {/* 기존 방식으로 전환 버튼 */}
              <div style={{ marginTop: '16px' }}>
                <button 
                  type="button"
                  onClick={() => setShowAddressSelector(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#6c757d',
                    cursor: 'pointer'
                  }}
                >
                  기존 방식으로 입력하기
                </button>
              </div>
            </div>
          ) : (
            <div className="manual-shipping-section">
              <div style={{ marginBottom: '16px' }}>
                <button 
                  type="button"
                  onClick={() => setShowAddressSelector(true)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  저장된 배송지에서 선택하기
                </button>
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={sameAsMember}
                    onChange={handleSameAsMember}
                  />
                  회원정보와 동일하게 입력
                </label>
              </div>
            </div>
          )}

          {!showAddressSelector && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">수령인</label>
                  <input
                    className="form-input"
                    value={shipping.name}
                    onChange={e => setShipping(s => ({ ...s, name: e.target.value }))}
                    placeholder="받으실 분 성함"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">연락처</label>
                  <input
                    className="form-input"
                    value={shipping.phone}
                    onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">주소</label>
                <div className="form-row">
                  <input
                    className="form-input"
                    value={shipping.address}
                    placeholder="주소를 검색해주세요"
                    readOnly
                  />
                  <button
                    type="button"
                    className="address-search-btn"
                    onClick={() => setShowPostCode(true)}
                  >
                    주소 검색
                  </button>
                </div>
              </div>

              <div className="form-group">
                <input
                  className="form-input"
                  value={shipping.addressDetail}
                  onChange={e => setShipping(s => ({ ...s, addressDetail: e.target.value }))}
                  placeholder="상세주소 (동/호수 등)"
                />
              </div>

              <div className="form-group">
                <input
                  className="form-input"
                  value={shipping.zip}
                  placeholder="우편번호"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">배송 요청사항</label>
                <select
                  className="form-input"
                  value={shipping.deliveryRequest || ''}
                  onChange={e => setShipping(s => ({ ...s, deliveryRequest: e.target.value }))}
                >
                  <option value="">배송 요청사항을 선택해주세요</option>
                  <option value="부재 시 경비실에 맡겨주세요">부재 시 경비실에 맡겨주세요</option>
                  <option value="부재 시 택배함에 넣어주세요">부재 시 택배함에 넣어주세요</option>
                  <option value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</option>
                  <option value="배송 전 미리 연락주세요">배송 전 미리 연락주세요</option>
                  <option value="직접 받겠습니다">직접 받겠습니다</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* 결제 수단 선택 */}
        <div className="payment-methods">
          <div className="section-header">
            <div className="section-title">
              <Shield size={20} />
              결제 수단
            </div>
          </div>
          
          <div className="payment-method-grid">
            <button
              className={getPaymentMethodStyle('kakao')}
              onClick={() => selectMethod("kakao")}
            >
              카카오페이
            </button>
            <button
              className={getPaymentMethodStyle('naver')}
              onClick={() => selectMethod("naver")}
            >
              네이버페이
            </button>
            <button
              className={getPaymentMethodStyle('inicis')}
              onClick={() => selectMethod("inicis")}
            >
              이니시스
            </button>
            <button
              className={getPaymentMethodStyle('toss')}
              onClick={() => selectMethod("toss")}
            >
              토스페이
            </button>
          </div>

          <button
            className="order-btn"
            onClick={handlePayment}
            disabled={paymentLoading || payStatus === 'pending' || !paymentMethod}
          >
            {paymentLoading ? (
              <>
                <span className="loading-spinner"></span>
                결제 준비 중...
              </>
            ) : (
              `${finalAmount.toLocaleString()}원 결제하기`
            )}
          </button>
        </div>

        {/* 결제 상태 표시 */}
        {(payStatus || paymentError) && (
          <div className="payment-status">
            {payStatus === 'loading' && (
              <div className="status-message info">
                <span className="loading-spinner"></span>
                결제를 요청 중입니다...
              </div>
            )}
            {payStatus === 'pending' && (
              <div className="status-message info">
                결제창이 열렸습니다. 결제를 완료해주세요.
              </div>
            )}
            {paymentError && (
              <div className="status-message error">
                결제 오류: {paymentError}
              </div>
            )}
            {paymentResult && (
              <div className="status-message success">
                <h4>결제 결과</h4>
                <pre>{JSON.stringify(paymentResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* 주소 검색 모달 */}
        {showPostCode && (
          <div className="modal-overlay" onClick={() => setShowPostCode(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <DaumPostcode
                onComplete={handleCompletePostCode}
                style={{ width: '100%', height: '400px' }}
              />
              <button 
                className="order-btn" 
                onClick={() => setShowPostCode(false)}
                style={{ marginTop: '1rem' }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;