// src/pages/MainPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';

// 컴포넌트 imports
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSlider from '../components/hero/HeroSlider';
import PromoBanner from '../components/hero/PromoBanner';
import CategoryMenu from '../components/navigation/CategoryMenu';
import ProductGrid from '../components/product/ProductGrid';
import ProductModal from '../components/product/ProductModal'; // ProductModal import 추가
import FloatingCartSidebar from '../components/cart/FloatingCartSidebar';
import FloatingWishlistSidebar from '../components/wishlist/FloatingWishlistSidebar';
import KirbyLoader from '../components/common/KirbyLoader';

// hooks imports
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

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
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, addToCart, totalQuantity } = useCart(user);
  const { wishlistIds, toggleWishlist } = useWishlist(user);
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [showFloatingWishlist, setShowFloatingWishlist] = useState(false);

  // ProductModal 관련 state 추가
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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


  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setSelectedCategory('전체');
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // handleProductClick 수정 - 모달 열기
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // 모달 닫기 함수 추가
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // 바로구매 함수 추가
  const handleBuyNow = (product, quantity, option) => {
    if (!product) return;
    
    // 안전한 상품 데이터만 추출
    const safeProductData = {
      id: product.id,
      title: product.title,
      price: product.price,
      discount: product.discount || 0,
      image: product.image,
      category: product.category,
      stock: product.stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      description: product.description,
      quantity: quantity || 1,
      selectedOption: option || ''
    };
    
    toast.kirby(`${product.title} ${quantity || 1}개를 구매 페이지로 이동합니다.`);
    setIsModalOpen(false);
    
    // 바로구매 페이지로 이동
    navigate('/order', { 
      state: { 
        items: [safeProductData],
        isDirectBuy: true 
      } 
    });
  };

  // 관련 상품 가져오기 함수 추가
  const getRelatedProducts = (product) => {
    if (!product) return [];
    return productsData
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  };

  const handleWishlistToggle = (productId) => {
    if (!isAuthenticated) {
      toast.info('로그인하지 않아도 찜하기를 이용할 수 있습니다!');
    }
    const result = toggleWishlist(productsData.find(p => p.id === productId));
    if (result.success) {
      toast.love(result.message);
      if (result.message.includes('추가')) {
        setShowFloatingWishlist(true);
      }
    }
  };

  const handleCartAdd = (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.info('로그인하지 않아도 장바구니를 이용할 수 있습니다!');
    }
    const result = addToCart(product, quantity);
    if (result.success) {
      toast.gift(createKirbyMessage('장바구니에 추가되었습니다!'));
      setShowFloatingCart(true);
    } else {
      toast.error(result.message);
    }
  };

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

  const handlePromoBannerClick = (banner) => {
    if (banner.type === 'signup') {
      if (!isAuthenticated) {
        toast.info('회원가입/로그인 페이지로 이동해주세요!');
      } else {
        toast.info('이미 로그인된 상태입니다!');
      }
    }
  };

  const handleLogout = () => {
    const result = logout();
    if (result.success) toast.success(result.message);
  };

  // 페이지 초기 로딩
  useEffect(() => {
    setIsLoading(true);
    // 페이지 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // 페이지 로딩 중일 때 KirbyLoader 표시
  if (isLoading) {
    return <KirbyLoader fullScreen={true} size="large" />;
  }

  return (
    <div className="kirby-shop main-page">
      <a href="#main-content" className="skip-link">
        메인 콘텐츠로 이동
      </a>
      {!isModalOpen && (
        <Header
          isLoggedIn={isAuthenticated}
          wishlistCount={wishlistIds ? wishlistIds.length : 0}
          cartCount={totalQuantity}
          onSearchSubmit={handleSearchSubmit}
          onCartClick={() => setShowFloatingCart(true)}
          onWishlistClick={() => setShowFloatingWishlist(true)}
          onLogout={handleLogout}
        />
      )}
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
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            itemsPerPage={12}
            showFilters={true}
            showSort={true}
            onProductClick={handleProductClick}
            onWishlistToggle={handleWishlistToggle}
            onCartAdd={handleCartAdd}
            wishlist={wishlistIds || []}
            cart={cartItems}
          />
        </section>
      </main>
      <Footer />

      {/* ProductModal 추가 */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        isWishlisted={selectedProduct && wishlistIds ? wishlistIds.includes(selectedProduct.id) : false}
        cartQuantity={selectedProduct ?
          cartItems.find(item => item.id === selectedProduct.id)?.quantity || 0 : 0}
        onWishlistToggle={handleWishlistToggle}
        onCartAdd={handleCartAdd}
        onBuyNow={handleBuyNow}
        relatedProducts={getRelatedProducts(selectedProduct)}
      />

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