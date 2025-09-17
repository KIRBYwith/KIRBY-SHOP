import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Heart, Star, Trash2, ShoppingCart, Filter, SortAsc, SortDesc } from 'lucide-react';

import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
// 카드를 더 활용하려면 ProductCard, 리스트나 간략형은 ProductListItem 도 활용
import ProductCard from '../components/product/ProductCard';
import '../styles/WishlistPage.css';

const WishlistPage = () => {
  const { user } = useAuth();
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    sortWishlist,
    filterWishlist,
    getWishlistStats,
  } = useWishlist(user);

  const { addToCart, isInCart } = useCart();

  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState({}); // 확장 시 사용

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <>
        <Header />
        <div className="wishlist-container">
          <div className="empty-wishlist">
            <Heart size={80} className="empty-heart-icon" />
            <h2>찜한 상품이 없습니다</h2>
            <p>마음에 드는 상품을 <span className="highlight">찜</span>해보세요!</p>
            <button className="shop-now-btn" onClick={() => window.location.href = '/'}>
              <ShoppingCart size={20} />
              쇼핑하러 가기
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // 정렬 핸들러
  const handleSort = (type) => {
    setSort(type);
    sortWishlist(type);
  };

  // 필터는 미사용 시 전체 보여주기
  let filteredItems = wishlistItems;
  // if (Object.keys(filter).length > 0) filteredItems = filterWishlist(filter);

  // 찜 상품 요약/통계
  const stats = getWishlistStats();

  return (
    <>
      <Header />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="wishlist-title">
            <Heart size={32} className="wishlist-icon" />
            <h1>찜목록</h1>
            <span className="item-count">({wishlistItems.length}개)</span>
          </div>
          
          <div className="wishlist-stats">
            <div className="stat-item">
              <span className="stat-label">찜 총합</span>
              <span className="stat-value">{stats.totalValue?.toLocaleString() || 0}원</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">할인 상품</span>
              <span className="stat-value">{stats.discountedCount}개</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">평균가</span>
              <span className="stat-value">{Math.round(stats.avgPrice).toLocaleString()}원</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">품절</span>
              <span className="stat-value">{stats.outOfStockCount}개</span>
            </div>
          </div>
        </div>

        <div className="wishlist-controls">
          <div className="sort-buttons">
            <button 
              className={`sort-btn ${sort === 'newest' ? 'active' : ''}`}
              onClick={() => handleSort('newest')}
            >
              <SortAsc size={16} />
              최신순
            </button>
            <button 
              className={`sort-btn ${sort === 'price-high' ? 'active' : ''}`}
              onClick={() => handleSort('price-high')}
            >
              <SortDesc size={16} />
              고가순
            </button>
            <button 
              className={`sort-btn ${sort === 'price-low' ? 'active' : ''}`}
              onClick={() => handleSort('price-low')}
            >
              <SortAsc size={16} />
              저가순
            </button>
            <button 
              className={`sort-btn ${sort === 'discount' ? 'active' : ''}`}
              onClick={() => handleSort('discount')}
            >
              <Star size={16} />
              할인순
            </button>
          </div>
          
          <button className="clear-all-btn" onClick={clearWishlist}>
            <Trash2 size={16} />
            모두삭제
          </button>
        </div>

        <div className="wishlist-grid">
          {filteredItems.map((item) => (
            <ProductCard
              key={item.wishlistId || item.id}
              product={item}
              isWishlisted={true}
              onWishlistToggle={() => removeFromWishlist(item.id)}
              onCartAdd={() => addToCart(item, 1)}
              cartQuantity={isInCart(item.id) ? 1 : 0}
              showRating={true}
              showStock={true}
              viewMode="grid"
              showBadges={true}
            />
          ))}
        </div>

        <div className="wishlist-footer">
          <p>찜목록은 해당 브라우저에서만 저장됩니다.</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;
