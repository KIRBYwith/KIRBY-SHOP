// src/hooks/useCoupon.js

import { useState, useEffect, useCallback } from 'react';

// 쿠폰 타입 정의
export const COUPON_TYPES = {
  PERCENTAGE: 'percentage', // 퍼센트 할인
  FIXED: 'fixed',          // 정액 할인
  SHIPPING: 'shipping',    // 배송비 할인
  BUNDLE: 'bundle'         // 묶음 구매 할인
};

// 기본 쿠폰 데이터
const defaultCoupons = [
  {
    id: 'WELCOME20',
    name: '신규회원 20% 할인쿠폰',
    description: '신규회원 가입 축하! 전 상품 20% 할인',
    type: COUPON_TYPES.PERCENTAGE,
    value: 20,
    minOrderAmount: 10000,
    maxDiscountAmount: 50000,
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    isActive: true,
    usageLimit: 1,
    categoryRestrictions: [], // 빈 배열이면 모든 카테고리
    productRestrictions: [], // 빈 배열이면 모든 상품
    newMemberOnly: true,
    icon: '🎁'
  },
  {
    id: 'FREESHIP',
    name: '무료배송 쿠폰',
    description: '배송비 무료! 언제든지 사용 가능',
    type: COUPON_TYPES.SHIPPING,
    value: 3000,
    minOrderAmount: 20000,
    maxDiscountAmount: 3000,
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    isActive: true,
    usageLimit: 10,
    categoryRestrictions: [],
    productRestrictions: [],
    newMemberOnly: false,
    icon: '🚚'
  },
  {
    id: 'FIXED5000',
    name: '5천원 할인쿠폰',
    description: '5만원 이상 구매시 5천원 할인',
    type: COUPON_TYPES.FIXED,
    value: 5000,
    minOrderAmount: 50000,
    maxDiscountAmount: 5000,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    usageLimit: 3,
    categoryRestrictions: [],
    productRestrictions: [],
    newMemberOnly: false,
    icon: '💰'
  },
  {
    id: 'PLUSH30',
    name: '인형 카테고리 30% 할인',
    description: '커비 인형 카테고리 상품 30% 할인',
    type: COUPON_TYPES.PERCENTAGE,
    value: 30,
    minOrderAmount: 15000,
    maxDiscountAmount: 30000,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    usageLimit: 2,
    categoryRestrictions: ['인형/피규어'],
    productRestrictions: [],
    newMemberOnly: false,
    icon: '🧸'
  },
  {
    id: 'BIRTHDAY50',
    name: '생일축하 50% 할인',
    description: '생일축하합니다! 특별한 하루를 위한 할인',
    type: COUPON_TYPES.PERCENTAGE,
    value: 50,
    minOrderAmount: 30000,
    maxDiscountAmount: 100000,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    usageLimit: 1,
    categoryRestrictions: [],
    productRestrictions: [],
    newMemberOnly: false,
    icon: '🎂'
  }
];

export const useCoupon = (user) => {
  const [userCoupons, setUserCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const COUPON_STORAGE_KEY = user && user.id 
    ? `kirby-shop-coupons-${user.id}` 
    : 'kirby-shop-guest-coupons';

  // 사용자 쿠폰 로드
  useEffect(() => {
    try {
      const savedCoupons = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupons) {
        setUserCoupons(JSON.parse(savedCoupons));
      } else if (user && user.id) {
        // 신규 회원에게 기본 쿠폰 지급
        const welcomeCoupons = defaultCoupons.filter(coupon => 
          coupon.newMemberOnly || coupon.id === 'FREESHIP'
        ).map(coupon => ({
          ...coupon,
          userCouponId: `${coupon.id}-${Date.now()}`,
          acquiredAt: new Date().toISOString(),
          remainingUses: coupon.usageLimit,
          isUsed: false
        }));
        setUserCoupons(welcomeCoupons);
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(welcomeCoupons));
      }
    } catch (error) {
      console.error('쿠폰 데이터 로드 오류:', error);
      setUserCoupons([]);
    }
  }, [user, COUPON_STORAGE_KEY]);

  // 쿠폰 저장
  const saveCoupons = useCallback((coupons) => {
    try {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupons));
    } catch (error) {
      console.error('쿠폰 데이터 저장 오류:', error);
    }
  }, [COUPON_STORAGE_KEY]);

  // 쿠폰 발급
  const issueCoupon = useCallback((couponId) => {
    const baseCoupon = defaultCoupons.find(c => c.id === couponId);
    if (!baseCoupon) return { success: false, message: '존재하지 않는 쿠폰입니다.' };

    const userCoupon = {
      ...baseCoupon,
      userCouponId: `${couponId}-${Date.now()}`,
      acquiredAt: new Date().toISOString(),
      remainingUses: baseCoupon.usageLimit,
      isUsed: false
    };

    setUserCoupons(prev => {
      const newCoupons = [...prev, userCoupon];
      saveCoupons(newCoupons);
      return newCoupons;
    });

    return { success: true, message: `${baseCoupon.name}이 발급되었습니다!` };
  }, [saveCoupons]);

  // 쿠폰 적용 가능 여부 확인
  const validateCoupon = useCallback((couponId, cartItems = [], orderAmount = 0) => {
    const userCoupon = userCoupons.find(c => c.id === couponId);
    if (!userCoupon) {
      return { isValid: false, message: '보유하지 않은 쿠폰입니다.' };
    }

    if (!userCoupon.isActive) {
      return { isValid: false, message: '사용할 수 없는 쿠폰입니다.' };
    }

    if (userCoupon.remainingUses <= 0) {
      return { isValid: false, message: '사용 횟수가 모두 소진된 쿠폰입니다.' };
    }

    // 유효기간 확인
    const now = new Date();
    const validFrom = new Date(userCoupon.validFrom);
    const validUntil = new Date(userCoupon.validUntil);
    
    if (now < validFrom || now > validUntil) {
      return { isValid: false, message: '유효기간이 지난 쿠폰입니다.' };
    }

    // 최소 주문금액 확인
    if (orderAmount < userCoupon.minOrderAmount) {
      return { 
        isValid: false, 
        message: `${userCoupon.minOrderAmount.toLocaleString()}원 이상 구매시 사용 가능합니다.` 
      };
    }

    // 카테고리 제한 확인
    if (userCoupon.categoryRestrictions.length > 0) {
      const hasValidCategory = cartItems.some(item => item &&
        userCoupon.categoryRestrictions.includes(item.category)
      );
      if (!hasValidCategory) {
        return { 
          isValid: false, 
          message: `${userCoupon.categoryRestrictions.join(', ')} 카테고리 상품만 사용 가능합니다.` 
        };
      }
    }

    // 상품 제한 확인
    if (userCoupon.productRestrictions.length > 0) {
      const hasValidProduct = cartItems.some(item => item &&
        userCoupon.productRestrictions.includes(item.id)
      );
      if (!hasValidProduct) {
        return { 
          isValid: false, 
          message: '특정 상품에만 사용 가능한 쿠폰입니다.' 
        };
      }
    }

    return { isValid: true, message: '사용 가능한 쿠폰입니다.' };
  }, [userCoupons]);

  // 쿠폰 할인 금액 계산
  const calculateDiscount = useCallback((couponId, cartItems = [], orderAmount = 0, shippingFee = 0) => {
    const validation = validateCoupon(couponId, cartItems, orderAmount);
    if (!validation.isValid) {
      return { discount: 0, message: validation.message };
    }

    const coupon = userCoupons.find(c => c.id === couponId);
    let discount = 0;

    switch (coupon.type) {
      case COUPON_TYPES.PERCENTAGE:
        // 카테고리 제한이 있는 경우 해당 카테고리 상품만 할인
        if (coupon.categoryRestrictions.length > 0) {
          const categoryAmount = cartItems
            .filter(item => item && coupon.categoryRestrictions.includes(item.category))
            .reduce((sum, item) => {
              const basePrice = Number(item?.price) || 0;
              const percent = Number(item?.discount) || 0;
              const qty = Number(item?.quantity) || 1;
              const itemPrice = percent > 0 
                ? basePrice * (1 - percent / 100)
                : basePrice;
              return sum + (itemPrice * qty);
            }, 0);
          discount = categoryAmount * (coupon.value / 100);
        } else {
          discount = orderAmount * (coupon.value / 100);
        }
        break;

      case COUPON_TYPES.FIXED:
        discount = coupon.value;
        break;

      case COUPON_TYPES.SHIPPING:
        discount = Math.min(coupon.value, shippingFee);
        break;

      case COUPON_TYPES.BUNDLE:
        // 묶음 구매 할인 로직 (필요시 구현)
        discount = coupon.value;
        break;

      default:
        discount = 0;
    }

    // 최대 할인 금액 제한
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }

    // 주문 금액을 초과할 수 없음
    if (coupon.type !== COUPON_TYPES.SHIPPING) {
      discount = Math.min(discount, orderAmount);
    }

    return { 
      discount: Math.floor(discount), 
      message: `${discount.toLocaleString()}원 할인이 적용됩니다.`,
      appliedCoupon: coupon
    };
  }, [userCoupons, validateCoupon]);

  // 쿠폰 사용
  const useCoupon = useCallback((couponId) => {
    setUserCoupons(prev => {
      const newCoupons = prev.map(coupon => {
        if (coupon.id === couponId) {
          return {
            ...coupon,
            remainingUses: coupon.remainingUses - 1,
            lastUsedAt: new Date().toISOString(),
            isUsed: coupon.remainingUses - 1 <= 0
          };
        }
        return coupon;
      });
      saveCoupons(newCoupons);
      return newCoupons;
    });
  }, [saveCoupons]);

  // 사용 가능한 쿠폰 목록
  const getAvailableCoupons = useCallback((cartItems = [], orderAmount = 0) => {
    return userCoupons.filter(coupon => {
      const validation = validateCoupon(coupon.id, cartItems, orderAmount);
      return validation.isValid;
    });
  }, [userCoupons, validateCoupon]);

  // 만료 임박 쿠폰 목록
  const getExpiringSoonCoupons = useCallback((days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return userCoupons.filter(coupon => {
      const validUntil = new Date(coupon.validUntil);
      return validUntil <= cutoffDate && validUntil > new Date() && !coupon.isUsed;
    });
  }, [userCoupons]);

  // 쿠폰 통계
  const getCouponStats = useCallback(() => {
    const total = userCoupons.length;
    const available = userCoupons.filter(c => !c.isUsed && c.remainingUses > 0).length;
    const used = userCoupons.filter(c => c.isUsed).length;
    const expired = userCoupons.filter(c => {
      const validUntil = new Date(c.validUntil);
      return validUntil < new Date() && !c.isUsed;
    }).length;

    return { total, available, used, expired };
  }, [userCoupons]);

  // 특별 쿠폰 발급 (생일, 이벤트 등)
  const issueSpecialCoupon = useCallback((type) => {
    let couponId;
    
    switch (type) {
      case 'birthday':
        couponId = 'BIRTHDAY50';
        break;
      case 'firstPurchase':
        couponId = 'WELCOME20';
        break;
      case 'loyalty':
        couponId = 'FIXED5000';
        break;
      default:
        return { success: false, message: '알 수 없는 쿠폰 타입입니다.' };
    }

    return issueCoupon(couponId);
  }, [issueCoupon]);

  return {
    userCoupons,
    isLoading,
    issueCoupon,
    validateCoupon,
    calculateDiscount,
    useCoupon,
    getAvailableCoupons,
    getExpiringSoonCoupons,
    getCouponStats,
    issueSpecialCoupon,
    defaultCoupons // 관리자용 또는 디버깅용
  };
};