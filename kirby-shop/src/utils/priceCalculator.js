// src/utils/priceCalculator.js - 통일된 금액 계산 유틸리티

import { SHOPPING } from './constants';

/**
 * 주소에서 지역 추출
 * @param {string} address - 전체 주소
 * @returns {string} 지역명
 */
export const extractRegionFromAddress = (address) => {
  if (!address || typeof address !== 'string') return '기타';
  
  const addressStr = address.trim();
  
  // 주요 지역 매핑
  const regionMap = {
    '서울': ['서울', '서울시', '서울특별시'],
    '경기': ['경기', '경기도', '수원', '성남', '의정부', '안양', '부천', '광명', '평택', '과천', '오산', '시흥', '군포', '의왕', '하남', '용인', '파주', '이천', '안성', '김포', '화성', '광주', '여주', '양평', '동두천', '가평', '연천'],
    '인천': ['인천', '인천시', '인천광역시'],
    '부산': ['부산', '부산시', '부산광역시'],
    '대구': ['대구', '대구시', '대구광역시'],
    '광주': ['광주', '광주시', '광주광역시'],
    '대전': ['대전', '대전시', '대전광역시'],
    '울산': ['울산', '울산시', '울산광역시'],
    '세종': ['세종', '세종시', '세종특별자치시'],
    '강원': ['강원', '강원도', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'],
    '충북': ['충북', '충청북도', '청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양'],
    '충남': ['충남', '충청남도', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안'],
    '전북': ['전북', '전라북도', '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안'],
    '전남': ['전남', '전라남도', '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'],
    '경북': ['경북', '경상북도', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉'],
    '경남': ['경남', '경상남도', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천'],
    '제주': ['제주', '제주도', '제주특별자치도', '제주시', '서귀포']
  };
  
  // 지역 매핑에서 찾기
  for (const [region, keywords] of Object.entries(regionMap)) {
    for (const keyword of keywords) {
      if (addressStr.includes(keyword)) {
        return region;
      }
    }
  }
  
  return '기타';
};

/**
 * 지역별 배송비 계산
 * @param {string} address - 배송지 주소
 * @param {number} totalPrice - 상품 총액
 * @param {number} freeShippingThreshold - 무료배송 기준액
 * @returns {Object} 배송비 정보
 */
export const calculateRegionalShippingFee = (address, totalPrice, freeShippingThreshold = SHOPPING.freeShippingThreshold) => {
  const region = extractRegionFromAddress(address);
  const baseShippingFee = SHOPPING.shippingFees[region] || SHOPPING.shippingFees['기타'];
  
  const needShippingFee = totalPrice < freeShippingThreshold;
  const finalShippingFee = needShippingFee ? baseShippingFee : 0;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - totalPrice);

  return {
    region,
    baseShippingFee,
    shippingFee: finalShippingFee,
    needShippingFee,
    freeShippingRemaining,
    freeShippingThreshold
  };
};

/**
 * 상품 가격 계산 (할인 적용)
 * @param {number} price - 원가
 * @param {number} discount - 할인율 (0-100)
 * @returns {number} 할인된 가격
 */
export const calculateItemPrice = (price, discount = 0) => {
  const basePrice = Number(price) || 0;
  const discountRate = Number(discount) || 0;
  
  if (discountRate > 0) {
    return Math.round(basePrice * (1 - discountRate / 100));
  }
  return basePrice;
};

/**
 * 장바구니 아이템 총액 계산
 * @param {Array} cartItems - 장바구니 아이템 배열
 * @returns {Object} 계산된 금액 정보
 */
export const calculateCartTotal = (cartItems = []) => {
  let totalQuantity = 0;
  let totalPrice = 0;
  let originalTotalPrice = 0;
  let totalDiscount = 0;

  cartItems.forEach(item => {
    if (!item) return;
    
    const quantity = Number(item.quantity) || 1;
    const basePrice = Number(item.price) || 0;
    const discountRate = Number(item.discount) || 0;
    
    const itemPrice = calculateItemPrice(basePrice, discountRate);
    const itemOriginalPrice = basePrice;
    
    totalQuantity += quantity;
    totalPrice += itemPrice * quantity;
    originalTotalPrice += itemOriginalPrice * quantity;
    totalDiscount += (itemOriginalPrice - itemPrice) * quantity;
  });

  return {
    totalQuantity,
    totalPrice,
    originalTotalPrice,
    totalDiscount
  };
};

/**
 * 배송비 계산 (기본 - 지역 정보 없음)
 * @param {number} totalPrice - 상품 총액
 * @param {number} freeShippingThreshold - 무료배송 기준액 (기본 30000원)
 * @param {number} shippingFee - 기본 배송비 (기본 3000원)
 * @returns {Object} 배송비 정보
 */
export const calculateShippingFee = (totalPrice, freeShippingThreshold = SHOPPING.freeShippingThreshold, shippingFee = SHOPPING.shippingFee) => {
  const needShippingFee = totalPrice < freeShippingThreshold;
  const finalShippingFee = needShippingFee ? shippingFee : 0;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - totalPrice);

  return {
    region: '기본',
    baseShippingFee: shippingFee,
    shippingFee: finalShippingFee,
    needShippingFee,
    freeShippingRemaining,
    freeShippingThreshold
  };
};

/**
 * 쿠폰 할인 계산
 * @param {Object} coupon - 쿠폰 정보
 * @param {number} totalPrice - 상품 총액
 * @returns {number} 쿠폰 할인 금액
 */
export const calculateCouponDiscount = (coupon, totalPrice) => {
  if (!coupon || !coupon.discountInfo) return 0;
  
  const discountInfo = coupon.discountInfo;
  const discountType = discountInfo.type; // 'percentage' 또는 'fixed'
  const discountValue = Number(discountInfo.discount) || 0;
  
  if (discountType === 'percentage') {
    return Math.round(totalPrice * (discountValue / 100));
  } else if (discountType === 'fixed') {
    return Math.min(discountValue, totalPrice);
  }
  
  return 0;
};

/**
 * 최종 결제 금액 계산 (지역별 배송비 적용)
 * @param {Array} cartItems - 장바구니 아이템
 * @param {Object} coupon - 적용된 쿠폰
 * @param {Object} options - 옵션 (배송지 주소, 배송비 기준액 등)
 * @returns {Object} 최종 계산된 금액 정보
 */
export const calculateFinalPrice = (cartItems = [], coupon = null, options = {}) => {
  const {
    shippingAddress = null,
    freeShippingThreshold = SHOPPING.freeShippingThreshold
  } = options;

  // 상품 총액 계산
  const cartTotal = calculateCartTotal(cartItems);
  
  // 지역별 배송비 계산
  const shippingInfo = shippingAddress 
    ? calculateRegionalShippingFee(shippingAddress, cartTotal.totalPrice, freeShippingThreshold)
    : calculateShippingFee(cartTotal.totalPrice, freeShippingThreshold);
  
  // 쿠폰 할인 계산
  const couponDiscount = calculateCouponDiscount(coupon, cartTotal.totalPrice);
  
  // 최종 결제 금액
  const finalPrice = cartTotal.totalPrice + shippingInfo.shippingFee - couponDiscount;
  
  return {
    // 상품 정보
    ...cartTotal,
    
    // 배송비 정보
    ...shippingInfo,
    
    // 쿠폰 정보
    couponDiscount,
    
    // 최종 금액
    finalPrice: Math.max(0, finalPrice),
    
    // 요약 정보
    summary: {
      subtotal: cartTotal.totalPrice,
      shippingFee: shippingInfo.shippingFee,
      couponDiscount,
      total: finalPrice
    }
  };
};

/**
 * 금액 포맷팅
 * @param {number} amount - 금액
 * @returns {string} 포맷된 금액 문자열
 */
export const formatPrice = (amount) => {
  return `${Number(amount || 0).toLocaleString()}원`;
};

/**
 * 주문 데이터에서 금액 계산
 * @param {Object} orderData - 주문 데이터
 * @returns {Object} 계산된 금액 정보
 */
export const calculateOrderPrice = (orderData) => {
  if (!orderData || !orderData.items) {
    return calculateFinalPrice([]);
  }
  
  return calculateFinalPrice(orderData.items, orderData.coupon);
};
