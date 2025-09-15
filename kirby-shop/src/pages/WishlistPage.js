import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
// 카드를 더 활용하려면 ProductCard, 리스트나 간략형은 ProductListItem 도 활용
import ProductCard from '../components/product/ProductCard';

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
        <div style={{ minHeight: 300, textAlign: 'center', padding: '64px 0' }}>
          <h2>찜한 상품이 없습니다.</h2>
          <p>마음에 드는 상품을 <span style={{ color: "#FF69B4" }}>찜</span>해보세요!</p>
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        <h2>찜목록 ({wishlistItems.length}개)</h2>
        <div style={{ margin: "18px 0 28px 0", fontSize: 15, color: "#888" }}>
          <strong>찜 총합:</strong> {stats.totalValue?.toLocaleString() || 0}원 &nbsp;|&nbsp;
          <strong>할인 상품:</strong> {stats.discountedCount}개&nbsp;|&nbsp;
          <strong>평균가:</strong> {Math.round(stats.avgPrice).toLocaleString()}원&nbsp;|&nbsp;
          <strong>품절:</strong> {stats.outOfStockCount}개
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => handleSort('newest')} style={{ background: sort === 'newest' ? "#FFB6C1" : "#eee" }}>최신순</button>
          <button onClick={() => handleSort('price-high')} style={{ background: sort === 'price-high' ? "#FFB6C1" : "#eee" }}>고가순</button>
          <button onClick={() => handleSort('price-low')} style={{ background: sort === 'price-low' ? "#FFB6C1" : "#eee" }}>저가순</button>
          <button onClick={() => handleSort('discount')} style={{ background: sort === 'discount' ? "#FFB6C1" : "#eee" }}>할인순</button>
          <button onClick={clearWishlist} style={{ marginLeft: 18, color: "red" }}>모두삭제</button>
        </div>
        {/* 상품 리스트 */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          marginTop: 8,
        }}>
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
        {/* 통계 등 하단 안내 */}
        <div style={{ marginTop: 36, color: "#555", fontSize: 14, textAlign: 'right' }}>
          <span>찜목록은 해당 브라우저에서만 저장됩니다.</span>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;
