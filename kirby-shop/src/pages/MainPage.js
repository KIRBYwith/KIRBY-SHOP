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
import FloatingCartSidebar from '../components/cart/FloatingCartSidebar';
import FloatingWishlistSidebar from '../components/wishlist/FloatingWishlistSidebar';


// hooks imports (전부 named export)
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../contexts/AuthContext';

// 데이터, 유틸
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
  // hooks
  const { user, isAuthenticated, login, logout, signup, socialLogin, isLoading: authLoading } = useAuth();
  const { cartItems, addToCart, removeFromCart, updateQuantity, totalQuantity, finalPrice, cartSummary } = useCart(user);
  const { wishlistItems, wishlistIds, toggleWishlist, isInWishlist } = useWishlist(user);

  // 상태 관리
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [showFloatingWishlist, setShowFloatingWishlist] = useState(false);

  // 상품 필터링
  const filteredProducts = React.useMemo(() => {
    let filtered = productsData;
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    return filtered;
  }, [selectedCategory, searchQuery]);

  // 알림 메시지 표시
  const showNotification = (message, type = 'success') => {
    const notification = { id: Date.now(), message, type, timestamp: Date.now() };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  // 카테고리 변경
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 검색
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setSelectedCategory('전체');
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 상품 클릭
  const handleProductClick = (product) => setSelectedProduct(product);

  // 찜 토글
  const handleWishlistToggle = (productId) => {
    if (!isAuthenticated) {
      showNotification('로그인하지 않아도 찜하기를 이용할 수 있습니다!', 'info');
    }
    const result = toggleWishlist(productsData.find(p => p.id === productId));
    if (result.success) {
      showNotification(result.message);
      if (result.message.includes('추가')) {
        setShowFloatingWishlist(true); // 찜목록 사이드바 자동 오픈
      }
    }
  };

  // 장바구니 추가
  const handleCartAdd = (product, quantity = 1) => {
    if (!isAuthenticated) {
      showNotification('로그인하지 않아도 장바구니를 이용할 수 있습니다!', 'info');
    }
    const result = addToCart(product, quantity);
    if (result.success) {
      showNotification(createKirbyMessage('장바구니에 추가되었습니다!'));
      setShowFloatingCart(true); // 장바구니 사이드바 자동 오픈
    } else {
      showNotification(result.message, 'error');
    }
  };

  // 히어로슬라이드 컨트롤
  const handleHeroSlideChange = () => { };

  const handleHeroButtonClick = (slide) => {
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

  // 프로모 배너 클릭
  const handlePromoBannerClick = (banner) => {
    if (banner.type === 'signup') {
      if (!isAuthenticated) {
        showNotification('회원가입/로그인 페이지로 이동해주세요!', 'info');
      } else {
        showNotification('이미 로그인된 상태입니다!', 'info');
      }
    }
  };

  // 바로구매
  const handleBuyNow = (product, quantity = 1) => {
    if (!isAuthenticated) {
      showNotification('로그인 후 구매할 수 있습니다.', 'warning');
      return;
    }
    showNotification(createKirbyMessage(`${product.title} 주문 페이지로 이동합니다!`));
  };

  // 로그아웃
  const handleLogout = () => {
    const result = logout();
    if (result.success) showNotification(result.message);
  };

  // 로딩/키보드 단축키 처리
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') setSelectedProduct(null);
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
      <a href="#main-content" className="skip-link">
        메인 콘텐츠로 이동
      </a>
      <Header
        isLoggedIn={isAuthenticated}
        user={user}
        wishlistCount={wishlistIds.length}
        cartCount={totalQuantity}  // cartItemCount → cartCount
        onLogin={() => showNotification('로그인 페이지로 이동해주세요!', 'info')}
        onLogout={handleLogout}
        onSearchSubmit={handleSearchSubmit}
        onCartClick={() => setShowFloatingCart(true)}
        onWishlistClick={() => setShowFloatingWishlist(true)}
      />
      <CategoryMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        showSpecialItems={true}
      />
      <main id="main-content">
        <HeroSlider
          images={heroImages}
          autoSlide={true}
          slideInterval={5000}
          onSlideChange={handleHeroSlideChange}
          onButtonClick={handleHeroButtonClick}
        />
        <PromoBanner
          banners={promoBanners}
          autoRotate={true}
          rotateInterval={8000}
          onBannerClick={handlePromoBannerClick}
        />
        <section id="products-section">
          <ProductGrid
            products={filteredProducts}
            loading={authLoading}
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
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            cartQuantity={
              cartItems.find(item => item.id === selectedProduct.id)?.quantity || 0
            }
            onWishlistToggle={handleWishlistToggle}
            onCartAdd={handleCartAdd}
            onBuyNow={handleBuyNow}
          />
        )}
      </main>
      <Footer />
      <FloatingCartSidebar
        isOpen={showFloatingCart}
        onClose={() => setShowFloatingCart(false)}
        onOpenWishlist={() => {
          setShowFloatingCart(false);
          setShowFloatingWishlist(true);
        }}
      />

      <FloatingWishlistSidebar
        isOpen={showFloatingWishlist}
        onClose={() => setShowFloatingWishlist(false)}
        onOpenCart={() => {
          setShowFloatingWishlist(false);
          setShowFloatingCart(true);
        }}
      />
    </div>
  );
};

export default MainPage;
