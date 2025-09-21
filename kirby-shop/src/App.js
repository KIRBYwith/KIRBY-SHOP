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
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import WishlistPage from './pages/WishlistPage';
import MyPage from './pages/MyPage';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ToastProvider } from './contexts/ToastContext';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CouponBoxPage from './pages/CouponBoxPage';
import QnAPage from './pages/QnaPage';
import ReviewPage from './pages/ReviewPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import YouthProtectionPage from './pages/YouthProtectionPage';
import DisputePage from './pages/DisputePage';
import KirbyBot from './components/common/KirbyBot';

function App() {
  return (
    <ToastProvider>
      <LoadingProvider>
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
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/toss/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/kakao/success" element={<PaymentSuccessPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/coupon" element={<CouponBoxPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/qna" element={<QnAPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/youth-protection" element={<YouthProtectionPage />} />
          <Route path="/dispute" element={<DisputePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* 모든 페이지에 표시되는 커비봇 */}
        <KirbyBot />
          </Router>
        </AuthProvider>
      </LoadingProvider>
    </ToastProvider>
  );
}
export default App;
