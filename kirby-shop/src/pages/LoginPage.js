// src/pages/LoginPage.js

import React, { useState } from 'react';
import '../styles/MainPage.css';
import '../styles/LoginModal.css';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';

const EventBadge = () => (
  <div className="welcome-message" style={{
    background: 'linear-gradient(90deg, #ffb6c1 0%, #ffd1dc 100%)',
    borderRadius: 16, marginBottom: 10, padding: '0.7rem 0.5rem'
  }}>
    <span style={{
      background: '#fff200', color: '#ff1493', fontWeight: 700,
      padding: "4px 14px", borderRadius: 13, marginRight: 12, fontSize: "1rem", boxShadow: "0 1px 8px #fff6"
    }}>
      🎁 선착순 EVENT
    </span>
    <span style={{ fontWeight: 500, color: '#d63384', fontSize: '1.03rem' }}>
      9/15까지 로그인 시 <b style={{ color: '#fd4766' }}>랜덤굿즈 추첨 + 1000P</b> 지급!
    </span>
  </div>
);

// 로그인 폼 UI (혜택 안내 포함)
const LoginForm = ({ onLogin, loading, error }) => {
  const [values, setValues] = useState({ email: '', password: '' });

  const handleChange = e => {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    onLogin(values);
  };

  return (
    <div className="login-container">
      <div className="page-header">
        <div className="page-title">
          <span className="title-icon" style={{ color: '#ffe100' }}>⭐</span>
          <h2>로그인</h2>
          <span style={{ marginLeft: 8, color: "#fd4766", fontWeight: 700, fontSize: "1.07rem" }}>
            {/* D-day 남았으면 자동 변환 */}
            <span style={{ background: "#fffbe8", color: "#fd4766", borderRadius: 8, padding: "3px 9px", marginLeft: 8 }}>
              오늘까지 특별 이벤트✨
            </span>
          </span>
        </div>
      </div>
      <EventBadge />
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="welcome-message">
          <h3 style={{ color: '#ff69b4' }}>
            🌸 커비숍 새로운 혜택 오픈!
          </h3>
          <p>
            <span style={{ color: "#844bff", fontWeight: 700 }}>로그인 시 등급 자동 적용</span> + <span style={{ color: "#ff8c42" }}>신규/이벤트 쿠폰 지급</span>
          </p>
        </div>
        <div className="input-group">
          <label htmlFor="login-email">이메일</label>
          <div className="input-wrapper">
            <input
              id="login-email"
              name="email"
              type="email"
              className="login-input"
              value={values.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck="false"
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="login-password">비밀번호</label>
          <div className="input-wrapper">
            <input
              id="login-password"
              name="password"
              type="password"
              className="login-input"
              value={values.password}
              onChange={handleChange}
              required
              placeholder="비밀번호 입력"
              autoComplete="current-password"
            />
          </div>
        </div>
        {error && <div className="submit-error">{error}</div>}
        <button className="submit-button login" type="submit" disabled={loading}>
          {loading ? <span className="spinner spinning" /> : '로그인'}
        </button>
        <div className="help-links">
          <button className="help-link" type="button" onClick={() => alert('비밀번호 찾기는 준비중입니다.')}>
            비밀번호 재설정
          </button>
          <span className="separator">|</span>
          <a className="help-link" href="/signup">
            신규 회원가입 &혜택 받기
          </a>
        </div>
        <div className="signup-benefits" style={{
          marginTop: 14, fontSize: "0.93rem", color: "#8c8c8c", textAlign: "center"
        }}>
          <span style={{ background: '#fff1fa', color: '#fd4766', padding: '4px 10px', borderRadius: 8, fontWeight: 600, marginRight: 7 }}>
            🎟️ 비회원도 첫구매 가이드 제공!
          </span>
        </div>
      </form>
    </div>
  );
};

const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const [loginError, setLoginError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoginError(null);
    const result = await login(credentials);
    if (!result.success) setLoginError(result.message);
    // 성공 시 이동처리 등 구현 가능
  };

  return (
    <div className="kirby-shop login-page">
      <Header />
      <main style={{ minHeight: '80vh', paddingTop: 60 }}>
        <LoginForm onLogin={handleLogin} loading={isLoading} error={loginError || error} />
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
