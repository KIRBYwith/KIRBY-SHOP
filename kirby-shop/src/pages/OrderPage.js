// src/pages/OrderPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CouponModal from '../components/coupon/CouponModal';
import DaumPostcode from 'react-daum-postcode';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import { useAuth } from '../contexts/AuthContext';
// import ProductListItem from '../components/product/ProductListItemOrder';
import ProductInfoAnother from '../components/detail/ProductInfoAnother';
import ProductImages from '../components/detail/ProductImages';
import '../styles/OrderPage.css';

const OrderPage = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity } = useCart(user);
  const { setOrder, getSummary, submitOrder } = useOrder(cartItems);

  // --- 추가: selectedOption 상태 선언 ---
  const [selectedOption, setSelectedOption] = useState('');

  // --- 추가: handleShare 함수 정의 ---
  const handleShare = () => {
    alert('공유 버튼 클릭됨');
  };

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showPostCode, setShowPostCode] = useState(false);
  const [receiver, _setReceiver] = useState({
    name: '', phone: '', address: '', addressDetail: '', zip: '', _copyFromMember: false
  });
  const [requestMsg, setRequestMsg] = useState('');
  const navigate = useNavigate();

  // 수량 변경이나 상품 삭제 시 쿠폰 할인 재계산을 위한 상태
  const [orderSummary, setOrderSummary] = useState(null);

  // cartItems나 appliedCoupon이 변경될 때마다 주문 요약 업데이트
  useEffect(() => {
    if (getSummary) {
      const summary = getSummary();
      setOrderSummary(summary);
    }
  }, [cartItems, getSummary]);

  const handleCompletePostCode = (data) => {
    _setReceiver(prev => ({
      ...prev,
      address: data.address,
      zip: data.zonecode,
    }));
    setShowPostCode(false);
  };

  // 개별 아이템 삭제 함수
  const handleRemoveItem = (cartItemId) => {
    if (window.confirm('이 상품을 주문에서 제외하시겠습니까?')) {
      removeFromCart(cartItemId);
    }
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  // ★ 중요: appliedCoupon이 null 또는 undefined일 경우를 대비해 optional chaining을 사용합니다.
  const couponDiscount = appliedCoupon?.discountInfo?.discount || 0;

  const handleOrderSubmit = () => {
    const summary = orderSummary || (getSummary ? getSummary() : { payable: 0 });
    const baseAmount = summary.payable ?? 0;
    const finalAmount = baseAmount - couponDiscount;

    if (!receiver.name || !receiver.phone || !receiver.address || !receiver.zip) {
      alert('수령인·연락처·주소·우편번호를 모두 입력하세요');
      return;
    }

    const newOrder = {
      orderId: `ORDER-${Date.now()}`,
      items: cartItems,
      summary: summary,
      payable: finalAmount,
      baseAmount: baseAmount,
      receiver,
      requestMsg,
      couponId: appliedCoupon?.couponId ?? null,
      discountAmount: couponDiscount,
      status: "REQUESTED"
    };

    setOrder(newOrder);
    try {
      localStorage.setItem('kirby-shop-current-order', JSON.stringify(newOrder));
    } catch (_) { }
    submitOrder(newOrder);
    navigate('/payment');
  };

  const summary = orderSummary || (getSummary ? getSummary() : { payable: 0 });
  const baseAmount = summary.payable ?? 0;
  const finalAmount = baseAmount - couponDiscount;

  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '70vh', textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>
            장바구니가 비어 있습니다.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div>
      <div className="page-container order-page">
        <div className="order-page">
          <Header />
          <main className="order-main">
            <div className="order-header">
              <h2 className="order-title">주문서 작성</h2>
              <button type="button" className="coupon-btn" onClick={() => setShowCouponModal(true)}>쿠폰 적용하기</button>
            </div>

            <section className="order-section">
              <h3 className="section-title">주문 상품</h3>
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.cartItemId || item.id} className="order-item-wrapper">
                    {/* Add ProductImages here */}
                    <ProductImages images={item.images || [item.image]} />

                    <ProductInfoAnother
                      product={item}
                      quantity={item.quantity}
                      setQuantity={(newQty) => handleQuantityChange(item.cartItemId, newQty)}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
                      handleShare={handleShare}
                      showRating={true}
                      showStock={true}
                      showDescription={true}
                      showShippingInfo={true}
                      layout="detail"
                    />
                    <button
                      className="delete-btn"
                      onClick={() => handleRemoveItem(item.cartItemId)}
                      title="상품 제외"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {showCouponModal && (
              <CouponModal
                isOpen={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                onApplyCoupon={(couponId, discountData) => {
                  // discountData가 null/undefined이거나 discount 속성이 없는 경우를 방어
                  if (couponId && discountData && typeof discountData.discount === 'number' && discountData.discount >= 0) {
                    setAppliedCoupon({
                      couponId,
                      discountInfo: discountData
                    });
                  } else {
                    setAppliedCoupon(null);
                  }
                }}
                cartItems={cartItems}
                orderAmount={baseAmount}
                appliedCouponId={appliedCoupon?.couponId ?? null}
                user={user}
              />
            )}

            <section className="order-section">
              <h3 className="section-title">결제 요약</h3>
              <div className="summary-card">
                <div className="row"><span>상품 금액</span><span>{baseAmount.toLocaleString()}원</span></div>
                {couponDiscount > 0 && (
                  <div className="row discount"><span>쿠폰 할인</span><span>-{couponDiscount.toLocaleString()}원</span></div>
                )}
                <div className="row total"><span>총 결제금액</span><span>{finalAmount.toLocaleString()}원</span></div>
              </div>
            </section>

            <section className="order-section">
              <h3 className="section-title">배송지 정보</h3>
              <label className="copy-check">
                <input
                  type="checkbox"
                  checked={receiver._copyFromMember}
                  onChange={e => {
                    if (e.target.checked) {
                      _setReceiver({
                        name: user?.name ?? "",
                        phone: user?.phone ?? "",
                        address: user?.address ?? "",
                        addressDetail: user?.addressDetail ?? "",
                        zip: user?.postcode ?? "",
                        _copyFromMember: true
                      });
                    } else {
                      _setReceiver({ name: '', phone: '', address: '', addressDetail: '', zip: '', _copyFromMember: false });
                    }
                  }}
                />
                회원정보와 동일하게 입력
              </label>

              <div className="address-row">
                <input
                  value={receiver.address}
                  onChange={e => _setReceiver(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="주소"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setShowPostCode(true)}
                  className="search-btn"
                >주소 검색</button>
              </div>

              {showPostCode && (
                <div className="postcode-overlay">
                  <div className="postcode-modal">
                    <DaumPostcode
                      onComplete={handleCompletePostCode}
                      style={{ width: 360, height: 400 }}
                    />
                    <button onClick={() => setShowPostCode(false)} className="close-postcode">닫기</button>
                  </div>
                </div>
              )}

              <input
                value={receiver.addressDetail}
                onChange={e => _setReceiver(prev => ({ ...prev, addressDetail: e.target.value }))}
                placeholder="상세주소"
                className="full-input"
              />
              <input
                value={receiver.zip}
                onChange={e => _setReceiver(prev => ({ ...prev, zip: e.target.value }))}
                placeholder="우편번호"
                className="full-input"
                readOnly
              />
              <div className="inline-row">
                <input
                  value={receiver.name}
                  onChange={e => _setReceiver(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="받는 분 이름"
                />
                <input
                  value={receiver.phone}
                  onChange={e => _setReceiver(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="연락처"
                />
              </div>
              <textarea
                value={requestMsg}
                onChange={e => setRequestMsg(e.target.value)}
                placeholder="배송 요청사항을 입력하세요"
                className="memo"
              />
            </section>

            <button type="button" className="pay-btn" onClick={handleOrderSubmit}>결제하기</button>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderPage;