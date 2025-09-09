// src/pages/MainPage.js

import React, { useState, useEffect } from 'react';
import '../styles/MainPage.css';

// 컴포넌트 imports
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSlider from '../components/hero/HeroSlider';
import PromoBanner from '../components/hero/PromoBanner';
import CategoryMenu from '../components/navigation/CategoryMenu';
import ProductGrid from '../components/product/ProductGrid';
import ProductModal from '../components/product/ProductModal';
import LoginModal from '../components/auth/LoginModal';

// Hooks imports
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';

// Data imports
import { productsData, categories } from '../data/products';
import { createKirbyMessage } from '../utils/helpers';

// 히어로 이미지 데이터
const heroImages = [
  {
    id: 1,
    src: '/kirby_images/kirby_015.jpg',
    alt: '커비 플러시 컬렉션',
    title: '✨ 새로운 커비 플러시 컬렉션 ✨',
    subtitle: '부드럽고 귀여운 커비와 함께하는 따뜻한 하루',
    buttonText: '플러시 보러가기',
    backgroundColor: '#ffb6c1',
    textColor: '#ffffff',
    overlayOpacity: 0.4
  },
  {
    id: 2,
    src: '/kirby_images/kirby_016.jpg',
    alt: '커비 생활용품',
    title: '🏠 일상을 특별하게 만드는 커비 굿즈 🏠',
    subtitle: '머그컵부터 키링까지, 커비와 함께하는 매일',
    buttonText: '생활용품 구경하기',
    backgroundColor: '#e6e6fa',
    textColor: '#ffffff',
    overlayOpacity: 0.5
  },
  {
    id: 3,
    src: '/kirby_images/kirby_018.jpg',
    alt: '커비 패션 아이템',
    title: '👕 커비 스타일로 완성하는 나만의 패션 👕',
    subtitle: '후드티, 에코백까지 커비와 함께 스타일리시하게',
    buttonText: '패션 아이템 보기',
    backgroundColor: '#ffd1dc',
    textColor: '#ffffff',
    overlayOpacity: 0.3
  }
];

// 프로모션 배너 데이터
const promoBanners = [
  {
    id: 'signup-discount',
    type: 'signup',
    title: '🎉 신규 회원가입 시 20% 할인쿠폰 증정! 🎉',
    subtitle: '지금 가입하고 특별 혜택을 받아보세요!',
    buttonText: '회원가입하기',
    backgroundColor: 'linear-gradient(90deg, #ffb6c1 0%, #ff69b4 50%, #ffb6c1 100%)',
    textColor: '#ffffff',
    buttonColor: '#ffffff',
    buttonTextColor: '#ff1493',
    isActive: true
  }
];

const MainPage = () => {
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Hooks 사용
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalQuantity,
    finalPrice,
    cartSummary
  } = useCart();

  const {
    wishlistItems,
    wishlistIds,
    toggleWishlist,
    isInWishlist
  } = useWishlist();

  const {
    user,
    isAuthenticated,
    login,
    logout,
    signup,
    socialLogin,
    isLoading: authLoading
  } = useAuth();

  // 상품 필터링
  const filteredProducts = React.useMemo(() => {
    let filtered = productsData;

    // 카테고리 필터
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(query)
        ))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // 알림 메시지 표시
  const showNotification = (message, type = 'success') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    // 3초 후 자동 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  // 이벤트 핸들러들
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery(''); // 카테고리 변경 시 검색어 초기화
    
    // 상품 섹션으로 스크롤
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setSelectedCategory('전체'); // 검색 시 카테고리 초기화
    
    // 상품 섹션으로 스크롤
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleWishlistToggle = (productId) => {
    const result = toggleWishlist(productsData.find(p => p.id === productId));
    if (result.success) {
      showNotification(result.message);
    }
  };

  const handleCartAdd = (product, quantity = 1) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      showNotification('로그인 후 장바구니를 이용할 수 있습니다.', 'warning');
      return;
    }

    const result = addToCart(product, quantity);
    if (result.success) {
      showNotification(createKirbyMessage('장바구니에 추가되었습니다!'));
    } else {
      showNotification(result.message, 'error');
    }
  };

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      setShowLoginModal(false);
      showNotification(result.message);
    } else {
      showNotification(result.message, 'error');
    }
    return result;
  };

  const handleSignup = async (userData) => {
    const result = await signup(userData);
    if (result.success) {
      setShowLoginModal(false);
      showNotification(result.message);
    } else {
      showNotification(result.message, 'error');
    }
    return result;
  };

  const handleSocialLogin = async (provider) => {
    const result = await socialLogin(provider);
    if (result.success) {
      setShowLoginModal(false);
      showNotification(result.message);
    } else {
      showNotification(result.message, 'error');
    }
  };

  const handleLogout = () => {
    const result = logout();
    if (result.success) {
      showNotification(result.message);
    }
  };

  const handleHeroSlideChange = (index, slide) => {
    // 히어로 슬라이드 변경 시 로직
    console.log('Hero slide changed:', index, slide);
  };

  const handleHeroButtonClick = (slide) => {
    // 히어로 버튼 클릭 시 해당 카테고리로 이동
    if (slide.buttonText.includes('플러시')) {
      handleCategoryChange('인형/피규어');
    } else if (slide.buttonText.includes('생활용품')) {
      handleCategoryChange('생활용품');
    } else if (slide.buttonText.includes('패션')) {
      handleCategoryChange('패션/액세서리');
    } else {
      handleCategoryChange('전체');
    }
  };

  const handlePromoBannerClick = (banner) => {
    if (banner.type === 'signup') {
      if (!isAuthenticated) {
        setShowLoginModal(true);
      } else {
        showNotification('이미 로그인된 상태입니다!', 'info');
      }
    }
  };

  const handleBuyNow = (product, quantity = 1) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      showNotification('로그인 후 구매할 수 있습니다.', 'warning');
      return;
    }

    // 바로 구매 로직 (실제로는 주문 페이지로 이동)
    showNotification(createKirbyMessage(`${product.title} 주문 페이지로 이동합니다!`));
    console.log('Buy now:', product, quantity);
  };

  // 페이지 로딩 시 초기화
  useEffect(() => {
    setIsLoading(true);
    
    // 초기 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Escape 키로 모달 닫기
      if (e.key === 'Escape') {
        setSelectedProduct(null);
        setShowLoginModal(false);
      }
      
      // Ctrl+K로 검색 포커스 (개발자 도구용)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (isLoading) {
    return (
      <div className="kirby-shop">
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>커비숍을 준비하는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kirby-shop">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        메인 콘텐츠로 이동
      </a>

      {/* Header */}
      <Header
        isLoggedIn={isAuthenticated}
        user={user}
        wishlistCount={wishlistIds.length}
        cartCount={totalQuantity}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Category Menu */}
      <CategoryMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        showSpecialItems={true}
      />

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Slider */}
        <HeroSlider
          images={heroImages}
          autoSlide={true}
          slideInterval={5000}
          onSlideChange={handleHeroSlideChange}
          onButtonClick={handleHeroButtonClick}
        />

        {/* Promo Banner */}
        <PromoBanner
          banners={promoBanners}
          autoRotate={false}
          onBannerClick={handlePromoBannerClick}
          closeable={true}
        />

        {/* Products Section */}
        <section id="products-section" className="products-section">
          <ProductGrid
            products={filteredProducts}
            loading={false}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            itemsPerPage={12}
            showFilters={true}
            showSort={true}
            onProductClick={handleProductClick}
            onWishlistToggle={handleWishlistToggle}
            onCartAdd={handleCartAdd}
            wishlist={wishlistIds}
            cart={cartItems}
          />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isWishlisted={isInWishlist(selectedProduct.id)}
          cartQuantity={cartItems.find(item => item.id === selectedProduct.id)?.quantity || 0}
          onWishlistToggle={handleWishlistToggle}
          onCartAdd={handleCartAdd}
          onBuyNow={handleBuyNow}
          relatedProducts={productsData.filter(p => 
            p.category === selectedProduct.category && p.id !== selectedProduct.id
          ).slice(0, 4)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onSocialLogin={handleSocialLogin}
          loading={authLoading}
        />
      )}

      {/* Notification System */}
      {notifications.length > 0 && (
        <div className="notification-container">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification ${notification.type} fade-in`}
            >
              <span>{notification.message}</span>
              <button 
                onClick={() => setNotifications(prev => 
                  prev.filter(n => n.id !== notification.id)
                )}
                className="notification-close"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 장바구니 플로팅 버튼 (모바일) */}
      {totalQuantity > 0 && (
        <div className="floating-cart">
          <button 
            className="floating-cart-btn"
            onClick={() => showNotification('장바구니 페이지로 이동합니다!')}
          >
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{totalQuantity}</span>
            <span className="cart-total">{finalPrice.toLocaleString()}원</span>
          </button>
        </div>
      )}

      {/* 개발자 도구 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-tools">
          <details>
            <summary>개발자 도구</summary>
            <div className="dev-tools-content">
              <p>현재 카테고리: {selectedCategory}</p>
              <p>검색어: {searchQuery || '없음'}</p>
              <p>상품 수: {filteredProducts.length}</p>
              <p>장바구니: {totalQuantity}개</p>
              <p>찜목록: {wishlistIds.length}개</p>
              <p>로그인: {isAuthenticated ? '로그인됨' : '로그아웃'}</p>
              <button onClick={() => console.log('Cart:', cartItems)}>
                장바구니 로그
              </button>
              <button onClick={() => console.log('Wishlist:', wishlistItems)}>
                찜목록 로그
              </button>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default MainPage;