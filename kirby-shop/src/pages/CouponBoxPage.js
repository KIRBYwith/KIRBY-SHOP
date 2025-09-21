import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCoupon } from '../hooks/useCoupon';
import { Gift, Percent, Truck, Calendar, CheckCircle, Plus, X } from 'lucide-react';
import '../styles/CouponBoxPage.css';

const CouponBoxPage = () => {
  const { user } = useAuth();
  const { userCoupons, issueCoupon } = useCoupon(user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');

  // 사용자 쿠폰들
  const coupons = userCoupons || [];

  const getCouponIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Percent size={20} />;
      case 'fixed':
        return <Gift size={20} />;
      case 'shipping':
        return <Truck size={20} />;
      default:
        return <Gift size={20} />;
    }
  };

  const getCouponTypeText = (type) => {
    switch (type) {
      case 'percentage':
        return '퍼센트 할인';
      case 'fixed':
        return '금액 할인';
      case 'shipping':
        return '배송비 할인';
      default:
        return '일반 할인';
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% 할인`;
    } else if (coupon.type === 'fixed') {
      return `${coupon.value.toLocaleString()}원 할인`;
    } else if (coupon.type === 'shipping') {
      return '무료배송';
    }
    return '할인';
  };

  // 쿠폰 등록 함수
  const handleCouponRegistration = async () => {
    if (!couponCode.trim()) {
      setMessage('쿠폰 번호를 입력해주세요.');
      return;
    }

    try {
      // 백엔드 API 호출
      const response = await fetch('/api/coupons/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          coupon_code: couponCode.trim().toUpperCase()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(result.message);
        setCouponCode('');
        // 쿠폰 목록 새로고침
        window.location.reload();
        setTimeout(() => {
          setIsModalOpen(false);
          setMessage('');
        }, 2000);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('쿠폰 등록 오류:', error);
      setMessage('쿠폰 등록 중 오류가 발생했습니다.');
    }
  };


  return (
    <>
      <Header />
      <div className="coupon-page-container">
        <div className="coupon-page-content">
          <div className="coupon-header">
            <h2 className="coupon-title">
              <Gift size={24} />
              쿠폰함
            </h2>
            <p className="coupon-subtitle">
              보유하신 쿠폰을 확인하고 사용하세요
            </p>
            <button 
              className="coupon-register-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} />
              쿠폰 등록
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="empty-coupon">
              <Gift size={48} className="empty-icon" />
              <h3>보유한 쿠폰이 없습니다</h3>
              <p>새로운 쿠폰을 받으려면 이벤트에 참여해보세요!</p>
            </div>
          ) : (
            <div className="coupon-stats">
              <div className="stat-item">
                <span className="stat-label">보유 쿠폰</span>
                <span className="stat-value">{coupons.length}개</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">사용 가능</span>
                <span className="stat-value">{coupons.filter(c => !c.isUsed).length}개</span>
              </div>
            </div>
          )}

          <div className="coupon-grid">
            {coupons.map((coupon) => (
              <div 
                key={coupon.id} 
                className={`coupon-card ${coupon.isUsed ? 'used' : 'active'}`}
              >
                <div className="coupon-header-card">
                  <div className="coupon-icon">
                    {getCouponIcon(coupon.type)}
                  </div>
                  <div className="coupon-info">
                    <h3 className="coupon-name">{coupon.name}</h3>
                    <span className="coupon-type">{getCouponTypeText(coupon.type)}</span>
                  </div>
                  {coupon.isUsed && (
                    <div className="used-badge">
                      <CheckCircle size={16} />
                      사용완료
                    </div>
                  )}
                </div>

                <div className="coupon-discount">
                  {formatDiscount(coupon)}
                </div>

                <div className="coupon-details">
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>유효기간: {coupon.validUntil}</span>
                  </div>
                  {coupon.minAmount > 0 && (
                    <div className="detail-item">
                      <span>최소 주문금액: {coupon.minAmount.toLocaleString()}원</span>
                    </div>
                  )}
                  {coupon.maxDiscount > 0 && (
                    <div className="detail-item">
                      <span>최대 할인: {coupon.maxDiscount.toLocaleString()}원</span>
                    </div>
                  )}
                </div>

                <div className="coupon-status">
                  {coupon.isUsed ? (
                    <span className="status-used">사용 완료</span>
                  ) : (
                    <span className="status-available">사용 가능</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 쿠폰 등록 모달 */}
      {isModalOpen && (
        <div className="coupon-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <h3>쿠폰 등록</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="coupon-modal-body">
              <div className="input-group">
                <label htmlFor="couponCode">쿠폰 번호</label>
                <input
                  id="couponCode"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 번호를 입력하세요"
                  className="coupon-input"
                  maxLength={20}
                />
              </div>
              
              {message && (
                <div className={`message ${message.includes('등록되었습니다') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
              
              <div className="coupon-hints">
                <h4>💡 쿠폰 번호 힌트</h4>
                <ul>
                  <li><strong>일반 쿠폰:</strong> WELCOME20, FREESHIP, FIXED5000</li>
                  <li><strong>특별 쿠폰:</strong> KIRBY로 시작하는 8자리 이상</li>
                  <li><strong>숫자 쿠폰:</strong> 6자리 이상 숫자</li>
                  <li><strong>마스터 쿠폰:</strong> MASTER, UNLIMITED 포함</li>
                </ul>
              </div>
            </div>
            
            <div className="coupon-modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="register-btn"
                onClick={handleCouponRegistration}
                disabled={!couponCode.trim()}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CouponBoxPage;


