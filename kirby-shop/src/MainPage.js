import React, { useState, useEffect } from 'react';

// public/img-items/ 폴더의 이미지 사용
const heroImages = [
  process.env.PUBLIC_URL + '/img-items/star-headphones.png',
  process.env.PUBLIC_URL + '/img-items/star-jacket.png',
  process.env.PUBLIC_URL + '/img-items/star-lamp.png',
];

const productsData = [
  { id: 1, category: 'Clothes', title: 'Stylish Jacket', price: 129.99, image: process.env.PUBLIC_URL + '/img-items/star-jacket.png', description: 'Warm and stylish jacket for all seasons.' },
  { id: 2, category: 'Electronics', title: 'Wireless Headphones', price: 59.95, image: process.env.PUBLIC_URL + '/img-items/star-headphones.png', description: 'High-quality sound with noise cancellation.' },
  { id: 3, category: 'Home', title: 'Modern Lamp', price: 49.99, image: process.env.PUBLIC_URL + '/img-items/star-lamp.png', description: 'Lamp to light up your living space.' },
  { id: 4, category: 'Clothes', title: 'Casual T-Shirt', price: 19.99, image: process.env.PUBLIC_URL + '/img-items/star-t-shirt.png', description: 'Comfortable cotton t-shirt.' },
  { id: 5, category: 'Electronics', title: 'Smart Watch', price: 149.99, image: process.env.PUBLIC_URL + '/img-items/star-watch.png', description: 'Track your fitness and notifications.' },
  // 필요한 만큼 추가 가능
];

const categories = ['All', 'Clothes', 'Electronics', 'Home'];

export default function MainPage() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalProduct, setModalProduct] = useState(null);

  // 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 카테고리별 상품 필터링
  const filteredProducts = selectedCategory === 'All' ? productsData : productsData.filter(p => p.category === selectedCategory);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
      {/* 네비게이션 바 */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#007acc', padding: '0.8rem 2rem', color: 'white' }}>
        <a href="https://github.com/KIRBYwith/KIRBY-SHOP/tree/main" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'white' }}>KIRBY-SHOP</a>
        <div>
          <button onClick={() => setSelectedCategory('All')} style={navBtnStyle(selectedCategory === 'All')}>All</button>
          <button onClick={() => setSelectedCategory('Clothes')} style={navBtnStyle(selectedCategory === 'Clothes')}>Clothes</button>
          <button onClick={() => setSelectedCategory('Electronics')} style={navBtnStyle(selectedCategory === 'Electronics')}>Electronics</button>
          <button onClick={() => setSelectedCategory('Home')} style={navBtnStyle(selectedCategory === 'Home')}>Home</button>
        </div>
      </nav>

      {/* hero 슬라이더 */}
      <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
        <img
          src={heroImages[currentHeroIndex]}
          alt="Hero banner"
          style={{ width: '100%', height: '400px', objectFit: 'cover', transition: '0.7s ease-in-out' }}
          key={currentHeroIndex}
        />
        <div style={heroTextStyle}>
          <h1 style={{ fontSize: '3rem', color: 'white', textShadow: '2px 2px 6px black' }}>Welcome to KIRBY-SHOP</h1>
          <p style={{ fontSize: '1.2rem', color: 'white', textShadow: '1px 1px 4px black' }}>Your one-stop shop for trendy products</p>
        </div>
      </div>

      {/* 상품 리스트 */}
      <section style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Popular Products</h2>
        <div style={productGridStyle}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={productCardStyle}>
              <img
                src={product.image}
                alt={product.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <h3>{product.title}</h3>
              <p>${product.price.toFixed(2)}</p>
              <button style={buyBtnStyle} onClick={() => setModalProduct(product)}>View Details</button>
            </div>
          ))}
        </div>
      </section>

      {/* 모달 팝업 */}
      {modalProduct && (
        <div style={modalOverlayStyle} onClick={() => setModalProduct(null)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <h2>{modalProduct.title}</h2>
            <img src={modalProduct.image} alt={modalProduct.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
            <p>{modalProduct.description}</p>
            <p><strong>Price:</strong> ${modalProduct.price.toFixed(2)}</p>
            <button onClick={() => setModalProduct(null)} style={closeBtnStyle}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 스타일 객체들 동일하게 유지
const navBtnStyle = (selected) => ({
  backgroundColor: selected ? '#050a0eff' : 'transparent',
  border: 'none',
  color: 'white',
  margin: '0 0.5rem',
  padding: '0.5rem 1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  borderRadius: '4px',
});

const heroTextStyle = {
  position: 'absolute',
  top: '30%',
  left: '10%',
  color: 'white',
  zIndex: 10,
  userSelect: 'none',
};

const productGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
  gap: '1rem',
};

const productCardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '1rem',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
};

const buyBtnStyle = {
  backgroundColor: '#007acc',
  border: 'none',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '0.5rem',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '2rem',
  width: '90%',
  maxWidth: '500px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
};

const closeBtnStyle = {
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  borderRadius: '4px',
  marginTop: '1rem',
};
