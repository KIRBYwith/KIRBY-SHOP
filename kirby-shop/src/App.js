import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
import { AuthProvider } from './contexts/AuthContext';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CouponBoxPage from './pages/CouponBoxPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/coupon" element={<CouponBoxPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
