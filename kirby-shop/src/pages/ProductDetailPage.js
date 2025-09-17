// src/pages/ProductDetailPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsData } from '../data/products';
import { Share2, Heart, ShoppingCart } from 'lucide-react';

import Header from '../components/common/Header'; // Header 추가
import ProductImages from '../components/detail/ProductImages';
import ProductInfo from '../components/detail/ProductInfo';
import ProductTabs from '../components/detail/ProductTabs';
import RelatedProducts from '../components/detail/RelatedProducts.js';
import ProductModal from '../components/product/ProductModal'; // ProductModal 추가

// 훅과 컨텍스트 import
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');

  // 모달 관련 state 추가
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 훅과 컨텍스트 사용
  const { user, isAuthenticated } = useAuth();
  const { addToCart, getCartQuantity, isInCart } = useCart(user);
  const { toggleWishlist, isInWishlist } = useWishlist(user);

  useEffect(() => {
    const foundProduct = productsData.find(p => p.id === parseInt(id));

    if (foundProduct) {
      setProduct(foundProduct);
      const related = productsData.filter(
        (p) => p.category === foundProduct.category && p.id !== foundProduct.id
      ).slice(0, 4);
      setRelatedProducts(related);
      
      // 페이지 로드 시 맨 아래로 스크롤
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      setProduct(null);
    }
  }, [id]);

  if (!product) {
    return <div>상품 정보를 불러오는 중입니다...</div>;
  }

  const isMacOS = /mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent);

  const handleShare = async () => {
    if (isMacOS && navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        alert('공유가 취소되었습니다.');
      }
    } else {
      // 윈도우 또는 기타 OS: 링크 복사
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('링크가 복사되었습니다!');
        } catch {
          alert('복사에 실패했습니다. 수동으로 복사해주세요.');
        }
      } else {
        prompt('링크를 복사해주세요:', window.location.href);
      }
    }
  };


  const handleAddToCart = (modalQuantity, modalOption) => {
    if (!product) return;

    const finalQuantity = modalQuantity !== undefined ? modalQuantity : quantity;
    const finalOption = modalOption !== undefined ? modalOption : selectedOption;

    const result = addToCart(product, finalQuantity, finalOption);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleBuyNow = (modalQuantity, modalOption) => {
    if (!product) return;

    const finalQuantity = modalQuantity !== undefined ? modalQuantity : quantity;
    const finalOption = modalOption !== undefined ? modalOption : selectedOption;

    // 먼저 장바구니에 추가
    const cartResult = addToCart(product, finalQuantity, finalOption);
    if (cartResult.success) {
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
        quantity: finalQuantity,
        selectedOption: finalOption
      };

      // 바로구매 페이지로 이동
      navigate('/order', {
        state: {
          items: [safeProductData],
          isDirectBuy: true
        }
      });
    } else {
      alert(cartResult.message);
    }
  };

  const handleWishlist = () => {
    if (!product) return;

    const result = toggleWishlist(product);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  // 모달 열기 함수 추가
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기 함수 추가
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* 모달이 열려있지 않을 때만 Header 표시 */}
      {!isModalOpen && <Header />}

      <div className="product-detail-page">
        <div className="product-top">
          <ProductImages images={product?.images || [product?.image]} />

          <div className="product-top-info">
            <h1>{product.title}</h1>
            <p className="product-price">
              {product.discount > 0 ? (
                <>
                  <span className="discounted">
                    {(product.price * (1 - product.discount / 100)).toLocaleString()}원
                  </span>
                  <span className="original">{product.price.toLocaleString()}원</span>
                </>
              ) : (
                <span>{product.price?.toLocaleString()}원</span>
              )}
            </p>

            <ProductInfo
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
            />

            <div className="product-actions">
              <button onClick={handleShare} className="share-btn"><Share2 size={18} /></button>
              <button
                onClick={handleWishlist}
                className={`wishlist-btn ${isInWishlist(product?.id) ? 'active' : ''}`}
              >
                <Heart size={18} fill={isInWishlist(product?.id) ? 'currentColor' : 'none'} />
              </button>
              <button onClick={handleAddToCart} className="cart-btn">
                <ShoppingCart size={18} /> 장바구니
                {isInCart(product?.id, selectedOption) && (
                  <span className="cart-indicator">✓</span>
                )}
              </button>
              <button onClick={(e) => { e.preventDefault(); handleBuyNow(); }} className="buy-btn">바로구매</button>
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        {relatedProducts?.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>

      {/* ProductModal 추가 */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isWishlisted={isInWishlist(product?.id)} // 찜 상태에 따라 조정
        cartQuantity={getCartQuantity(product?.id, selectedOption)} // 장바구니 수량에 따라 조정
        onWishlistToggle={handleWishlist}
        onCartAdd={handleAddToCart}
        onBuyNow={handleBuyNow}
        relatedProducts={relatedProducts}
      />
    </>
  );
};

export default ProductDetailPage;