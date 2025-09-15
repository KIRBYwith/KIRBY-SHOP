// src/pages/ProductDetailPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productsData } from '../data/products';
import { Share2, Heart, ShoppingCart } from 'lucide-react';

import Header from '../components/common/Header'; // Header 추가
import ProductImages from '../components/detail/ProductImages';
import ProductInfo from '../components/detail/ProductInfo';
import ProductTabs from '../components/detail/ProductTabs';
import RelatedProducts from '../components/detail/RelatedProducts.js';
import ProductModal from '../components/product/ProductModal'; // ProductModal 추가

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  
  // 모달 관련 state 추가
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const foundProduct = productsData.find(p => p.id === parseInt(id));

    if (foundProduct) {
      setProduct(foundProduct);
      const related = productsData.filter(
        (p) => p.category === foundProduct.category && p.id !== foundProduct.id
      ).slice(0, 4);
      setRelatedProducts(related);
    } else {
      setProduct(null);
    }
  }, [id]);

  if (!product) {
    return <div>상품 정보를 불러오는 중입니다...</div>;
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  const handleAddToCart = () => {
    console.log(`장바구니에 ${product.title} ${quantity}개, 옵션: ${selectedOption} 추가`);
  };

  const handleBuyNow = () => {
    console.log(`바로구매: ${product.title}, 수량: ${quantity}, 옵션: ${selectedOption}`);
  };

  const handleWishlist = () => {
    console.log(`찜하기 토글: ${product.id}`);
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
              <button onClick={handleShare} className="share-btn"><Share2 size={18}/></button>
              <button onClick={handleWishlist} className="wishlist-btn"><Heart size={18}/></button>
              <button onClick={handleAddToCart} className="cart-btn"><ShoppingCart size={18}/> 장바구니</button>
              <button onClick={handleBuyNow} className="buy-btn">바로구매</button>
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
        isWishlisted={false} // 찜 상태에 따라 조정
        cartQuantity={0} // 장바구니 수량에 따라 조정
        onWishlistToggle={handleWishlist}
        onCartAdd={handleAddToCart}
        onBuyNow={handleBuyNow}
        relatedProducts={relatedProducts}
      />
    </>
  );
};

export default ProductDetailPage;