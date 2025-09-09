// src/utils/constants.js

// 🎨 커비숍 테마 색상
export const COLORS = {
  primary: '#ff69b4',        // 메인 핑크
  secondary: '#ffb6c1',      // 연한 핑크
  accent: '#ff1493',         // 진한 핑크
  warning: '#ff4500',        // 주황
  success: '#32cd32',        // 초록
  info: '#1e90ff',          // 파랑
  
  // 파스텔 컬러
  pastel: {
    pink: '#ffc0cb',
    lavender: '#e6e6fa',
    mint: '#f0fff0',
    peach: '#ffdbac',
    yellow: '#fffacd'
  },
  
  // 그라데이션
  gradients: {
    primary: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
    secondary: 'linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%)',
    sunset: 'linear-gradient(135deg, #ffeef8 0%, #f8f4ff 100%)',
    rainbow: 'linear-gradient(45deg, #ff69b4, #ffb6c1, #e6e6fa, #f0fff0)'
  },
  
  // 상태별 색상
  status: {
    new: '#ff69b4',
    best: '#ffd700',
    hot: '#ff4500',
    discount: '#ff1493',
    outOfStock: '#808080'
  }
};

// 📱 반응형 브레이크포인트
export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1440px'
};

// 🛒 쇼핑 관련 상수
export const SHOPPING = {
  // 배송비 정책
  freeShippingThreshold: 30000,
  shippingFee: 3000,
  
  // 할인 정책
  maxDiscountRate: 70,
  minDiscountRate: 5,
  
  // 재고 관련
  lowStockThreshold: 5,
  outOfStockThreshold: 0,
  maxCartQuantity: 99,
  
  // 가격 범위
  priceRanges: [
    { label: '1만원 미만', min: 0, max: 9999 },
    { label: '1만원 ~ 3만원', min: 10000, max: 29999 },
    { label: '3만원 ~ 5만원', min: 30000, max: 49999 },
    { label: '5만원 ~ 10만원', min: 50000, max: 99999 },
    { label: '10만원 이상', min: 100000, max: Infinity }
  ]
};

// 👤 사용자 등급 시스템
export const USER_GRADES = {
  새회원: {
    name: '새회원',
    icon: '🌱',
    discountRate: 0,
    pointRate: 1,
    benefits: ['신규 회원 특가', '생일 쿠폰'],
    minPurchase: 0,
    color: '#98fb98'
  },
  일반회원: {
    name: '일반회원',
    icon: '⭐',
    discountRate: 2,
    pointRate: 1.2,
    benefits: ['기본 혜택', '멤버십 할인'],
    minPurchase: 50000,
    color: '#87ceeb'
  },
  우수회원: {
    name: '우수회원',
    icon: '💎',
    discountRate: 5,
    pointRate: 1.5,
    benefits: ['우수 회원 특가', '무료 포장', '우선 배송'],
    minPurchase: 200000,
    color: '#dda0dd'
  },
  VIP회원: {
    name: 'VIP회원',
    icon: '👑',
    discountRate: 10,
    pointRate: 2,
    benefits: ['VIP 전용 이벤트', '개인 맞춤 서비스', '전 상품 무료배송'],
    minPurchase: 500000,
    color: '#ffd700'
  },
  VVIP회원: {
    name: 'VVIP회원',
    icon: '💖',
    discountRate: 15,
    pointRate: 3,
    benefits: ['VVIP 프리미엄 혜택', '전담 상담사', '한정판 우선 구매'],
    minPurchase: 1000000,
    color: '#ff69b4'
  }
};

// 📄 페이지당 아이템 수
export const PAGINATION = {
  products: {
    grid: 12,
    list: 10
  },
  reviews: 5,
  orders: 10,
  wishlist: 20
};

// 🔍 정렬 옵션
export const SORT_OPTIONS = [
  { value: 'default', label: '추천순', icon: '⭐' },
  { value: 'newest', label: '신상품순', icon: '🆕' },
  { value: 'price-low', label: '가격 낮은순', icon: '💰' },
  { value: 'price-high', label: '가격 높은순', icon: '💸' },
  { value: 'rating', label: '평점순', icon: '⭐' },
  { value: 'reviews', label: '리뷰 많은순', icon: '💬' },
  { value: 'discount', label: '할인율순', icon: '🏷️' },
  { value: 'name', label: '이름순', icon: '🔤' }
];

// 🏷️ 상품 태그
export const PRODUCT_TAGS = {
  style: ['귀여운', '깜찍한', '러블리', '파스텔', '빈티지', '모던'],
  occasion: ['일상', '선물', '파티', '데이트', '여행', '휴가'],
  material: ['면', '폴리에스터', '실리콘', '세라믹', '플라스틱', '금속'],
  feature: ['방수', '세탁가능', '전자레인지가능', '친환경', '수제', '한정판']
};

// 📱 소셜 로그인 제공자
export const SOCIAL_PROVIDERS = {
  google: {
    name: 'Google',
    icon: '🔍',
    color: '#4285f4',
    backgroundColor: '#ffffff'
  },
  kakao: {
    name: 'Kakao',
    icon: '💬',
    color: '#000000',
    backgroundColor: '#fee500'
  },
  naver: {
    name: 'Naver',
    icon: '🟢',
    color: '#ffffff',
    backgroundColor: '#03c75a'
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#ffffff',
    backgroundColor: '#1877f2'
  },
  apple: {
    name: 'Apple',
    icon: '🍎',
    color: '#ffffff',
    backgroundColor: '#000000'
  }
};

// 🎯 애니메이션 지속시간
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  veryFast: 100,
  verySlow: 800
};

// 📊 차트 색상
export const CHART_COLORS = [
  '#ff69b4', '#ffb6c1', '#e6e6fa', '#f0fff0', 
  '#ffdbac', '#fffacd', '#ffc0cb', '#dda0dd'
];

// 🌐 API 엔드포인트 (실제 개발 시 사용)
export const API_ENDPOINTS = {
  base: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    social: '/auth/social'
  },
  products: {
    list: '/products',
    detail: '/products/:id',
    search: '/products/search',
    categories: '/products/categories'
  },
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear'
  },
  wishlist: {
    get: '/wishlist',
    add: '/wishlist/add',
    remove: '/wishlist/remove'
  },
  orders: {
    create: '/orders',
    list: '/orders',
    detail: '/orders/:id',
    cancel: '/orders/:id/cancel'
  },
  user: {
    profile: '/user/profile',
    update: '/user/update',
    delete: '/user/delete',
    points: '/user/points'
  }
};

// 🚨 에러 메시지
export const ERROR_MESSAGES = {
  network: '네트워크 연결을 확인해주세요.',
  server: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  auth: '인증에 실패했습니다. 다시 로그인해주세요.',
  validation: '입력 정보를 확인해주세요.',
  notFound: '요청하신 페이지를 찾을 수 없습니다.',
  timeout: '요청 시간이 초과되었습니다.',
  unknown: '알 수 없는 오류가 발생했습니다.'
};

// ✅ 성공 메시지
export const SUCCESS_MESSAGES = {
  login: '로그인이 완료되었습니다!',
  signup: '회원가입을 축하합니다!',
  logout: '로그아웃되었습니다.',
  cartAdd: '장바구니에 추가되었습니다!',
  wishlistAdd: '찜목록에 추가되었습니다!',
  orderComplete: '주문이 완료되었습니다!',
  profileUpdate: '프로필이 업데이트되었습니다!',
  passwordChange: '비밀번호가 변경되었습니다!'
};

// 📝 유효성 검사 패턴
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
  password: /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
  name: /^[가-힣a-zA-Z\s]{2,}$/,
  zipcode: /^\d{5}$/
};

// 🏪 회사 정보
export const COMPANY_INFO = {
  name: '㈜커비숍',
  ceo: '커비킹',
  businessNumber: '123-45-67890',
  address: '서울시 강남구 커비로 123, 커비빌딩 5층',
  phone: '1588-0000',
  email: 'help@kirbyshop.com',
  workingHours: '평일 9:00-18:00 (토/일/공휴일 휴무)',
  lunchTime: '점심시간 12:00-13:00'
};

// 🎁 이벤트 타입
export const EVENT_TYPES = {
  discount: { name: '할인 이벤트', icon: '🏷️', color: '#ff1493' },
  giveaway: { name: '증정 이벤트', icon: '🎁', color: '#ff69b4' },
  point: { name: '포인트 이벤트', icon: '💎', color: '#ffd700' },
  shipping: { name: '무료배송 이벤트', icon: '🚚', color: '#32cd32' },
  limited: { name: '한정판 출시', icon: '⭐', color: '#ff4500' },
  membership: { name: '멤버십 이벤트', icon: '👑', color: '#9370db' }
};

// 📅 날짜 포맷
export const DATE_FORMATS = {
  full: 'YYYY년 MM월 DD일 HH:mm:ss',
  date: 'YYYY-MM-DD',
  time: 'HH:mm',
  dateTime: 'YYYY-MM-DD HH:mm',
  korean: 'YYYY년 MM월 DD일',
  koreanTime: 'MM월 DD일 HH:mm'
};

// 🔒 로컬 스토리지 키
export const STORAGE_KEYS = {
  user: 'kirby-shop-user',
  token: 'kirby-shop-token',
  cart: 'kirby-shop-cart',
  wishlist: 'kirby-shop-wishlist',
  recentSearches: 'kirby-shop-recent-searches',
  theme: 'kirby-shop-theme',
  language: 'kirby-shop-language',
  promoBannerClosed: 'kirby-shop-promo-banner-closed'
};

// 🌍 지원 언어
export const LANGUAGES = {
  ko: { name: '한국어', flag: '🇰🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  ja: { name: '日本語', flag: '🇯🇵' },
  zh: { name: '中文', flag: '🇨🇳' }
};

// 📦 배송 상태
export const DELIVERY_STATUS = {
  preparing: { name: '상품 준비중', icon: '📦', color: '#ffa500' },
  shipped: { name: '배송중', icon: '🚚', color: '#1e90ff' },
  delivered: { name: '배송완료', icon: '✅', color: '#32cd32' },
  cancelled: { name: '배송취소', icon: '❌', color: '#ff4500' }
};

// 💳 결제 방법
export const PAYMENT_METHODS = {
  card: { name: '신용카드', icon: '💳', fee: 0 },
  bank: { name: '계좌이체', icon: '🏦', fee: 0 },
  phone: { name: '휴대폰 결제', icon: '📱', fee: 0 },
  kakao: { name: '카카오페이', icon: '💬', fee: 0 },
  naver: { name: '네이버페이', icon: '🟢', fee: 0 },
  paypal: { name: '페이팔', icon: '🌐', fee: 300 }
};

// 🎨 테마 설정
export const THEMES = {
  pink: {
    name: '커비 핑크',
    primary: '#ff69b4',
    secondary: '#ffb6c1',
    background: '#ffeef8'
  },
  lavender: {
    name: '라벤더',
    primary: '#9370db',
    secondary: '#e6e6fa',
    background: '#f8f4ff'
  },
  mint: {
    name: '민트',
    primary: '#20b2aa',
    secondary: '#afeeee',
    background: '#f0fff0'
  },
  peach: {
    name: '피치',
    primary: '#ff7f50',
    secondary: '#ffdab9',
    background: '#fff5ee'
  }
};

// 📈 분석 이벤트
export const ANALYTICS_EVENTS = {
  pageView: 'page_view',
  productView: 'product_view',
  addToCart: 'add_to_cart',
  addToWishlist: 'add_to_wishlist',
  purchase: 'purchase',
  search: 'search',
  login: 'login',
  signup: 'signup'
};

export default {
  COLORS,
  BREAKPOINTS,
  SHOPPING,
  USER_GRADES,
  PAGINATION,
  SORT_OPTIONS,
  PRODUCT_TAGS,
  SOCIAL_PROVIDERS,
  ANIMATIONS,
  CHART_COLORS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_PATTERNS,
  COMPANY_INFO,
  EVENT_TYPES,
  DATE_FORMATS,
  STORAGE_KEYS,
  LANGUAGES,
  DELIVERY_STATUS,
  PAYMENT_METHODS,
  THEMES,
  ANALYTICS_EVENTS
};