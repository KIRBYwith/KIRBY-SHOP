// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 페이지 컴포넌트 import (실제 파일 위치에 맞게 이름 확인!)
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';
import WishlistPage from './pages/WishlistPage';
import MyPage from './pages/MyPage';
import NotFound from './pages/NotFound';

// 공통 레이아웃(헤더/푸터 등) 적용 원하면 아래처럼 감살 수도 있음
//import Header from './components/common/Header';
//import Footer from './components/common/Footer';

function App() {
  return (

      <Router>
        {/* <Header /> */}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/mypage" element={<MyPage />} />
          {/* ✨ 예시: NotFound (Catch-all) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* <Footer /> */}
      </Router>
    // </ThemeProvider>
  );
}

export default App;
