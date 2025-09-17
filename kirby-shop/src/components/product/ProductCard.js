// src/components/product/ProductCard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Zap, Crown, Sparkles, Tag, Truck, MessageCircle, ThumbsUp, Camera } from 'lucide-react';

const ProductCard = ({
  product,
  viewMode = 'grid', // 'grid' | 'list'
  isWishlisted = false,
  cartQuantity = 0,
  onProductClick,
  onWishlistToggle,
  onCartAdd,
  onQuickView,
  showBadges = true,
  showRating = true,
  showReviews = true,
  showStock = true,
  compact = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bestReview, setBestReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  // 상품 상세로 이동
  const navigate = useNavigate();

  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReviews = () => {
      try {
        const reviews = JSON.parse(localStorage.getItem('kirby-shop-reviews') || '[]');
        const productReviews = reviews.filter(review => review.productId === product.id);
        
        // 실제 리뷰가 있으면 사용, 없으면 더미 데이터 생성
        if (productReviews.length === 0) {
          // 상품별로 다른 리뷰 데이터 생성 (20개 상품)
          const generateProductReviews = (productId) => {
            const reviewTemplates = [
              // 상품 1: 스타 헤드폰
              [
                { userName: '음악러버', rating: 5, content: '음질이 정말 좋아요! 베이스도 깔끔하고 고음도 선명합니다. 게임할 때도 완벽해요!', likes: 28 },
                { userName: '게이머킹', rating: 4, content: '마이크 품질이 훌륭해요. 친구들이 내 목소리를 더 잘 들을 수 있다고 하네요.', likes: 22 },
                { userName: '오디오매니아', rating: 5, content: '이 가격에 이 음질은 정말 대박! 노이즈 캔슬링도 잘 되고 편안해요.', likes: 35 },
                { userName: '음악학생', rating: 4, content: '공부할 때 집중이 잘 돼요. 외부 소음이 거의 안 들려서 좋습니다.', likes: 18 },
                { userName: 'DJ킹', rating: 5, content: '믹싱 작업할 때 정말 유용해요. 정확한 사운드를 들을 수 있어서 만족합니다.', likes: 31 }
              ],
              // 상품 2: 스타 재킷
              [
                { userName: '패션스타', rating: 5, content: '디자인이 너무 예뻐요! 색상도 선명하고 재질도 부드러워요. 강력 추천!', likes: 24 },
                { userName: '스타일리스트', rating: 4, content: '코디하기 좋아요. 어떤 옷이랑도 잘 어울려서 자주 입게 됩니다.', likes: 19 },
                { userName: '패션매니아', rating: 5, content: '품질이 정말 좋아요. 세탁해도 색이 안 빠지고 형태도 잘 유지됩니다.', likes: 27 },
                { userName: '트렌드세터', rating: 4, content: '친구들이 어디서 샀냐고 물어봐요. 정말 인기 많아요!', likes: 16 },
                { userName: '스타일킹', rating: 5, content: '가성비 최고! 브랜드 제품보다도 품질이 좋은 것 같아요.', likes: 23 }
              ],
              // 상품 3: 스타 램프
              [
                { userName: '인테리어러버', rating: 5, content: '방 분위기가 완전 달라졌어요! 따뜻한 조명이 정말 좋습니다.', likes: 26 },
                { userName: '홈데코매니아', rating: 4, content: '디자인이 세련되고 실용적이에요. 밝기 조절도 잘 됩니다.', likes: 21 },
                { userName: '조명전문가', rating: 5, content: 'LED 품질이 정말 좋아요. 오래 써도 밝기가 안 떨어집니다.', likes: 29 },
                { userName: '인테리어킹', rating: 4, content: '설치가 간단하고 사용하기 편해요. 리모컨도 잘 작동합니다.', likes: 17 },
                { userName: '홈스타일러', rating: 5, content: '가격 대비 품질이 정말 좋아요. 선물용으로도 완벽합니다.', likes: 25 }
              ],
              // 상품 4: 스타 티셔츠
              [
                { userName: '캐주얼러버', rating: 5, content: '편안하고 부드러워요! 면 소재가 정말 좋고 색상도 선명합니다.', likes: 30 },
                { userName: '데일리웨어', rating: 4, content: '매일 입어도 질리지 않아요. 세탁해도 형태가 잘 유지됩니다.', likes: 24 },
                { userName: '패션러버', rating: 5, content: '프린트 품질이 정말 좋아요! 세탁해도 색이 안 빠져서 만족합니다.', likes: 28 },
                { userName: '스타일매니아', rating: 4, content: '코디하기 좋고 활동하기 편해요. 운동할 때도 자주 입습니다.', likes: 20 },
                { userName: '캐주얼킹', rating: 5, content: '가성비 최고! 이 가격에 이 품질은 정말 대박입니다.', likes: 32 }
              ],
              // 상품 5: 스타 시계
              [
                { userName: '타임키퍼', rating: 5, content: '정확도가 정말 좋아요! 배터리도 오래 가고 디자인도 세련됩니다.', likes: 27 },
                { userName: '워치컬렉터', rating: 4, content: '가격 대비 품질이 훌륭해요. 스트랩도 편안하고 조절하기 쉬워요.', likes: 22 },
                { userName: '시간매니아', rating: 5, content: '방수 기능도 좋고 내구성도 뛰어나요. 운동할 때도 잘 씁니다.', likes: 29 },
                { userName: '액세서리러버', rating: 4, content: '디자인이 클래식하고 어떤 옷이랑도 잘 어울려요.', likes: 19 },
                { userName: '워치킹', rating: 5, content: '이 가격에 이 기능은 정말 대박! 친구들도 다 부러워해요.', likes: 31 }
              ],
              // 상품 6-10: 커비 이미지 상품들
              [
                { userName: '커비팬', rating: 5, content: '커비가 너무 귀여워요! 품질도 좋고 포장도 예쁩니다. 완전 만족!', likes: 33 },
                { userName: '게임러버', rating: 4, content: '게임 캐릭터가 이렇게 예쁠 줄 몰랐어요. 방에 장식하기 좋아요.', likes: 25 },
                { userName: '수집가', rating: 5, content: '컬렉션에 추가했어요! 디테일이 정말 좋고 색상도 선명합니다.', likes: 30 },
                { userName: '팬아트러버', rating: 4, content: '팬아트로 만들어도 될 것 같아요. 영감을 많이 받았습니다.', likes: 21 },
                { userName: '커비킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 커비 팬이라면 필수템이에요.', likes: 36 }
              ],
              [
                { userName: '아트매니아', rating: 5, content: '예술 작품 같아요! 색감이 정말 아름답고 디자인이 세련됩니다.', likes: 28 },
                { userName: '디자인러버', rating: 4, content: '인테리어 포인트로 완벽해요. 방 분위기가 완전 달라졌습니다.', likes: 23 },
                { userName: '크리에이터', rating: 5, content: '창작 활동에 영감을 주네요. 정말 좋은 아이템입니다.', likes: 26 },
                { userName: '미술학생', rating: 4, content: '미술 수업 때 참고 자료로 사용했어요. 선생님도 좋아하셨습니다.', likes: 19 },
                { userName: '아트킹', rating: 5, content: '가격 대비 품질이 훌륭해요. 선물용으로도 완벽합니다.', likes: 32 }
              ],
              [
                { userName: '홈데코러버', rating: 5, content: '집 꾸미기에 완벽해요! 색상도 예쁘고 크기도 적당합니다.', likes: 29 },
                { userName: '인테리어매니아', rating: 4, content: '방 분위기가 훨씬 좋아졌어요. 친구들이 다 부러워해요.', likes: 24 },
                { userName: '홈스타일러', rating: 5, content: '품질이 정말 좋아요. 오래 써도 색이 안 바래고 깔끔합니다.', likes: 27 },
                { userName: '데코킹', rating: 4, content: '설치하기도 쉽고 관리하기도 편해요. 만족합니다.', likes: 20 },
                { userName: '홈데코킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 강력 추천합니다.', likes: 34 }
              ],
              [
                { userName: '기념품러버', rating: 5, content: '여행 기념품으로 완벽해요! 기억에 남을 것 같습니다.', likes: 31 },
                { userName: '선물매니아', rating: 4, content: '선물용으로 샀는데 받는 사람이 정말 좋아해요.', likes: 25 },
                { userName: '추억수집가', rating: 5, content: '특별한 순간을 기억할 수 있는 좋은 아이템이에요.', likes: 28 },
                { userName: '기념품킹', rating: 4, content: '품질도 좋고 포장도 예뻐서 선물하기 좋아요.', likes: 22 },
                { userName: '추억킹', rating: 5, content: '가격 대비 품질이 훌륭해요. 재구매 의사 100%!', likes: 33 }
              ],
              [
                { userName: '액세서리러버', rating: 5, content: '액세서리로 완벽해요! 어떤 옷이랑도 잘 어울립니다.', likes: 30 },
                { userName: '패션매니아', rating: 4, content: '스타일링 포인트로 좋아요. 코디하기도 쉽습니다.', likes: 26 },
                { userName: '액세서리킹', rating: 5, content: '품질이 정말 좋아요. 오래 써도 변하지 않습니다.', likes: 29 },
                { userName: '스타일러버', rating: 4, content: '디자인이 세련되고 실용적이에요. 자주 사용합니다.', likes: 23 },
                { userName: '패션킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 강력 추천합니다.', likes: 35 }
              ],
              // 상품 11-15: 추가 커비 상품들
              [
                { userName: '게임팬', rating: 5, content: '게임 캐릭터가 이렇게 예쁠 줄 몰랐어요. 완전 만족!', likes: 32 },
                { userName: '캐릭터러버', rating: 4, content: '캐릭터 디자인이 정말 귀여워요. 방에 장식하기 좋습니다.', likes: 27 },
                { userName: '게임매니아', rating: 5, content: '게임 팬이라면 필수템이에요! 품질도 훌륭합니다.', likes: 30 },
                { userName: '캐릭터킹', rating: 4, content: '색상도 선명하고 디테일도 좋아요. 만족합니다.', likes: 24 },
                { userName: '게임킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 재구매 의사 100%!', likes: 36 }
              ],
              [
                { userName: '아트러버', rating: 5, content: '예술 작품 같아요! 색감이 정말 아름답습니다.', likes: 28 },
                { userName: '크리에이티브', rating: 4, content: '창작 활동에 영감을 주네요. 정말 좋은 아이템입니다.', likes: 25 },
                { userName: '디자인매니아', rating: 5, content: '디자인이 세련되고 실용적이에요. 인테리어에 좋습니다.', likes: 29 },
                { userName: '아트킹', rating: 4, content: '품질도 좋고 포장도 예뻐서 선물하기 좋아요.', likes: 22 },
                { userName: '크리에이티브킹', rating: 5, content: '가격 대비 품질이 훌륭해요. 강력 추천합니다.', likes: 33 }
              ],
              [
                { userName: '홈데코러버', rating: 5, content: '집 꾸미기에 완벽해요! 방 분위기가 달라졌습니다.', likes: 31 },
                { userName: '인테리어매니아', rating: 4, content: '인테리어 포인트로 좋아요. 친구들이 다 부러워해요.', likes: 26 },
                { userName: '홈스타일러', rating: 5, content: '품질이 정말 좋아요. 오래 써도 변하지 않습니다.', likes: 28 },
                { userName: '데코킹', rating: 4, content: '설치하기도 쉽고 관리하기도 편해요. 만족합니다.', likes: 23 },
                { userName: '홈데코킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 재구매 의사 100%!', likes: 34 }
              ],
              [
                { userName: '기념품러버', rating: 5, content: '특별한 순간을 기억할 수 있는 좋은 아이템이에요.', likes: 29 },
                { userName: '선물매니아', rating: 4, content: '선물용으로 샀는데 받는 사람이 정말 좋아해요.', likes: 24 },
                { userName: '추억수집가', rating: 5, content: '여행 기념품으로 완벽해요! 기억에 남을 것 같습니다.', likes: 27 },
                { userName: '기념품킹', rating: 4, content: '품질도 좋고 포장도 예뻐서 선물하기 좋아요.', likes: 21 },
                { userName: '추억킹', rating: 5, content: '가격 대비 품질이 훌륭해요. 강력 추천합니다.', likes: 32 }
              ],
              [
                { userName: '액세서리러버', rating: 5, content: '액세서리로 완벽해요! 어떤 옷이랑도 잘 어울립니다.', likes: 30 },
                { userName: '패션매니아', rating: 4, content: '스타일링 포인트로 좋아요. 코디하기도 쉽습니다.', likes: 25 },
                { userName: '액세서리킹', rating: 5, content: '품질이 정말 좋아요. 오래 써도 변하지 않습니다.', likes: 28 },
                { userName: '스타일러버', rating: 4, content: '디자인이 세련되고 실용적이에요. 자주 사용합니다.', likes: 22 },
                { userName: '패션킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 재구매 의사 100%!', likes: 35 }
              ],
              // 상품 16-20: 마지막 커비 상품들
              [
                { userName: '커비러버', rating: 5, content: '커비가 너무 귀여워요! 품질도 좋고 포장도 예쁩니다.', likes: 33 },
                { userName: '게임팬', rating: 4, content: '게임 캐릭터가 이렇게 예쁠 줄 몰랐어요. 방에 장식하기 좋아요.', likes: 27 },
                { userName: '수집가', rating: 5, content: '컬렉션에 추가했어요! 디테일이 정말 좋고 색상도 선명합니다.', likes: 31 },
                { userName: '팬아트러버', rating: 4, content: '팬아트로 만들어도 될 것 같아요. 영감을 많이 받았습니다.', likes: 24 },
                { userName: '커비킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 커비 팬이라면 필수템이에요.', likes: 36 }
              ],
              [
                { userName: '아트매니아', rating: 5, content: '예술 작품 같아요! 색감이 정말 아름답고 디자인이 세련됩니다.', likes: 29 },
                { userName: '디자인러버', rating: 4, content: '인테리어 포인트로 완벽해요. 방 분위기가 완전 달라졌습니다.', likes: 25 },
                { userName: '크리에이터', rating: 5, content: '창작 활동에 영감을 주네요. 정말 좋은 아이템입니다.', likes: 28 },
                { userName: '미술학생', rating: 4, content: '미술 수업 때 참고 자료로 사용했어요. 선생님도 좋아하셨습니다.', likes: 21 },
                { userName: '아트킹', rating: 5, content: '가격 대비 품질이 훌륭해요. 선물용으로도 완벽합니다.', likes: 33 }
              ],
              [
                { userName: '홈데코러버', rating: 5, content: '집 꾸미기에 완벽해요! 색상도 예쁘고 크기도 적당합니다.', likes: 30 },
                { userName: '인테리어매니아', rating: 4, content: '방 분위기가 훨씬 좋아졌어요. 친구들이 다 부러워해요.', likes: 26 },
                { userName: '홈스타일러', rating: 5, content: '품질이 정말 좋아요. 오래 써도 색이 안 바래고 깔끔합니다.', likes: 28 },
                { userName: '데코킹', rating: 4, content: '설치하기도 쉽고 관리하기도 편해요. 만족합니다.', likes: 23 },
                { userName: '홈데코킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 강력 추천합니다.', likes: 35 }
              ],
              [
                { userName: '기념품러버', rating: 5, content: '여행 기념품으로 완벽해요! 기억에 남을 것 같습니다.', likes: 32 },
                { userName: '선물매니아', rating: 4, content: '선물용으로 샀는데 받는 사람이 정말 좋아해요.', likes: 27 },
                { userName: '추억수집가', rating: 5, content: '특별한 순간을 기억할 수 있는 좋은 아이템이에요.', likes: 29 },
                { userName: '기념품킹', rating: 4, content: '품질도 좋고 포장도 예뻐서 선물하기 좋아요.', likes: 24 },
                { userName: '추억킹', rating: 5, content: '가격 대비 품질이 훌륭해요. 재구매 의사 100%!', likes: 34 }
              ],
              [
                { userName: '액세서리러버', rating: 5, content: '액세서리로 완벽해요! 어떤 옷이랑도 잘 어울립니다.', likes: 31 },
                { userName: '패션매니아', rating: 4, content: '스타일링 포인트로 좋아요. 코디하기도 쉽습니다.', likes: 26 },
                { userName: '액세서리킹', rating: 5, content: '품질이 정말 좋아요. 오래 써도 변하지 않습니다.', likes: 29 },
                { userName: '스타일러버', rating: 4, content: '디자인이 세련되고 실용적이에요. 자주 사용합니다.', likes: 23 },
                { userName: '패션킹', rating: 5, content: '이 가격에 이 품질은 정말 대박! 강력 추천합니다.', likes: 36 }
              ]
            ];

            // 상품 ID에 따라 다른 리뷰 템플릿 선택 (1-20)
            const templateIndex = (productId - 1) % reviewTemplates.length;
            const template = reviewTemplates[templateIndex];
            
            return template.map((review, index) => ({
              id: Date.now() + productId * 100 + index,
              productId: productId,
              userName: review.userName,
              rating: review.rating,
              content: review.content,
              likes: review.likes,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }));
          };

          const mockReviews = generateProductReviews(product.id);
          // 베스트 리뷰는 좋아요가 가장 많은 것
          const best = mockReviews.sort((a, b) => b.likes - a.likes)[0];
          setBestReview(best);
          setAllReviews(mockReviews);
        } else {
          // 실제 리뷰 사용
          // 베스트 리뷰는 평점 높고 좋아요 많은 순
          const best = productReviews.sort((a, b) => {
            if (a.rating !== b.rating) return b.rating - a.rating;
            return b.likes - a.likes;
          })[0];
          setBestReview(best);
          setAllReviews(productReviews);
        }
      } catch (error) {
        console.error('리뷰 로딩 실패:', error);
      }
    };

    loadReviews();
    
    // 리뷰 업데이트 이벤트 리스너
    const handleReviewUpdate = () => {
      loadReviews();
    };
    
    window.addEventListener('reviewUpdated', handleReviewUpdate);
    
    return () => {
      window.removeEventListener('reviewUpdated', handleReviewUpdate);
    };
  }, [product.id]);

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const handleCartAdd = (e) => {
    e.stopPropagation();
    if (onCartAdd) {
      onCartAdd(product);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // 할인된 가격 계산
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;

  // 배지 정보
  const badges = [];
  if (product.isNew) badges.push({ text: 'NEW', type: 'new' });
  if (product.isBest) badges.push({ text: 'BEST', type: 'best' });
  if (product.isHot) badges.push({ text: 'HOT', type: 'hot' });
  if (product.discount > 0) badges.push({ text: `${product.discount}%`, type: 'discount' });

  // 평점 별 렌더링
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={14}
        className={`rating-star ${index < Math.floor(rating) ? 'filled' : ''}`}
        fill={index < Math.floor(rating) ? '#ffb6c1' : 'none'}
      />
    ));
  };

  // 리스트 뷰 렌더링
  if (viewMode === 'list') {
    return (
      <div 
        className={`product-card list-view ${isOutOfStock ? 'out-of-stock' : ''} ${compact ? 'compact' : ''}`}
        onClick={handleProductClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 이미지 영역 */}
        <div className="product-image-container">
          {imageError ? (
            <div className="image-placeholder">
              <Sparkles size={24} />
              <span>이미지 준비중</span>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.title}
              className={`product-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* 배지들 */}
          {showBadges && badges.length > 0 && (
            <div className="product-badges">
              {badges.slice(0, 2).map((badge, index) => (
                <span key={index} className={`badge ${badge.type}`}>
                  {badge.text}
                </span>
              ))}
            </div>
          )}

          {/* 재고 없음 오버레이 */}
          {isOutOfStock && (
            <div className="out-of-stock-overlay">
              <span>품절</span>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="product-info">
          <div className="product-main-info">
            <h3 className="product-title">{product.title}</h3>
            <p className="product-description">{product.description}</p>

            {/* 평점 및 리뷰 */}
            {(showRating || showReviews) && (
              <div className="product-rating">
                {showRating && (
                  <div className="stars">
                    {renderStars(product.rating)}
                  </div>
                )}
                {showRating && <span className="rating-score">{product.rating}</span>}
                {showReviews && (
                  <span className="review-count">({allReviews.length}개 리뷰)</span>
                )}
              </div>
            )}

            {/* 태그들 */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="product-tag">
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 가격 및 액션 */}
          <div className="product-price-actions">
            <div className="price-section">
              {product.discount > 0 && (
                <span className="original-price">
                  {product.originalPrice?.toLocaleString() || product.price.toLocaleString()}원
                </span>
              )}
              <span className="current-price">
                {discountedPrice.toLocaleString()}원
              </span>
              {product.discount > 0 && (
                <span className="discount-rate">{product.discount}% 할인</span>
              )}
            </div>

            {/* 재고 정보 */}
            {showStock && (
              <div className="stock-info">
                {isOutOfStock ? (
                  <span className="stock-status out-of-stock">품절</span>
                ) : isLowStock ? (
                  <span className="stock-status low-stock">
                    재고 {product.stock}개 남음
                  </span>
                ) : (
                  <span className="stock-status in-stock">재고 충분</span>
                )}
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="product-actions">
              <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? '찜 해제' : '찜하기'}
              >
                <Heart size={18} fill={isWishlisted ? '#ff69b4' : 'none'} />
              </button>

              <button
                className="cart-btn"
                onClick={handleCartAdd}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} />
                {cartQuantity > 0 ? `담긴수량 ${cartQuantity}` : '장바구니'}
              </button>

              {onQuickView && (
                <button
                  className="quick-view-btn"
                  onClick={handleQuickView}
                >
                  <Eye size={18} />
                  빠른보기
                </button>
              )}
            </div>
          </div>

          {/* 모든 리뷰 (리스트 뷰에서만) */}
          {allReviews.length > 0 && (
            <div className="all-reviews">
              <div className="reviews-header">
                <MessageCircle size={16} />
                <span className="reviews-title">리뷰 ({allReviews.length}개)</span>
              </div>
              <div className="reviews-list">
                {allReviews.slice(0, 3).map((review, index) => (
                  <div key={review.id} className="review-item">
                    <div className="review-item-header">
                      <div className="review-item-rating">
                        {renderStars(review.rating)}
                        <span className="review-item-score">{review.rating}</span>
                      </div>
                      <span className="review-item-author">{review.userName}</span>
                      <span className="review-item-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-item-content">{review.content}</p>
                    
                    {/* 리뷰 사진 표시 */}
                    {review.images && review.images.length > 0 && (
                      <div className="review-item-images">
                        {review.images.slice(0, 3).map((image, imgIndex) => (
                          <img 
                            key={imgIndex} 
                            src={image.url} 
                            alt={`리뷰 이미지 ${imgIndex + 1}`}
                            className="review-item-image"
                          />
                        ))}
                        {review.images.length > 3 && (
                          <div className="more-images">+{review.images.length - 3}</div>
                        )}
                      </div>
                    )}
                    
                    <div className="review-item-stats">
                      <div className="review-item-likes">
                        <ThumbsUp size={12} />
                        <span>{review.likes}</span>
                      </div>
                      {review.images && review.images.length > 0 && (
                        <div className="review-item-media">
                          <Camera size={12} />
                          <span>{review.images.length}개 첨부</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {allReviews.length > 3 && (
                  <div className="more-reviews">
                    <span>+{allReviews.length - 3}개 더보기</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 그리드 뷰 렌더링 (기본)
  return (
    <div 
      className={`product-card grid-view ${isOutOfStock ? 'out-of-stock' : ''} ${compact ? 'compact' : ''}`}
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 이미지 영역 */}
      <div className="product-image-container">
        {imageError ? (
          <div className="image-placeholder">
            <Sparkles size={32} />
            <span>이미지 준비중</span>
          </div>
        ) : (
          <>
            <img
              src={product.image}
              alt={product.title}
              className={`product-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* 호버 시 추가 이미지 */}
            {isHovered && product.images && product.images.length > 1 && (
              <img
                src={product.images[1]}
                alt={`${product.title} 추가 이미지`}
                className="product-image-hover"
                loading="lazy"
              />
            )}
          </>
        )}

        {/* 배지들 */}
        {showBadges && badges.length > 0 && (
          <div className="product-badges">
            {badges.map((badge, index) => (
              <span key={index} className={`badge ${badge.type}`}>
                {badge.type === 'best' && <Crown size={12} />}
                {badge.type === 'hot' && <Zap size={12} />}
                {badge.type === 'new' && <Sparkles size={12} />}
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* 찜하기 버튼 */}
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? '찜 해제' : '찜하기'}
        >
          <Heart size={20} fill={isWishlisted ? '#ff69b4' : 'none'} />
        </button>

        {/* 호버 액션 버튼들 */}
        <div className={`hover-actions ${isHovered ? 'visible' : ''}`}>
          {onQuickView && (
            <button
              className="hover-action-btn quick-view"
              onClick={handleQuickView}
              aria-label="빠른 보기"
            >
              <Eye size={20} />
            </button>
          )}
        </div>

        {/* 재고 없음 오버레이 */}
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>품절</span>
          </div>
        )}

        {/* 무료배송 아이콘 */}
        {product.price >= 30000 && (
          <div className="free-shipping-badge">
            <Truck size={16} />
            <span>무료배송</span>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>

        {/* 평점 및 리뷰 */}
        {(showRating || showReviews) && (
          <div className="product-rating">
            {showRating && (
              <div className="stars">
                {renderStars(product.rating)}
              </div>
            )}
            {showRating && <span className="rating-score">{product.rating}</span>}
            {showReviews && (
              <span className="review-count">({allReviews.length})</span>
            )}
          </div>
        )}

        {/* 가격 */}
        <div className="price-section">
          {product.discount > 0 && (
            <span className="original-price">
              {product.originalPrice?.toLocaleString() || product.price.toLocaleString()}원
            </span>
          )}
          <span className="current-price">
            {Math.floor(discountedPrice).toLocaleString()}원
          </span>
          {product.discount > 0 && (
            <span className="discount-rate">{product.discount}%</span>
          )}
        </div>

        {/* 재고 정보 */}
        {showStock && !compact && (
          <div className="stock-info">
            {isOutOfStock ? (
              <span className="stock-status out-of-stock">품절</span>
            ) : isLowStock ? (
              <span className="stock-status low-stock">
                재고 {product.stock}개
              </span>
            ) : null}
          </div>
        )}

        {/* 베스트 리뷰 (그리드 뷰에서만) */}
        {bestReview && (
          <div className="best-review">
            <div className="review-header">
              <Crown size={14} className="best-icon" />
              <span className="best-label">베스트 리뷰</span>
            </div>
            <div className="review-content">
              <div className="review-rating">
                {renderStars(bestReview.rating)}
                <span className="review-score">{bestReview.rating}</span>
              </div>
              <p className="review-text">{bestReview.content}</p>
              
              {/* 베스트 리뷰 사진 표시 */}
              {bestReview.images && bestReview.images.length > 0 && (
                <div className="best-review-images">
                  {bestReview.images.slice(0, 2).map((image, index) => (
                    <img 
                      key={index} 
                      src={image.url} 
                      alt={`리뷰 이미지 ${index + 1}`}
                      className="best-review-image"
                    />
                  ))}
                  {bestReview.images.length > 2 && (
                    <div className="more-images">+{bestReview.images.length - 2}</div>
                  )}
                </div>
              )}
              
              <div className="review-meta">
                <span className="review-author">{bestReview.userName}</span>
                <div className="review-stats">
                  <ThumbsUp size={12} />
                  <span>{bestReview.likes}</span>
                  {bestReview.images && bestReview.images.length > 0 && (
                    <>
                      <Camera size={12} />
                      <span>{bestReview.images.length}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="product-actions">
          <button
            className="cart-btn"
            onClick={handleCartAdd}
            disabled={isOutOfStock}
          >
            <ShoppingCart size={16} />
            {cartQuantity > 0 ? (
              <span className="cart-quantity">{cartQuantity}</span>
            ) : (
              '담기'
            )}
          </button>
        </div>

        {/* 상품 태그 (컴팩트 모드가 아닐 때만) */}
        {!compact && product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="product-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 로딩 스켈레톤 */}
      {!imageLoaded && !imageError && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
