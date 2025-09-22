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

  // 쿠폰 목록 새로고침 함수
  const refreshCoupons = useCallback(async () => {
    const loadUserCoupons = async () => {
      if (!user || !user.id) {
        setUserCoupons([]);
        return;
      }

      try {
        // 백엔드에서 사용자 쿠폰 조회
        const token = localStorage.getItem('kirby-shop-token') || 
                     localStorage.getItem('token') || 
                     localStorage.getItem('access_token');
        
        // 토큰 없이도 쿠폰 목록 조회 가능하도록 수정
        const response = await fetch('http://localhost:8000/api/coupons/my-coupons', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
          
        if (response.ok) {
          const userCouponsData = await response.json();
          // 백엔드 데이터를 프론트엔드 형식으로 변환
          const formattedCoupons = userCouponsData.map(userCoupon => ({
            id: userCoupon.coupon.code,
            name: userCoupon.coupon.name,
            description: userCoupon.coupon.description,
            type: userCoupon.coupon.discount_type,
            value: userCoupon.coupon.discount_value,
            minOrderAmount: userCoupon.coupon.min_order_amount || 0,
            maxDiscountAmount: userCoupon.coupon.max_discount_amount || 0,
            validFrom: userCoupon.coupon.valid_from,
            validUntil: userCoupon.coupon.valid_until,
            isActive: userCoupon.coupon.is_active,
            usageLimit: userCoupon.coupon.usage_limit || 1,
            isUsed: userCoupon.is_used,
            userCouponId: userCoupon.id,
            acquiredAt: userCoupon.obtained_at,
            remainingUses: userCoupon.coupon.usage_limit || 1,
            icon: '🎫'
          }));
          
          setUserCoupons(formattedCoupons);
          localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(formattedCoupons));
          return;
        }
      } catch (error) {
        console.error('쿠폰 목록 로드 오류:', error);
      }
      
      // 백엔드 조회 실패 시 로컬 스토리지에서 로드
      const savedCoupons = localStorage.getItem(COUPON_STORAGE_KEY);
      let existingCoupons = savedCoupons ? JSON.parse(savedCoupons) : [];
      
      // 등록된 쿠폰 로드 (CouponBoxPage에서 등록한 쿠폰들)
      const registeredCoupons = JSON.parse(localStorage.getItem('kirby-shop-user-coupons') || '[]');
      
      // 두 쿠폰 목록을 합치고 중복 제거
      const allCoupons = [...existingCoupons];
      registeredCoupons.forEach(regCoupon => {
        const exists = allCoupons.find(c => c.id === regCoupon.id);
        if (!exists) {
          allCoupons.push({
            ...regCoupon,
            userCouponId: `${regCoupon.id}-${Date.now()}`,
            acquiredAt: regCoupon.obtainedAt || new Date().toISOString(),
            remainingUses: regCoupon.usageLimit || 1,
            isUsed: regCoupon.isUsed || false
          });
        }
      });
      
      if (allCoupons.length > 0) {
        setUserCoupons(allCoupons);
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(allCoupons));
      } else {
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
    };

    await loadUserCoupons();
  }, [user, COUPON_STORAGE_KEY]);

  // 사용자 쿠폰 로드
  useEffect(() => {
    refreshCoupons();
  }, [refreshCoupons]);

  // 쿠폰 저장
  const saveCoupons = useCallback((coupons) => {
    try {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupons));
    } catch (error) {
      console.error('쿠폰 데이터 저장 오류:', error);
    }
  }, [COUPON_STORAGE_KEY]);

  // 쿠폰 발급
  const issueCoupon = useCallback((couponData) => {
    let userCoupon;
    
    // 쿠폰 데이터가 객체인 경우 (등록된 쿠폰)
    if (typeof couponData === 'object') {
      userCoupon = {
        ...couponData,
        userCouponId: `${couponData.id}-${Date.now()}`,
        acquiredAt: couponData.obtainedAt || new Date().toISOString(),
        remainingUses: couponData.usageLimit || 1,
        isUsed: false,
        minOrderAmount: couponData.minAmount || couponData.minOrderAmount || 0,
        maxDiscountAmount: couponData.maxDiscount || couponData.maxDiscountAmount || 0
      };
    } else {
      // 쿠폰 ID인 경우 (기본 쿠폰)
      const baseCoupon = defaultCoupons.find(c => c.id === couponData);
      if (!baseCoupon) return { success: false, message: '존재하지 않는 쿠폰입니다.' };

      userCoupon = {
        ...baseCoupon,
        userCouponId: `${couponData}-${Date.now()}`,
        acquiredAt: new Date().toISOString(),
        remainingUses: baseCoupon.usageLimit,
        isUsed: false
      };
    }

    setUserCoupons(prev => {
      // 중복 체크
      const exists = prev.find(c => c.id === userCoupon.id);
      if (exists) {
        return prev; // 이미 존재하는 쿠폰은 추가하지 않음
      }
      
      const newCoupons = [...prev, userCoupon];
      saveCoupons(newCoupons);
      return newCoupons;
    });

    return { success: true, message: `${userCoupon.name}이 발급되었습니다!` };
  }, [saveCoupons]);

  // 쿠폰 적용 가능 여부 확인
  const validateCoupon = useCallback((couponId, cartItems = [], orderAmount = 0) => {
    const userCoupon = (userCoupons || []).find(c => c.id === couponId);
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
    if ((userCoupon.categoryRestrictions || []).length > 0) {
      const hasValidCategory = cartItems.some(item => item &&
        (userCoupon.categoryRestrictions || []).includes(item.category)
      );
      if (!hasValidCategory) {
        return { 
          isValid: false, 
          message: `${(userCoupon.categoryRestrictions || []).join(', ')} 카테고리 상품만 사용 가능합니다.` 
        };
      }
    }

    // 상품 제한 확인
    if ((userCoupon.productRestrictions || []).length > 0) {
      const hasValidProduct = cartItems.some(item => item &&
        (userCoupon.productRestrictions || []).includes(item.id)
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

    const coupon = (userCoupons || []).find(c => c.id === couponId);
    let discount = 0;

    switch (coupon.type) {
      case COUPON_TYPES.PERCENTAGE:
        // 카테고리 제한이 있는 경우 해당 카테고리 상품만 할인
        if ((coupon.categoryRestrictions || []).length > 0) {
          const categoryAmount = cartItems
            .filter(item => item && (coupon.categoryRestrictions || []).includes(item.category))
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
    return (userCoupons || []).filter(coupon => {
      const validation = validateCoupon(coupon.id, cartItems, orderAmount);
      return validation.isValid;
    });
  }, [userCoupons, validateCoupon]);

  // 만료 임박 쿠폰 목록
  const getExpiringSoonCoupons = useCallback((days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return (userCoupons || []).filter(coupon => {
      const validUntil = new Date(coupon.validUntil);
      return validUntil <= cutoffDate && validUntil > new Date() && !coupon.isUsed;
    });
  }, [userCoupons]);

  // 쿠폰 통계
  const getCouponStats = useCallback(() => {
    const coupons = userCoupons || [];
    const total = coupons.length;
    const available = coupons.filter(c => !c.isUsed && c.remainingUses > 0).length;
    const used = coupons.filter(c => c.isUsed).length;
    const expired = coupons.filter(c => {
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
    refreshCoupons, // 쿠폰 목록 새로고침 함수
    defaultCoupons // 관리자용 또는 디버깅용
  };
};