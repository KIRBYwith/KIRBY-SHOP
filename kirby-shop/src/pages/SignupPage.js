// src/pages/SignupPage.js

import React, { useState } from 'react';
import '../styles/MainPage.css';
import '../styles/LoginModal.css';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';

// 상단 풍성한 이벤트배너
const SignupEventBanner = () => (
  <div className="welcome-message" style={{
    background: 'linear-gradient(90deg, #ffe9f5 0%, #f8e7ff 100%)',
    borderRadius: 18, marginBottom: 17, padding: '0.9rem 0.7rem'
  }}>
    <span style={{
      background: '#ff69b4', color: '#fff', fontWeight: 700, fontSize: '1.09rem',
      borderRadius: 11, padding: '4px 15px', marginRight: 14, letterSpacing: 1
    }}>
      NEW 회원혜택
    </span>
    <span style={{ fontWeight: 700, color: '#8b1a83' }}>
      20% 웰컴쿠폰
    </span>
    <span style={{ color: "#ff8c42", fontWeight: "600", margin: "0 6px" }}>
      선착순 랜덤굿즈 추첨
    </span>
    <span style={{ color: "#3757ff", marginRight: 7, fontWeight: 600 }}>
      가입 시 2,000P 즉시적립!
    </span>
    <span style={{
      marginLeft: 9, background: "#ffe100",
      color: "#da174e", fontWeight: 700,
      fontSize: "1rem", borderRadius: 9, padding: "3px 12px"
    }}>
      D-1 이벤트마감
    </span>
  </div>
);

const SignupForm = ({ onSignup, loading, error }) => {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    agreeAll: false,
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [pwError, setPwError] = useState('');

  const handleChange = e => {
    const { name, type, checked, value } = e.target;
    setValues(v => ({
      ...v,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'password' || name === 'password2') setPwError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (values.password !== values.password2) {
      setPwError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!values.agreeTerms || !values.agreePrivacy) {
      setPwError('필수 약관 동의해 주세요.');
      return;
    }
    const signupData = {
      name: values.name,
      email: values.email,
      password: values.password,
      agreeMarketing: values.agreeMarketing,
    };
    onSignup(signupData);
  };

  const handleAllCheck = e => {
    const checked = e.target.checked;
    setValues(v => ({
      ...v,
      agreeAll: checked,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
    }));
  };

  return (
    <div className="login-container">
      <div className="page-header">
        <div className="page-title">
          <span className="title-icon" style={{ color: "#ffd700" }}>🎈</span>
          <h2 style={{ fontWeight: 800 }}>회원가입</h2>
          <span style={{
            marginLeft: 12, background: "#fffbe8", color: "#d68b00",
            borderRadius: 11, padding: "4px 7px", fontWeight: 700, fontSize: "1.07rem"
          }}>
            선착순 웰컴박스 지급🎁
          </span>
        </div>
      </div>
      <SignupEventBanner />
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="welcome-message">
          <h3 style={{ color: '#fd4766' }}>
            오늘 가입 시! 특별한 신규혜택 모두 드려요 🥤
          </h3>
          <div className="signup-benefits" style={{ fontSize: "1.03rem", marginBottom: 5 }}>
            <span style={{ background: "#fff3fa", color: "#fd4766" }}>✨ 20% 쿠폰 자동 지급</span>
            <span style={{ background: "#e8fafe", color: "#2ca6b6" }}>💬 가입시 2,000포인트</span>
            <span style={{ background: "#faf1ff", color: "#8b1a83" }}>🌟 랜덤 한정굿즈 추첨 응모권</span>
            <span style={{ background: "#fffae8", color: "#d68b00" }}>D-1 이벤트마감 / 오늘마지막</span>
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="signup-name">이름</label>
          <div className="input-wrapper">
            <input
              id="signup-name"
              name="name"
              type="text"
              className="login-input"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="이름"
              autoComplete="name"
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="signup-email">이메일</label>
          <div className="input-wrapper">
            <input
              id="signup-email"
              name="email"
              type="email"
              className="login-input"
              value={values.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
              autoComplete="email"
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="signup-password">비밀번호</label>
          <div className="input-wrapper">
            <input
              id="signup-password"
              name="password"
              type="password"
              className="login-input"
              value={values.password}
              onChange={handleChange}
              required
              placeholder="비밀번호"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="signup-password2">비밀번호 확인</label>
          <div className="input-wrapper">
            <input
              id="signup-password2"
              name="password2"
              type="password"
              className="login-input"
              value={values.password2}
              onChange={handleChange}
              required
              placeholder="비밀번호 확인"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
        </div>
        <div className="agreement-section">
          <div className="agreement-all">
            <label className="agreement-item" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={values.agreeAll}
                onChange={handleAllCheck}
              />
              <span className="checkmark"></span>
              <span className="agreement-text">전체 약관 동의</span>
            </label>
          </div>
          <label className="agreement-item required" style={{ cursor: 'pointer' }}>
            <input
              name="agreeTerms"
              type="checkbox"
              checked={values.agreeTerms}
              onChange={handleChange}
              required
            />
            <span className="checkmark"></span>
            <span className="agreement-text">이용약관 동의 (필수)</span>
            <button
              type="button"
              className="view-terms"
              onClick={() => alert('이용약관 본문은 준비중입니다.')}
            >
              보기
            </button>
          </label>
          <label className="agreement-item required" style={{ cursor: 'pointer' }}>
            <input
              name="agreePrivacy"
              type="checkbox"
              checked={values.agreePrivacy}
              onChange={handleChange}
              required
            />
            <span className="checkmark"></span>
            <span className="agreement-text">개인정보 수집 및 이용 동의 (필수)</span>
            <button
              type="button"
              className="view-terms"
              onClick={() => alert('개인정보방침 본문은 준비중입니다.')}
            >
              보기
            </button>
          </label>
          <label className="agreement-item" style={{ cursor: 'pointer' }}>
            <input
              name="agreeMarketing"
              type="checkbox"
              checked={values.agreeMarketing}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            <span className="agreement-text">마케팅/이벤트 정보 수신 동의 (선택, 즉시 할인추가증정!)</span>
          </label>
        </div>
        {(error || pwError) && (
          <div className="submit-error">{error || pwError}</div>
        )}
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? <span className="spinner spinning" /> : '가입하고 혜택 받기'}
        </button>
        <div className="bottom-links">
          <p>
            이미 계정이 있으신가요?{' '}
            <a className="link-button" href="/login">로그인</a>
          </p>
        </div>
      </form>
    </div>
  );
};

const SignupPage = () => {
  const { signup, isLoading, error } = useAuth();
  const [signupError, setSignupError] = useState(null);

  const handleSignup = async (signupData) => {
    setSignupError(null);
    const result = await signup(signupData);
    if (!result.success) setSignupError(result.message);
    // 성공시 welcome 모달/페이지 이동 등 자유 구현
  };

  return (
    <div className="kirby-shop login-page">
      <Header />
      <main style={{ minHeight: '80vh', paddingTop: 60 }}>
        <SignupForm onSignup={handleSignup} loading={isLoading} error={signupError || error} />
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;
