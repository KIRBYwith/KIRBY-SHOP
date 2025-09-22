// src/utils/helpers.js

import { 
  VALIDATION_PATTERNS, 
  DATE_FORMATS, 
  SHOPPING, 
  USER_GRADES,
  STORAGE_KEYS 
} from './constants';

// 💰 가격 관련 유틸리티
export const formatPrice = (price, showCurrency = true) => {
  if (typeof price !== 'number') return '0';
  const formatted = price.toLocaleString('ko-KR');
  return showCurrency ? `${formatted}원` : formatted;
};

export const calculateDiscountedPrice = (originalPrice, discountRate) => {
  if (!originalPrice || !discountRate) return originalPrice;
  return Math.floor(originalPrice * (1 - discountRate / 100));
};

export const calculateDiscountAmount = (originalPrice, discountRate) => {
  if (!originalPrice || !discountRate) return 0;
  return originalPrice - calculateDiscountedPrice(originalPrice, discountRate);
};

export const isEligibleForFreeShipping = (totalPrice) => {
  return totalPrice >= SHOPPING.freeShippingThreshold;
};

export const calculateShippingFee = (totalPrice) => {
  return isEligibleForFreeShipping(totalPrice) ? 0 : SHOPPING.shippingFee;
};

export const getFreeShippingRemaining = (totalPrice) => {
  const remaining = SHOPPING.freeShippingThreshold - totalPrice;
  return Math.max(0, remaining);
};

// 📅 날짜 관련 유틸리티
export const formatDate = (date, format = DATE_FORMATS.korean) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return formatDate(date, DATE_FORMATS.korean);
};

export const isToday = (date) => {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
};

export const isThisWeek = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < 7;
};

// 🔍 유효성 검사 유틸리티
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: '이메일을 입력해주세요.' };
  if (!VALIDATION_PATTERNS.email.test(email)) {
    return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  }
  return { isValid: true, message: '' };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: '비밀번호를 입력해주세요.' };
  if (password.length < 8) {
    return { isValid: false, message: '비밀번호는 8자 이상이어야 합니다.' };
  }
  if (!VALIDATION_PATTERNS.password.test(password)) {
    return { isValid: false, message: '비밀번호는 영문과 숫자를 포함해야 합니다.' };
  }
  return { isValid: true, message: '' };
};

export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, message: '휴대폰 번호를 입력해주세요.' };
  const cleanPhone = phone.replace(/-/g, '');
  if (!VALIDATION_PATTERNS.phone.test(cleanPhone)) {
    return { isValid: false, message: '올바른 휴대폰 번호 형식이 아닙니다.' };
  }
  return { isValid: true, message: '' };
};

export const validateName = (name) => {
  if (!name) return { isValid: false, message: '이름을 입력해주세요.' };
  if (name.length < 2) {
    return { isValid: false, message: '이름은 2자 이상이어야 합니다.' };
  }
  if (!VALIDATION_PATTERNS.name.test(name)) {
    return { isValid: false, message: '이름은 한글 또는 영문만 입력 가능합니다.' };
  }
  return { isValid: true, message: '' };
};

// 📱 디바이스 감지 유틸리티
export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  return window.innerWidth > 1024;
};

export const getTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// 🔤 문자열 유틸리티
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + suffix;
};

export const highlightText = (text, query) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const removeHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

// 📊 배열 유틸리티
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'desc') {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      
      if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
        return item[key] >= value.min && item[key] <= value.max;
      }
      
      return item[key] === value;
    });
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// 🎯 사용자 등급 유틸리티
export const getUserGrade = (totalPurchase) => {
  const grades = Object.values(USER_GRADES).reverse();
  
  for (const grade of grades) {
    if (totalPurchase >= grade.minPurchase) {
      return grade;
    }
  }
  
  return USER_GRADES.새회원;
};

export const getNextGrade = (currentGrade) => {
  const gradeNames = Object.keys(USER_GRADES);
  const currentIndex = gradeNames.indexOf(currentGrade);
  
  if (currentIndex === -1 || currentIndex === gradeNames.length - 1) {
    return null;
  }
  
  return USER_GRADES[gradeNames[currentIndex + 1]];
};

export const getGradeProgress = (totalPurchase, currentGrade) => {
  const nextGrade = getNextGrade(currentGrade);
  if (!nextGrade) return 100;
  
  const currentMin = USER_GRADES[currentGrade].minPurchase;
  const nextMin = nextGrade.minPurchase;
  const progress = ((totalPurchase - currentMin) / (nextMin - currentMin)) * 100;
  
  return Math.max(0, Math.min(100, progress));
};

// 🛒 장바구니 유틸리티
export const calculateCartSummary = (cartItems) => {
  const summary = cartItems.reduce((acc, item) => {
    const itemPrice = item.discount > 0 
      ? calculateDiscountedPrice(item.price, item.discount)
      : item.price;
    
    acc.totalQuantity += item.quantity;
    acc.subtotal += item.price * item.quantity;
    acc.totalPrice += itemPrice * item.quantity;
    
    return acc;
  }, {
    totalQuantity: 0,
    subtotal: 0,
    totalPrice: 0
  });

  summary.totalDiscount = summary.subtotal - summary.totalPrice;
  summary.shippingFee = calculateShippingFee(summary.totalPrice);
  summary.finalPrice = summary.totalPrice + summary.shippingFee;
  summary.freeShippingRemaining = getFreeShippingRemaining(summary.totalPrice);

  return summary;
};

export const validateCartItem = (item) => {
  const issues = [];
  
  if (item.stock <= 0) {
    issues.push({ type: 'outOfStock', message: '품절된 상품입니다.' });
  } else if (item.quantity > item.stock) {
    issues.push({ 
      type: 'stockShortage', 
      message: `재고가 부족합니다. (재고: ${item.stock}개)` 
    });
  }
  
  if (item.quantity > SHOPPING.maxCartQuantity) {
    issues.push({ 
      type: 'maxQuantity', 
      message: `최대 ${SHOPPING.maxCartQuantity}개까지만 주문 가능합니다.` 
    });
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// 💾 로컬 스토리지 유틸리티
export const setStorageItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('로컬 스토리지 저장 오류:', error);
    return false;
  }
};

export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('로컬 스토리지 읽기 오류:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('로컬 스토리지 삭제 오류:', error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('로컬 스토리지 초기화 오류:', error);
    return false;
  }
};

// 🔄 디바운스 & 스로틀 유틸리티
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 🎲 랜덤 유틸리티
export const generateRandomId = (length = 8) => {
  return Math.random().toString(36).substr(2, length);
};

export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 🎯 검색 유틸리티
export const searchProducts = (products, query, searchFields = ['title', 'description', 'tags']) => {
  if (!query) return products;
  
  const lowercaseQuery = query.toLowerCase();
  
  return products.filter(product => {
    return searchFields.some(field => {
      const value = product[field];
      
      if (Array.isArray(value)) {
        return value.some(item => 
          item.toLowerCase().includes(lowercaseQuery)
        );
      }
      
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseQuery);
      }
      
      return false;
    });
  });
};

export const highlightSearchResults = (text, query) => {
  if (!query || !text) return text;
  
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
};

// 🔢 수학 유틸리티
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const roundToDecimals = (value, decimals = 2) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const percentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// 🎁 커비숍 전용 유틸리티
export const generateCouponCode = (prefix = 'KIRBY') => {
  const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `${prefix}${randomPart}`;
};

export const getKirbyEmoji = () => {
  const emojis = ['🌟', '💖', '✨', '🎀', '🌸', '💫', '🎁', '🦄', '🌈', '🍰'];
  return getRandomItem(emojis);
};

export const createKirbyMessage = (message) => {
  return `${getKirbyEmoji()} ${message} ${getKirbyEmoji()}`;
};

export const getSeasonalTheme = () => {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

export const isSpecialDay = () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  
  const specialDays = {
    '1-1': '신정',
    '2-14': '발렌타인데이',
    '3-14': '화이트데이',
    '5-5': '어린이날',
    '5-8': '어버이날',
    '12-25': '크리스마스'
  };
  
  const key = `${month}-${date}`;
  return specialDays[key] || null;
};

// 내보내기
export default {
  formatPrice,
  calculateDiscountedPrice,
  calculateDiscountAmount,
  isEligibleForFreeShipping,
  calculateShippingFee,
  getFreeShippingRemaining,
  formatDate,
  getRelativeTime,
  isToday,
  isThisWeek,
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  isMobile,
  isTablet,
  isDesktop,
  getTouchDevice,
  truncateText,
  highlightText,
  slugify,
  capitalizeFirst,
  removeHtmlTags,
  groupBy,
  sortBy,
  filterBy,
  uniqueBy,
  chunk,
  getUserGrade,
  getNextGrade,
  getGradeProgress,
  calculateCartSummary,
  validateCartItem,
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  debounce,
  throttle,
  generateRandomId,
  getRandomItem,
  shuffleArray,
  searchProducts,
  highlightSearchResults,
  clamp,
  roundToDecimals,
  percentage,
  generateCouponCode,
  getKirbyEmoji,
  createKirbyMessage,
  getSeasonalTheme,
  isSpecialDay
};