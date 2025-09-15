import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductModal from '../components/product/ProductModal';

// 상품 및 카테고리 데이터
import { productsData, getProductById } from '../data/products';

// 커스텀 훅
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../contexts/AuthContext';

// 경로: React Router(예시용) → 실제 app에선 useParams 등 조정
// import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();  // 실제 라우팅 환경에서는 productId를 useParams()로 받는다.
  // 예시: const { productId } = useParams();
  
  // product 조회
  const product = useMemo(() => getProductById(productId), [productId]);

  // Hooks에 user 전달
  const { addToCart, isInCart, getCartQuantity } = useCart(user);
  const { isInWishlist, toggleWishlist } = useWishlist(user);

  // 모달 띄우기용 상태, 모바일 지원 등 커스텀 가능
  const [showModal, setShowModal] = useState(true);

  if (!product) {
    return (
      <>
        <Header />
        <div style={{ minHeight: 300, padding: 32, textAlign: 'center' }}>
          <h2>상품이 존재하지 않습니다.</h2>
          <p>요청하신 상품을 찾을 수 없습니다.</p>
        </div>
        <Footer />
      </>
    );
  }

  // 관련 상품 예시: 동일 카테고리 상품 중 일부
  const relatedProducts = productsData.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleCartAdd = (prod, qty, option) => addToCart(prod, qty, option);
  const handleWishlist = (id) => toggleWishlist(product);

  return (
    <>
      <Header />
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: 24 }}>
        {/* ProductModal은 상세설명/구매/찜/장바구니 모두 포함 */}
        <ProductModal
          product={product}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          isWishlisted={isInWishlist(product.id)}
          cartQuantity={getCartQuantity(product.id)}
          onWishlistToggle={handleWishlist}
          onCartAdd={handleCartAdd}
          onBuyNow={handleCartAdd}
          relatedProducts={relatedProducts}
        />
        {/* 모달 외 상세뷰라면, 원하는 스타일로 컴포넌트 추가 가능 */}
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
