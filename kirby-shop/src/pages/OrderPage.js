// src/pages/OrderPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CouponModal from '../components/coupon/CouponModal';
import PaymentModal from '../components/payment/PaymentModal';
import ShippingAddressSelector from '../components/shipping/ShippingAddressSelector';
import DaumPostcode from 'react-daum-postcode';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import { useAuth } from '../contexts/AuthContext';
import { calculateFinalPrice, formatPrice } from '../utils/priceCalculator';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiver, _setReceiver] = useState({
    name: '', phone: '', address: '', addressDetail: '', zip: '', _copyFromMember: false, deliveryRequest: '', _selectedAddressId: null
  });
  const [showAddressSelector, setShowAddressSelector] = useState(true);
  const [requestMsg, setRequestMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 수량 변경이나 상품 삭제 시 쿠폰 할인 재계산을 위한 상태
  const [orderSummary, setOrderSummary] = useState(null);
  // 결제 시 가격 정보 고정
  const [fixedPriceInfo, setFixedPriceInfo] = useState(null);

  // cartItems나 appliedCoupon이 변경될 때마다 주문 요약 업데이트
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      // 배송지 주소 정보를 포함한 가격 계산
      const shippingAddress = receiver.address ? `${receiver.address} ${receiver.addressDetail || ''}`.trim() : null;
      const priceCalculation = calculateFinalPrice(cartItems, appliedCoupon, { shippingAddress });
      setOrderSummary(priceCalculation);
    }
  }, [cartItems, appliedCoupon, receiver.address, receiver.addressDetail]);

  // 결제 모달이 열려있을 때 상태 변경 방지
  useEffect(() => {
    if (showPaymentModal) {
      // 결제 모달이 열려있을 때는 상태 업데이트를 중단
      return;
    }
  }, [showPaymentModal]);

  // 연락처 자동 포맷팅 함수
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 실시간 필드 검증
  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'name':
        if (!value || value.trim() === '') {
          errors.name = '수령인 성함을 입력해주세요';
        } else if (value.trim().length < 2) {
          errors.name = '성함은 2자 이상 입력해주세요';
        } else {
          delete errors.name;
        }
        break;
      case 'phone':
        if (!value || value.trim() === '') {
          errors.phone = '연락처를 입력해주세요';
        } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(value.replace(/-/g, ''))) {
          errors.phone = '올바른 연락처 형식이 아닙니다';
        } else {
          delete errors.phone;
        }
        break;
      case 'address':
        if (!value || value.trim() === '') {
          errors.address = '주소를 입력해주세요';
        } else {
          delete errors.address;
        }
        break;
      case 'addressDetail':
        if (!value || value.trim() === '') {
          errors.addressDetail = '상세주소를 입력해주세요';
        } else {
          delete errors.addressDetail;
        }
        break;
      case 'zip':
        if (!value || value.trim() === '') {
          errors.zip = '우편번호를 입력해주세요';
        } else if (!/^[0-9]{5}$/.test(value)) {
          errors.zip = '올바른 우편번호 형식이 아닙니다';
        } else {
          delete errors.zip;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleCompletePostCode = (data) => {
    _setReceiver(prev => ({
      ...prev,
      address: data.address,
      zip: data.zonecode,
    }));
    setShowPostCode(false);
    // 주소 검색 후 검증
    validateField('address', data.address);
    validateField('zip', data.zonecode);
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

  const handleOrderSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // 배송지 주소 정보를 포함한 가격 계산
    const shippingAddress = receiver.address ? `${receiver.address} ${receiver.addressDetail || ''}`.trim() : null;
    const summary = orderSummary || calculateFinalPrice(cartItems, appliedCoupon, { shippingAddress });
    const baseAmount = summary.totalPrice ?? 0;
    const finalAmount = summary.finalPrice ?? 0;

    // 모든 필드 재검증
    validateField('name', receiver.name);
    validateField('phone', receiver.phone);
    validateField('address', receiver.address);
    validateField('addressDetail', receiver.addressDetail);
    validateField('zip', receiver.zip);

    // 검증 오류가 있으면 제출 중단
    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    // 가격 정보 고정
    const priceInfo = {
      baseAmount: summary.totalPrice,
      couponDiscount: summary.couponDiscount,
      finalAmount: summary.finalPrice,
      summary
    };
    setFixedPriceInfo(priceInfo);

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

    try {
      setOrder(newOrder);
      localStorage.setItem('kirby-shop-current-order', JSON.stringify(newOrder));
      submitOrder(newOrder);
      
      // 결제 모달 열기
      setShowPaymentModal(true);
    } catch (error) {
      console.error('주문 처리 중 오류:', error);
      alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 결제 모달용 주문 데이터 생성
  const getOrderData = () => {
    // 배송지 주소 정보를 포함한 가격 계산
    const shippingAddress = receiver.address ? `${receiver.address} ${receiver.addressDetail || ''}`.trim() : null;
    const summary = orderSummary || calculateFinalPrice(cartItems, appliedCoupon, { shippingAddress });
    const baseAmount = summary.totalPrice ?? 0;
    const finalAmount = summary.finalPrice ?? 0;
    const shippingFee = summary.shippingFee ?? 3000;
    const totalAmount = finalAmount;

    // 실제 상품별 금액 계산
    const items = cartItems.map(item => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return {
        id: item.id || item.cartItemId,
        name: item.name || '상품명',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || item.images?.[0] || '/img-items/star-t-shirt.png',
        total: itemTotal
      };
    });

    // 전체 상품 금액 재계산
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.total, 0);

    return {
      orderId: `ORDER-${Date.now()}`,
      items: items,
      subtotal: baseAmount,
      shippingFee: shippingFee,
      discountAmount: summary.couponDiscount || 0,
      totalAmount: totalAmount,
      userInfo: {
        name: receiver.name,
        email: user?.email || '',
        phone: receiver.phone
      }
    };
  };

  // 결제 성공 처리
  const handlePaymentSuccess = (paymentResult) => {
    console.log('결제 성공:', paymentResult);
    setShowPaymentModal(false);
    
    // 주문내역에 저장
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const newOrder = {
      orderId: `ORDER-${Date.now()}`,
      items: cartItems,
      totalAmount: finalAmount,
      paymentMethod: paymentResult.payment_method || 'unknown',
      paymentDate: new Date().toISOString(),
      status: 'completed',
      receiver: receiver,
      requestMsg: requestMsg
    };
    orderHistory.unshift(newOrder);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
    // 장바구니 비우기
    cartItems.forEach(item => removeFromCart(item.cartItemId));
    
    alert('결제가 완료되었습니다!');
    navigate('/order-history');
  };

  // 결제 실패 처리
  const handlePaymentError = (error) => {
    console.error('결제 실패:', error);
    alert('결제에 실패했습니다. 다시 시도해주세요.');
  };

  // 고정된 가격 정보가 있으면 사용, 없으면 실시간 계산
  const summary = fixedPriceInfo?.summary || orderSummary || calculateFinalPrice(cartItems, appliedCoupon);
  const baseAmount = fixedPriceInfo?.baseAmount ?? summary.totalPrice ?? 0;
  const finalAmount = fixedPriceInfo?.finalAmount ?? summary.finalPrice ?? 0;
  
  // 디버깅 정보
  console.log('OrderPage Debug:', {
    cartItems,
    orderSummary,
    summary,
    baseAmount,
    couponDiscount,
    finalAmount
  });

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
              <div className="header-left">
                <h2 className="order-title">주문서 작성</h2>
                <div className="order-progress">
                  <div className="progress-step active">
                    <span className="step-number">1</span>
                    <span className="step-text">주문 상품</span>
                  </div>
                  <div className="progress-line"></div>
                  <div className="progress-step active">
                    <span className="step-number">2</span>
                    <span className="step-text">배송 정보</span>
                  </div>
                  <div className="progress-line"></div>
                  <div className="progress-step">
                    <span className="step-number">3</span>
                    <span className="step-text">결제</span>
                  </div>
                </div>
              </div>
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
                <div className="row"><span>상품 금액</span><span>{formatPrice(baseAmount)}</span></div>
                <div className="row">
                  <span>배송비</span>
                  <span>
                    {summary.shippingFee > 0 ? (
                      <>
                        {formatPrice(summary.shippingFee)}
                        <div className="shipping-info">
                          <small style={{ display: 'block', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {summary.region && summary.region !== '기본' ? (
                              `(${summary.region} 지역)`
                            ) : (
                              '기본 배송비'
                            )}
                          </small>
                          <small style={{ display: 'block', fontSize: '11px', color: '#999', marginTop: '2px' }}>
                            {summary.shippingFee >= 30000 ? '30,000원 이상 구매 시 무료배송' : `${formatPrice(30000 - summary.shippingFee)}원 더 구매하면 무료배송`}
                          </small>
                        </div>
                      </>
                    ) : (
                      <span style={{ color: '#10b981' }}>
                        무료
                        <small style={{ display: 'block', fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                          (30,000원 이상 구매)
                        </small>
                      </span>
                    )}
                  </span>
                </div>
                {summary.couponDiscount > 0 && (
                  <div className="row discount"><span>쿠폰 할인</span><span>-{formatPrice(summary.couponDiscount)}</span></div>
                )}
                <div className="row total"><span>총 결제금액</span><span>{formatPrice(finalAmount)}</span></div>
              </div>
            </section>

            <section className="order-section">
              <h3 className="section-title">배송지 정보</h3>
              
              {/* 새로운 배송지 선택 컴포넌트 */}
              {showAddressSelector ? (
                <div className="shipping-address-section">
                  <ShippingAddressSelector
                    user={user}
                    selectedAddress={receiver}
                    onAddressSelect={(address) => {
                      _setReceiver({
                        ...address,
                        _copyFromMember: false
                      });
                    }}
                    onNewAddressCreated={() => {
                      // 새 주소가 생성되면 목록을 다시 로드
                    }}
                    showManualInput={true}
                  />
                  
                </div>
              ) : (
                <div className="manual-address-section">
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <button 
                      type="button"
                      onClick={() => setShowAddressSelector(true)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      저장된 배송지에서 선택하기
                    </button>
                  </div>
                  
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
                            _copyFromMember: true,
                            deliveryRequest: '',
                            _selectedAddressId: null
                          });
                        } else {
                          _setReceiver({ 
                            name: '', phone: '', address: '', addressDetail: '', zip: '', 
                            _copyFromMember: false, deliveryRequest: '', _selectedAddressId: null 
                          });
                        }
                      }}
                    />
                    회원정보와 동일하게 입력
                  </label>

                  <div className="form-group">
                    <label className="form-label">주소 *</label>
                    <div className="address-input-group">
                      <input
                        value={receiver.address}
                        onChange={e => {
                          _setReceiver(prev => ({ ...prev, address: e.target.value }));
                          validateField('address', e.target.value);
                        }}
                        placeholder="주소를 검색해주세요"
                        readOnly
                        className={`address-input ${validationErrors.address ? 'error' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPostCode(true)}
                        className="address-search-btn"
                      >주소 검색</button>
                    </div>
                    {validationErrors.address && (
                      <span className="error-message">{validationErrors.address}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">상세주소 *</label>
                    <input
                      value={receiver.addressDetail}
                      onChange={e => {
                        _setReceiver(prev => ({ ...prev, addressDetail: e.target.value }));
                        validateField('addressDetail', e.target.value);
                      }}
                      placeholder="동/호수, 건물명 등을 입력하세요"
                      className={`full-input ${validationErrors.addressDetail ? 'error' : ''}`}
                    />
                    {validationErrors.addressDetail && (
                      <span className="error-message">{validationErrors.addressDetail}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">우편번호 *</label>
                    <input
                      value={receiver.zip}
                      onChange={e => {
                        _setReceiver(prev => ({ ...prev, zip: e.target.value }));
                        validateField('zip', e.target.value);
                      }}
                      placeholder="우편번호"
                      readOnly
                      className={`full-input ${validationErrors.zip ? 'error' : ''}`}
                    />
                    {validationErrors.zip && (
                      <span className="error-message">{validationErrors.zip}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">받는 분 성함 *</label>
                    <input
                      value={receiver.name}
                      onChange={e => {
                        _setReceiver(prev => ({ ...prev, name: e.target.value }));
                        validateField('name', e.target.value);
                      }}
                      placeholder="받는 분 성함을 입력하세요"
                      className={`full-input ${validationErrors.name ? 'error' : ''}`}
                    />
                    {validationErrors.name && (
                      <span className="error-message">{validationErrors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">받는 분 연락처 *</label>
                    <input
                      value={receiver.phone}
                      onChange={e => {
                        const formatted = formatPhoneNumber(e.target.value);
                        _setReceiver(prev => ({ ...prev, phone: formatted }));
                        validateField('phone', formatted);
                      }}
                      placeholder="010-1234-5678"
                      className={`full-input ${validationErrors.phone ? 'error' : ''}`}
                      maxLength="13"
                    />
                    {validationErrors.phone && (
                      <span className="error-message">{validationErrors.phone}</span>
                    )}
                  </div>
                </div>
              )}

              {/* 배송 요청사항은 공통으로 표시 */}
              {!showAddressSelector && (
                <div style={{ marginTop: '16px' }}>
                  <select
                    value={receiver.deliveryRequest || ''}
                    onChange={e => _setReceiver(prev => ({ ...prev, deliveryRequest: e.target.value }))}
                    className="full-input"
                    style={{ marginTop: '8px' }}
                  >
                    <option value="">배송 요청사항을 선택해주세요</option>
                    <option value="부재 시 경비실에 맡겨주세요">부재 시 경비실에 맡겨주세요</option>
                    <option value="부재 시 택배함에 넣어주세요">부재 시 택배함에 넣어주세요</option>
                    <option value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</option>
                    <option value="배송 전 미리 연락주세요">배송 전 미리 연락주세요</option>
                    <option value="직접 받겠습니다">직접 받겠습니다</option>
                  </select>
                </div>
              )}

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
              <textarea
                value={requestMsg}
                onChange={e => setRequestMsg(e.target.value)}
                placeholder="배송 요청사항을 입력하세요"
                className="memo"
              />
            </section>

            <button 
              type="button" 
              className={`pay-btn ${isSubmitting ? 'loading' : ''}`} 
              onClick={handleOrderSubmit}
              disabled={isSubmitting || Object.keys(validationErrors).length > 0}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  주문 처리 중...
                </>
              ) : (
                `${formatPrice(finalAmount)} 결제하기`
              )}
            </button>
          </main>
        </div>
      </div>
      <Footer />

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setFixedPriceInfo(null); // 고정 가격 정보 초기화
        }}
        orderData={getOrderData()}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
};

export default OrderPage;