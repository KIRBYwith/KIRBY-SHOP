// src/components/coupon/CouponModal.js

import React, { useState, useEffect } from 'react';
import { X, Tag, Gift, Clock, AlertCircle, CheckCircle2, Percent, Truck } from 'lucide-react';
import { useCoupon } from '../../hooks/useCoupon';

const CouponModal = ({ 
  isOpen, 
  onClose, 
  onApplyCoupon,
  cartItems = [],
  orderAmount = 0,
  shippingFee = 0,
  appliedCouponId = null,
  user
}) => {
  const {
    userCoupons,
    getAvailableCoupons,
    getExpiringSoonCoupons,
    calculateDiscount,
    validateCoupon,
    getCouponStats
  } = useCoupon(user);

  const [selectedCouponId, setSelectedCouponId] = useState(appliedCouponId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, available, expiring
  const [previewDiscount, setPreviewDiscount] = useState(null);

  const stats = getCouponStats();
  const availableCoupons = getAvailableCoupons(cartItems, orderAmount);
  const expiringSoonCoupons = getExpiringSoonCoupons(7);

  // 필터링된 쿠폰 목록
  const filteredCoupons = (userCoupons || []).filter(coupon => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!coupon.name.toLowerCase().includes(query) && 
          !coupon.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    // 타입 필터
    switch (filterType) {
      case 'available':
        return (availableCoupons || []).some(c => c.id === coupon.id);
      case 'expiring':
        return (expiringSoonCoupons || []).some(c => c.id === coupon.id);
      default:
        return true;
    }
  });

  // 쿠폰 선택 시 할인 미리보기
  useEffect(() => {
    if (selectedCouponId) {
      const discount = calculateDiscount(selectedCouponId, cartItems, orderAmount, shippingFee);
      setPreviewDiscount(discount);
    } else {
      setPreviewDiscount(null);
    }
  }, [selectedCouponId, cartItems, orderAmount, shippingFee, calculateDiscount]);

  // 모달 닫기
  const handleClose = () => {
    setSelectedCouponId(appliedCouponId || '');
    setSearchQuery('');
    setFilterType('all');
    setPreviewDiscount(null);
    onClose();
  };

  // 쿠폰 적용
  const handleApplyCoupon = () => {
    if (selectedCouponId && previewDiscount && previewDiscount.discount > 0) {
      onApplyCoupon(selectedCouponId, previewDiscount);
      onClose();
    }
  };

  // 쿠폰 제거
  const handleRemoveCoupon = () => {
    setSelectedCouponId('');
    onApplyCoupon(null, null);
    onClose();
  };

  // 쿠폰 선택
  const handleSelectCoupon = (couponId) => {
    if (selectedCouponId === couponId) {
      setSelectedCouponId('');
    } else {
      setSelectedCouponId(couponId);
    }
  };

  // 쿠폰 타입별 아이콘
  const getCouponIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Percent size={16} />;
      case 'shipping':
        return <Truck size={16} />;
      case 'fixed':
      default:
        return <Tag size={16} />;
    }
  };

  // 쿠폰 상태 확인
  const getCouponStatus = (coupon) => {
    const validation = validateCoupon(coupon.id, cartItems, orderAmount);
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    const daysUntilExpiry = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));

    if (!validation.isValid) {
      return { type: 'unavailable', message: validation.message };
    }
    
    if (daysUntilExpiry <= 3) {
      return { type: 'expiring', message: `${daysUntilExpiry}일 후 만료` };
    }
    
    return { type: 'available', message: '사용 가능' };
  };

  // 쿠폰 할인 표시 텍스트
  const getDiscountText = (coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% 할인`;
      case 'shipping':
        return '무료배송';
      case 'fixed':
        return `${coupon.value.toLocaleString()}원 할인`;
      default:
        return '할인';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="coupon-modal-overlay" onClick={handleClose}>
        <div className="coupon-modal" onClick={e => e.stopPropagation()}>
          
          {/* 모달 헤더 */}
          <div className="modal-header">
            <div className="header-content">
              <Gift size={24} />
              <div>
                <h2>쿠폰 선택</h2>
                <p>사용 가능한 쿠폰: {stats.available}개 | 전체: {stats.total}개</p>
              </div>
            </div>
            <button className="close-btn" onClick={handleClose}>
              <X size={24} />
            </button>
          </div>

          {/* 검색 및 필터 */}
          <div className="search-filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="쿠폰명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              <button 
                className={filterType === 'all' ? 'active' : ''}
                onClick={() => setFilterType('all')}
              >
                전체 ({(userCoupons || []).length})
              </button>
              <button 
                className={filterType === 'available' ? 'active' : ''}
                onClick={() => setFilterType('available')}
              >
                사용가능 ({(availableCoupons || []).length})
              </button>
              <button 
                className={filterType === 'expiring' ? 'active' : ''}
                onClick={() => setFilterType('expiring')}
              >
                곧 만료 ({(expiringSoonCoupons || []).length})
              </button>
            </div>
          </div>

          {/* 쿠폰 목록 */}
          <div className="coupon-list">
            {filteredCoupons.length === 0 ? (
              <div className="empty-state">
                <Gift size={48} />
                <p>
                  {searchQuery 
                    ? '검색 결과가 없습니다.'
                    : filterType === 'available'
                      ? '사용 가능한 쿠폰이 없습니다.'
                      : '쿠폰이 없습니다.'
                  }
                </p>
              </div>
            ) : (
              filteredCoupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                const isSelected = selectedCouponId === coupon.id;
                const isCurrentlyApplied = appliedCouponId === coupon.id;
                
                return (
                  <div 
                    key={coupon.userCouponId}
                    className={`coupon-item ${status.type} ${isSelected ? 'selected' : ''} ${isCurrentlyApplied ? 'applied' : ''}`}
                    onClick={() => status.type === 'available' && handleSelectCoupon(coupon.id)}
                  >
                    <div className="coupon-icon">
                      <span className="icon">{coupon.icon}</span>
                      {getCouponIcon(coupon.type)}
                    </div>
                    
                    <div className="coupon-content">
                      <div className="coupon-header">
                        <h3>{coupon.name}</h3>
                        <div className="coupon-value">
                          {getDiscountText(coupon)}
                        </div>
                      </div>
                      
                      <p className="coupon-description">{coupon.description}</p>
                      
                      <div className="coupon-details">
                        <span>최소 주문금액: {coupon.minOrderAmount.toLocaleString()}원</span>
                        {coupon.maxDiscountAmount && (
                          <span>최대 할인: {coupon.maxDiscountAmount.toLocaleString()}원</span>
                        )}
                        <span>남은 사용횟수: {coupon.remainingUses}회</span>
                      </div>
                      
                      <div className="coupon-footer">
                        <div className="expiry-date">
                          <Clock size={14} />
                          {new Date(coupon.validUntil).toLocaleDateString()} 까지
                        </div>
                        
                        <div className={`coupon-status ${status.type}`}>
                          {status.type === 'available' && <CheckCircle2 size={14} />}
                          {status.type === 'expiring' && <Clock size={14} />}
                          {status.type === 'unavailable' && <AlertCircle size={14} />}
                          {status.message}
                        </div>
                      </div>
                      
                      {(coupon.categoryRestrictions || []).length > 0 && (
                        <div className="category-restrictions">
                          <small>적용 카테고리: {(coupon.categoryRestrictions || []).join(', ')}</small>
                        </div>
                      )}
                    </div>
                    
                    {isSelected && status.type === 'available' && (
                      <div className="selection-indicator">
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                    
                    {isCurrentlyApplied && (
                      <div className="applied-indicator">
                        적용중
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 할인 미리보기 */}
          {previewDiscount && previewDiscount.discount > 0 && (
            <div className="discount-preview">
              <div className="preview-content">
                <h4>할인 미리보기</h4>
                <div className="preview-details">
                  <div className="preview-row">
                    <span>주문금액</span>
                    <span>{orderAmount.toLocaleString()}원</span>
                  </div>
                  <div className="preview-row discount">
                    <span>쿠폰할인</span>
                    <span>-{previewDiscount.discount.toLocaleString()}원</span>
                  </div>
                  <div className="preview-row total">
                    <span>할인 후 금액</span>
                    <span>{(orderAmount - previewDiscount.discount).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 모달 푸터 */}
          <div className="modal-footer">
            {appliedCouponId && (
              <button className="remove-btn" onClick={handleRemoveCoupon}>
                쿠폰 제거
              </button>
            )}
            
            <div className="action-buttons">
              <button className="cancel-btn" onClick={handleClose}>
                취소
              </button>
              <button 
                className="apply-btn"
                onClick={handleApplyCoupon}
                disabled={!selectedCouponId || !previewDiscount || previewDiscount.discount <= 0}
              >
                {selectedCouponId === appliedCouponId ? '변경' : '적용'}하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .coupon-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .coupon-modal {
          background: white;
          border-radius: 16px;
          width: 95%;
          max-width: 600px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #eee;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ff69b4;
        }

        .header-content h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 4px 0 0 0;
          font-size: 0.9rem;
          color: #666;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          color: #666;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f5f5f5;
          color: #333;
        }

        .search-filter-section {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .search-box {
          margin-bottom: 16px;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-box input:focus {
          border-color: #ff69b4;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tabs button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .filter-tabs button.active {
          background: #ff69b4;
          color: white;
          border-color: #ff69b4;
        }

        .filter-tabs button:hover:not(.active) {
          background: #f8f9fa;
        }

        .coupon-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 24px 24px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #999;
          text-align: center;
        }

        .empty-state p {
          margin: 16px 0 0 0;
          font-size: 1.1rem;
        }

        .coupon-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .coupon-item.available:hover {
          border-color: #ff69b4;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 105, 180, 0.15);
        }

        .coupon-item.selected {
          border-color: #ff69b4;
          background: #fff5f8;
        }

        .coupon-item.applied {
          border-color: #28a745;
          background: #f8fff9;
        }

        .coupon-item.unavailable {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .coupon-item.expiring {
          border-color: #ffc107;
          background: #fffbf0;
        }

        .coupon-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 60px;
        }

        .coupon-icon .icon {
          font-size: 2rem;
        }

        .coupon-content {
          flex: 1;
          min-width: 0;
        }

        .coupon-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .coupon-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .coupon-value {
          background: #ff69b4;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .coupon-description {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .coupon-details {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 0.8rem;
          color: #888;
        }

        .coupon-details span {
          background: #f8f9fa;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .coupon-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .expiry-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: #666;
        }

        .coupon-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .coupon-status.available {
          color: #28a745;
        }

        .coupon-status.expiring {
          color: #ffc107;
        }

        .coupon-status.unavailable {
          color: #dc3545;
        }

        .category-restrictions {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #f0f0f0;
        }

        .category-restrictions small {
          color: #888;
          font-size: 0.8rem;
        }

        .selection-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          color: #ff69b4;
        }

        .applied-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .discount-preview {
          padding: 20px 24px;
          background: #f8fffe;
          border-top: 1px solid #e0f7fa;
          border-bottom: 1px solid #e0f7fa;
        }

        .preview-content h4 {
          margin: 0 0 12px 0;
          color: #00695c;
          font-size: 1rem;
        }

        .preview-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preview-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .preview-row.discount {
          color: #ff1744;
          font-weight: 500;
        }

        .preview-row.total {
          padding-top: 8px;
          border-top: 1px solid #b2dfdb;
          font-weight: 600;
          color: #00695c;
          font-size: 1rem;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-top: 1px solid #eee;
        }

        .remove-btn {
          padding: 10px 20px;
          background: none;
          color: #dc3545;
          border: 1px solid #dc3545;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          background: #dc3545;
          color: white;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: #f8f9fa;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: #e9ecef;
        }

        .apply-btn {
          padding: 12px 32px;
          background: #ff69b4;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .apply-btn:hover:not(:disabled) {
          background: #ff1493;
          transform: translateY(-1px);
        }

        .apply-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .coupon-modal {
            margin: 10px;
            max-height: calc(100vh - 20px);
          }
          
          .modal-header {
            padding: 16px;
          }
          
          .search-filter-section,
          .coupon-list,
          .discount-preview,
          .modal-footer {
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .coupon-item {
            padding: 16px;
          }
          
          .coupon-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .coupon-details {
            flex-direction: column;
            gap: 4px;
          }
          
          .coupon-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .modal-footer {
            flex-direction: column;
            gap: 12px;
          }
          
          .action-buttons {
            width: 100%;
          }
          
          .cancel-btn,
          .apply-btn {
            flex: 1;
          }
        }
        
        @media (max-width: 480px) {
          .coupon-modal-overlay {
            padding: 0;
          }
          
          .coupon-modal {
            width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
};

export default CouponModal;