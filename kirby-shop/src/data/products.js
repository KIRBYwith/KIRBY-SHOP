// src/data/products.js

// 카테고리 정의
export const categories = [
  { id: 'all', name: '전체', icon: '🌟' },
  { id: 'plush', name: '인형/피규어', icon: '🧸' },
  { id: 'lifestyle', name: '생활용품', icon: '🏠' },
  { id: 'fashion', name: '패션/액세서리', icon: '👕' },
  { id: 'stationery', name: '문구/학용품', icon: '✏️' },
  { id: 'food', name: '푸드/간식', icon: '🍪' },
  { id: 'digital', name: '디지털/게임', icon: '🎮' }
];

// 상품 데이터
export const productsData = [
  // 인형/피규어 카테고리
  {
    id: 1,
    title: '커비 클래식 플러시 인형',
    description: '부드럽고 포근한 커비의 대표 플러시 인형입니다. 완벽한 크기와 촉감으로 모든 연령대가 좋아할 수 있어요.',
    price: 28000,
    originalPrice: 35000,
    discount: 20,
    category: '인형/피규어',
    image: '/kirby_images/kirby_001.jpg',
    images: [
      '/kirby_images/kirby_001.jpg',
      '/kirby_images/kirby_002.jpg',
      '/kirby_images/kirby_003.jpg'
    ],
    rating: 4.8,
    reviewCount: 152,
    stock: 25,
    isNew: true,
    isBestSeller: true,
    tags: ['플러시', '인형', '클래식', '핑크'],
    specs: {
      크기: '20cm × 18cm × 15cm',
      재질: '폴리에스터 100%',
      제조국: '한국',
      연령: '전연령'
    }
  },
  {
    id: 2,
    title: '커비 슬리핑 에디션',
    description: '잠자는 모습이 너무 귀여운 커비 플러시. 침실 인테리어로도 완벽하고 안고 자기에도 최적화된 사이즈입니다.',
    price: 32000,
    originalPrice: 40000,
    discount: 20,
    category: '인형/피규어',
    image: '/kirby_images/kirby_004.jpg',
    images: [
      '/kirby_images/kirby_004.jpg',
      '/kirby_images/kirby_005.jpg'
    ],
    rating: 4.9,
    reviewCount: 89,
    stock: 15,
    isNew: true,
    tags: ['플러시', '슬리핑', '수면', '힐링'],
    specs: {
      크기: '25cm × 22cm × 18cm',
      재질: '벨벳 폴리에스터',
      제조국: '한국',
      연령: '전연령'
    }
  },
  {
    id: 3,
    title: '커비 메타나이트 피규어',
    description: '커비의 라이벌 메타나이트의 정밀한 피규어입니다. 디테일한 조형과 포즈가 인상적인 컬렉터 아이템.',
    price: 45000,
    category: '인형/피규어',
    image: '/kirby_images/kirby_006.jpg',
    images: [
      '/kirby_images/kirby_006.jpg',
      '/kirby_images/kirby_007.jpg'
    ],
    rating: 4.7,
    reviewCount: 67,
    stock: 8,
    isLimited: true,
    tags: ['피규어', '메타나이트', '컬렉션', '한정판'],
    specs: {
      크기: '15cm × 12cm × 10cm',
      재질: 'PVC, ABS',
      제조국: '일본',
      연령: '14세 이상'
    }
  },
  {
    id: 4,
    title: '커비 미니 피규어 세트',
    description: '다양한 표정과 포즈의 커비 미니 피규어 6개 세트. 책상이나 선반 장식용으로 완벽합니다.',
    price: 24000,
    originalPrice: 30000,
    discount: 20,
    category: '인형/피규어',
    image: '/kirby_images/kirby_008.jpg',
    images: [
      '/kirby_images/kirby_008.jpg',
      '/kirby_images/kirby_009.png'
    ],
    rating: 4.6,
    reviewCount: 134,
    stock: 42,
    isBestSeller: true,
    tags: ['미니', '피규어', '세트', '장식'],
    specs: {
      크기: '각 5cm × 4cm × 4cm',
      재질: 'PVC',
      구성: '6개 세트',
      연령: '8세 이상'
    }
  },

  // 생활용품 카테고리
  {
    id: 5,
    title: '커비 머그컵',
    description: '아침을 상쾌하게 시작할 수 있는 귀여운 커비 머그컵. 용량도 넉넉하고 보온성도 뛰어납니다.',
    price: 18000,
    category: '생활용품',
    image: '/kirby_images/kirby_010.jpg',
    images: [
      '/kirby_images/kirby_010.jpg',
      '/kirby_images/kirby_011.jpg'
    ],
    rating: 4.5,
    reviewCount: 89,
    stock: 67,
    tags: ['머그컵', '생활용품', '커피', '차'],
    specs: {
      용량: '350ml',
      재질: '세라믹',
      크기: '직경 8cm × 높이 9.5cm',
      전자레인지: '사용 가능'
    }
  },
  {
    id: 6,
    title: '커비 쿠션',
    description: '소파나 침대에서 사용하기 좋은 부드러운 커비 쿠션. 목과 허리를 편안하게 받쳐줍니다.',
    price: 25000,
    originalPrice: 30000,
    discount: 17,
    category: '생활용품',
    image: '/kirby_images/kirby_012.jpg',
    images: [
      '/kirby_images/kirby_012.jpg',
      '/kirby_images/kirby_013.jpg'
    ],
    rating: 4.7,
    reviewCount: 78,
    stock: 23,
    isNew: true,
    tags: ['쿠션', '인테리어', '편안함', '휴식'],
    specs: {
      크기: '40cm × 35cm × 12cm',
      재질: '폴리에스터, 메모리폼',
      세탁: '손세탁 권장',
      색상: '핑크'
    }
  },
  {
    id: 7,
    title: '커비 블랙킷',
    description: '추운 겨울밤을 따뜻하게 만들어줄 커비 블랙킷. 부드러운 소재와 적당한 두께로 사계절 사용 가능.',
    price: 35000,
    category: '생활용품',
    image: '/kirby_images/kirby_014.jpg',
    images: [
      '/kirby_images/kirby_014.jpg',
      '/kirby_images/kirby_015.jpg'
    ],
    rating: 4.8,
    reviewCount: 56,
    stock: 19,
    tags: ['블랙킷', '담요', '따뜻함', '수면'],
    specs: {
      크기: '150cm × 200cm',
      재질: '마이크로파이버',
      두께: '중간',
      세탁: '기계세탁 가능'
    }
  },
  {
    id: 8,
    title: '커비 키링',
    description: '가방이나 열쇠에 달고 다닐 수 있는 작고 귀여운 커비 키링. 내구성이 뛰어나고 색상이 선명합니다.',
    price: 8000,
    category: '생활용품',
    image: '/kirby_images/kirby_016.jpg',
    images: [
      '/kirby_images/kirby_016.jpg',
      '/kirby_images/kirby_017.png'
    ],
    rating: 4.4,
    reviewCount: 203,
    stock: 156,
    isBestSeller: true,
    tags: ['키링', '액세서리', '휴대용', '선물'],
    specs: {
      크기: '6cm × 5cm × 3cm',
      재질: 'PVC, 메탈',
      중량: '15g',
      고리: '스테인레스'
    }
  },

  // 패션/액세서리 카테고리
  {
    id: 9,
    title: '커비 후드티',
    description: '편안하고 따뜻한 커비 후드티. 고품질 원단으로 제작되어 세탁 후에도 모양이 변하지 않습니다.',
    price: 42000,
    originalPrice: 52000,
    discount: 19,
    category: '패션/액세서리',
    image: '/kirby_images/kirby_018.jpg',
    images: [
      '/kirby_images/kirby_018.jpg',
      '/kirby_images/kirby_019.jpg'
    ],
    rating: 4.6,
    reviewCount: 91,
    stock: 34,
    isNew: true,
    tags: ['후드티', '패션', '편안함', '캐주얼'],
    specs: {
      사이즈: 'S, M, L, XL',
      재질: '면 80%, 폴리에스터 20%',
      색상: '핑크, 화이트',
      관리: '찬물 기계세탁'
    }
  },
  {
    id: 10,
    title: '커비 에코백',
    description: '환경을 생각하는 커비 에코백. 장보기나 외출 시 유용하며, 접어서 보관하기 편리합니다.',
    price: 15000,
    category: '패션/액세서리',
    image: '/kirby_images/kirby_020.jpg',
    images: ['/kirby_images/kirby_020.jpg'],
    rating: 4.3,
    reviewCount: 127,
    stock: 89,
    tags: ['에코백', '친환경', '쇼핑백', '실용적'],
    specs: {
      크기: '38cm × 42cm × 10cm',
      재질: '친환경 캔버스',
      내구성: '최대 10kg',
      접이식: '가능'
    }
  },

  // 문구/학용품 카테고리
  {
    id: 11,
    title: '커비 필통',
    description: '학생들에게 인기만점인 커비 필통. 충분한 수납공간과 귀여운 디자인이 매력적입니다.',
    price: 12000,
    category: '문구/학용품',
    image: '/kirby_images/kirby_001.jpg',
    images: ['/kirby_images/kirby_001.jpg'],
    rating: 4.5,
    reviewCount: 167,
    stock: 78,
    isBestSeller: true,
    tags: ['필통', '문구', '학용품', '수납'],
    specs: {
      크기: '20cm × 8cm × 6cm',
      재질: 'PU 가죽',
      구성: '메인 포켓, 서브 포켓',
      지퍼: 'YKK 지퍼'
    }
  },
  {
    id: 12,
    title: '커비 노트',
    description: '공부나 일기 쓰기에 완벽한 커비 노트. 고급 종이를 사용하여 필기감이 부드럽습니다.',
    price: 9000,
    category: '문구/학용품',
    image: '/kirby_images/kirby_002.jpg',
    images: ['/kirby_images/kirby_002.jpg'],
    rating: 4.4,
    reviewCount: 98,
    stock: 125,
    tags: ['노트', '공책', '필기', '학습'],
    specs: {
      크기: 'A5 (148mm × 210mm)',
      페이지: '200페이지',
      종이: '80g 고급 용지',
      제본: '무선 제본'
    }
  },

  // 푸드/간식 카테고리
  {
    id: 13,
    title: '커비 쿠키',
    description: '커비 모양의 귀여운 쿠키. 바삭하고 달콤한 맛으로 아이들과 어른들 모두 좋아합니다.',
    price: 16000,
    category: '푸드/간식',
    image: '/kirby_images/kirby_003.jpg',
    images: ['/kirby_images/kirby_003.jpg'],
    rating: 4.7,
    reviewCount: 145,
    stock: 67,
    isNew: true,
    tags: ['쿠키', '간식', '디저트', '선물'],
    specs: {
      중량: '200g',
      유통기한: '제조일로부터 30일',
      보관방법: '실온 보관',
      알레르기: '밀, 계란, 유제품 함유'
    }
  },
  {
    id: 14,
    title: '커비 캔디',
    description: '상큼하고 달콤한 커비 캔디. 다양한 과일맛으로 구성되어 있어 선택의 재미가 있습니다.',
    price: 8000,
    category: '푸드/간식',
    image: '/kirby_images/kirby_004.jpg',
    images: ['/kirby_images/kirby_004.jpg'],
    rating: 4.2,
    reviewCount: 234,
    stock: 189,
    tags: ['캔디', '사탕', '과일맛', '달콤함'],
    specs: {
      중량: '150g',
      맛: '딸기, 포도, 사과, 오렌지',
      유통기한: '제조일로부터 12개월',
      보관방법: '직사광선 피해 보관'
    }
  },

  // 디지털/게임 카테고리
  {
    id: 15,
    title: '커비 게임 케이스',
    description: 'Nintendo Switch용 커비 게임 케이스. 휴대하기 편하고 게임팩을 안전하게 보호합니다.',
    price: 22000,
    category: '디지털/게임',
    image: '/kirby_images/kirby_005.jpg',
    images: ['/kirby_images/kirby_005.jpg'],
    rating: 4.6,
    reviewCount: 87,
    stock: 45,
    tags: ['게임케이스', '닌텐도', '스위치', '보호'],
    specs: {
      호환: 'Nintendo Switch',
      수납: '게임팩 8개',
      재질: 'EVA 소재',
      크기: '26cm × 12cm × 4cm'
    }
  },
  {
    id: 16,
    title: '커비 휴대폰 케이스',
    description: '스마트폰을 귀엽게 꾸며줄 커비 휴대폰 케이스. 충격 보호 기능도 뛰어납니다.',
    price: 18000,
    category: '디지털/게임',
    image: '/kirby_images/kirby_006.jpg',
    images: ['/kirby_images/kirby_006.jpg'],
    rating: 4.5,
    reviewCount: 156,
    stock: 78,
    isBestSeller: true,
    tags: ['휴대폰케이스', '보호', '액세서리', '스마트폰'],
    specs: {
      호환: 'iPhone, Galaxy 시리즈',
      재질: 'TPU + PC',
      기능: '충격 흡수, 먼지 방지',
      색상: '핑크, 블루'
    }
  },

  // 추가 상품들
  {
    id: 17,
    title: '커비 탁상 시계',
    description: '책상 위를 귀엽게 장식할 커비 탁상 시계. 알람 기능과 LED 백라이트가 포함되어 있습니다.',
    price: 28000,
    category: '생활용품',
    image: '/kirby_images/kirby_007.jpg',
    images: ['/kirby_images/kirby_007.jpg'],
    rating: 4.4,
    reviewCount: 73,
    stock: 32,
    tags: ['시계', '알람', '인테리어', 'LED'],
    specs: {
      크기: '12cm × 10cm × 8cm',
      전원: 'AAA 배터리 2개',
      기능: '알람, 백라이트, 온도표시',
      재질: 'ABS 플라스틱'
    }
  },
  {
    id: 18,
    title: '커비 파자마',
    description: '편안한 잠자리를 위한 부드러운 커비 파자마. 통기성이 좋고 피부에 자극이 없습니다.',
    price: 38000,
    originalPrice: 45000,
    discount: 16,
    category: '패션/액세서리',
    image: '/kirby_images/kirby_008.jpg',
    images: ['/kirby_images/kirby_008.jpg'],
    rating: 4.8,
    reviewCount: 64,
    stock: 28,
    isNew: true,
    tags: ['파자마', '잠옷', '편안함', '수면'],
    specs: {
      사이즈: 'S, M, L, XL',
      재질: '면 95%, 스판덱스 5%',
      구성: '상의 + 하의',
      색상: '핑크, 라벤더'
    }
  },
  {
    id: 19,
    title: '커비 런치박스',
    description: '도시락을 예쁘게 포장할 수 있는 커비 런치박스. 밀폐력이 뛰어나고 전자레인지 사용 가능합니다.',
    price: 24000,
    category: '생활용품',
    image: '/kirby_images/kirby_009.png',
    images: ['/kirby_images/kirby_009.png'],
    rating: 4.5,
    reviewCount: 112,
    stock: 56,
    tags: ['런치박스', '도시락', '밀폐용기', '전자레인지'],
    specs: {
      용량: '800ml',
      재질: 'BPA-free 플라스틱',
      구성: '본체 + 뚜껑 + 칸막이',
      전자레인지: '사용 가능 (뚜껑 제외)'
    }
  },
  {
    id: 20,
    title: '커비 스티커 팩',
    description: '노트북, 휴대폰, 다이어리 등을 꾸밀 수 있는 커비 스티커 팩. 방수 코팅으로 오래 사용 가능합니다.',
    price: 6000,
    category: '문구/학용품',
    image: '/kirby_images/kirby_010.jpg',
    images: ['/kirby_images/kirby_010.jpg'],
    rating: 4.3,
    reviewCount: 298,
    stock: 167,
    isBestSeller: true,
    tags: ['스티커', '데코', '장식', '방수'],
    specs: {
      구성: '50개 스티커',
      크기: '다양한 사이즈',
      재질: '방수 비닐',
      제거: '잔여물 없이 제거 가능'
    }
  }
];

// 유틸리티 함수들
export const getProductsByCategory = (category) => {
  if (category === '전체') return productsData;
  return productsData.filter(product => product.category === category);
};

export const getProductById = (id) => {
  return productsData.find(product => product.id === parseInt(id));
};

export const getBestSellerProducts = () => {
  return productsData.filter(product => product.isBestSeller);
};

export const getNewProducts = () => {
  return productsData.filter(product => product.isNew);
};

export const getLimitedProducts = () => {
  return productsData.filter(product => product.isLimited);
};

export const getDiscountedProducts = () => {
  return productsData.filter(product => product.discount > 0);
};

export const searchProducts = (query) => {
  const searchTerm = query.toLowerCase();
  return productsData.filter(product => 
    product.title.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    (product.tags && product.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    ))
  );
};

// 상품 통계
export const getProductStats = () => {
  const total = productsData.length;
  const avgPrice = Math.round(
    productsData.reduce((sum, product) => sum + product.price, 0) / total
  );
  const avgRating = (
    productsData.reduce((sum, product) => sum + product.rating, 0) / total
  ).toFixed(1);
  
  const categoryStats = categories.map(category => ({
    ...category,
    count: category.id === 'all' ? total : getProductsByCategory(category.name).length
  }));

  return {
    total,
    avgPrice,
    avgRating,
    categoryStats,
    bestSellers: getBestSellerProducts().length,
    newProducts: getNewProducts().length,
    limitedProducts: getLimitedProducts().length
  };
};