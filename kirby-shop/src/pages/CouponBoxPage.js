import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCoupon } from '../hooks/useCoupon';

const CouponBoxPage = () => {
  const { user } = useAuth();
  const { userCoupons } = useCoupon(user);

  return (
    <>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>쿠폰함</h2>
        {(!userCoupons || userCoupons.length === 0) ? (
          <div>보유한 쿠폰이 없습니다.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {userCoupons.map((c) => (
              <div key={c.userCouponId} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: '#666', margin: '4px 0 8px' }}>{c.description}</div>
                <div>유형: {c.type}</div>
                <div>유효기간: {new Date(c.validFrom).toLocaleDateString()} ~ {new Date(c.validUntil).toLocaleDateString()}</div>
                <div>남은 사용횟수: {c.remainingUses}</div>
                {c.maxDiscountAmount && <div>최대 할인: {c.maxDiscountAmount.toLocaleString()}원</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CouponBoxPage;


