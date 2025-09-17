import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Percent, Truck, Calendar, CheckCircle } from 'lucide-react';
import '../styles/CouponBoxPage.css';

const CouponBoxPage = () => {
  const { user } = useAuth();

  // test 계정의 쿠폰들 또는 일반 사용자의 쿠폰들
  const coupons = user?.coupons || [];

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
      return `${coupon.discount}% 할인`;
    } else if (coupon.type === 'fixed') {
      return `${coupon.discount.toLocaleString()}원 할인`;
    } else if (coupon.type === 'shipping') {
      return '무료배송';
    }
    return '할인';
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
      <Footer />
    </>
  );
};

export default CouponBoxPage;


