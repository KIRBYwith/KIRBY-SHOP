// src/components/auth/LoginModal.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Star, Sparkles, Eye, EyeOff, Mail, Lock, 
  User, Phone, Calendar, Gift, AlertCircle, CheckCircle 
} from 'lucide-react';

const LoginModal = ({ 
  isOpen, 
  onClose, 
  onLogin, 
  onSignup,
  onSocialLogin,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    birthDate: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);
  const emailInputRef = useRef(null);

  // 모달 열림 시 포커스 및 초기화
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      // 모달 닫힐 때 폼 초기화
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        birthDate: '',
        agreeTerms: false,
        agreePrivacy: false,
        agreeMarketing: false
      });
      setErrors({});
      setActiveTab('login');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 이메일 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검사
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    // 회원가입 시 추가 검사
    if (activeTab === 'signup') {
      // 비밀번호 확인
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }

      // 이름 검사
      if (!formData.name) {
        newErrors.name = '이름을 입력해주세요.';
      } else if (formData.name.length < 2) {
        newErrors.name = '이름은 2자 이상이어야 합니다.';
      }

      // 휴대폰 번호 검사
      const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
      if (!formData.phone) {
        newErrors.phone = '휴대폰 번호를 입력해주세요.';
      } else if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
        newErrors.phone = '올바른 휴대폰 번호를 입력해주세요.';
      }

      // 필수 약관 동의
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = '이용약관에 동의해주세요.';
      }
      if (!formData.agreePrivacy) {
        newErrors.agreePrivacy = '개인정보처리방침에 동의해주세요.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 제출
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (onLogin) {
        await onLogin({
          email: formData.email,
          password: formData.password
        });
      }
    } catch (error) {
      setErrors({ submit: error.message || '로그인에 실패했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 회원가입 제출
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (onSignup) {
        await onSignup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          birthDate: formData.birthDate,
          agreeMarketing: formData.agreeMarketing
        });
      }
    } catch (error) {
      setErrors({ submit: error.message || '회원가입에 실패했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 소셜 로그인
  const handleSocialLogin = (provider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  // 전체 동의 체크박스
  const handleAgreeAll = (checked) => {
    setFormData(prev => ({
      ...prev,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div 
        className="login-modal"
        onClick={e => e.stopPropagation()}
        ref={modalRef}
      >
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title">
            <Star className="title-icon" />
            <h2>
              {activeTab === 'login' ? '커비숍 로그인' : '커비숍 회원가입'}
            </h2>
            <Sparkles className="title-icon" />
          </div>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="모달 닫기"
          >
            <X size={24} />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="tab-menu">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            로그인
          </button>
          <button
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            회원가입
          </button>
        </div>

        {/* 폼 컨테이너 */}
        <div className="form-container">
          {/* 로그인 폼 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="login-form">
              <div className="welcome-message">
                <h3>🌟 환영합니다! 🌟</h3>
                <p>커비와 함께하는 특별한 쇼핑을 시작해보세요</p>
              </div>

              {/* 이메일 입력 */}
              <div className="input-group">
                <label htmlFor="email">이메일</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    ref={emailInputRef}
                    type="email"
                    id="email"
                    name="email"
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    required
                  />
                </div>
                {errors.email && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div className="input-group">
                <label htmlFor="password">비밀번호</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.password}
                  </span>
                )}
              </div>

              {/* 로그인 옵션 */}
              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  로그인 상태 유지
                </label>
                <button type="button" className="forgot-password">
                  비밀번호 찾기
                </button>
              </div>

              {/* 에러 메시지 */}
              {errors.submit && (
                <div className="submit-error">
                  <AlertCircle size={16} />
                  {errors.submit}
                </div>
              )}

              {/* 로그인 버튼 */}
              <button 
                type="submit" 
                className="submit-button login"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    로그인 중...
                  </>
                ) : (
                  <>
                    <Star size={20} />
                    로그인
                  </>
                )}
              </button>
            </form>
          )}

          {/* 회원가입 폼 */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="signup-form">
              <div className="welcome-message">
                <h3>🎉 커비숍에 오신 것을 환영합니다! 🎉</h3>
                <p>회원가입하고 특별한 혜택을 받아보세요</p>
                <div className="signup-benefits">
                  <span><Gift size={16} /> 신규 회원 20% 할인쿠폰</span>
                  <span>🎁 생일 축하 쿠폰</span>
                  <span>⭐ 적립금 혜택</span>
                </div>
              </div>

              {/* 이메일 */}
              <div className="input-group">
                <label htmlFor="signup-email">이메일 *</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    required
                  />
                </div>
                {errors.email && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* 비밀번호 */}
              <div className="input-group">
                <label htmlFor="signup-password">비밀번호 *</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    name="password"
                    placeholder="8자 이상 입력하세요"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.password}
                  </span>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className="input-group">
                <label htmlFor="confirm-password">비밀번호 확인 *</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* 이름 */}
              <div className="input-group">
                <label htmlFor="name">이름 *</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    required
                  />
                </div>
                {errors.name && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.name}
                  </span>
                )}
              </div>

              {/* 휴대폰 번호 */}
              <div className="input-group">
                <label htmlFor="phone">휴대폰 번호 *</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={20} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    required
                  />
                </div>
                {errors.phone && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* 생년월일 */}
              <div className="input-group">
                <label htmlFor="birthDate">생년월일 (선택)</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={20} />
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="agreement-section">
                <div className="agreement-all">
                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms && formData.agreePrivacy && formData.agreeMarketing}
                      onChange={(e) => handleAgreeAll(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <span className="agreement-text">전체 동의</span>
                  </label>
                </div>

                <div className="agreement-items">
                  <label className="agreement-item required">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <span className="agreement-text">
                      [필수] 이용약관 동의
                      <button type="button" className="view-terms">보기</button>
                    </span>
                  </label>

                  <label className="agreement-item required">
                    <input
                      type="checkbox"
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <span className="agreement-text">
                      [필수] 개인정보처리방침 동의
                      <button type="button" className="view-terms">보기</button>
                    </span>
                  </label>

                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      name="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <span className="agreement-text">
                      [선택] 마케팅 정보 수신 동의
                    </span>
                  </label>
                </div>

                {(errors.agreeTerms || errors.agreePrivacy) && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    필수 약관에 동의해주세요.
                  </span>
                )}
              </div>

              {/* 에러 메시지 */}
              {errors.submit && (
                <div className="submit-error">
                  <AlertCircle size={16} />
                  {errors.submit}
                </div>
              )}

              {/* 회원가입 버튼 */}
              <button 
                type="submit" 
                className="submit-button signup"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    가입 중...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    회원가입
                  </>
                )}
              </button>
            </form>
          )}

          {/* 소셜 로그인 */}
          <div className="social-login-section">
            <div className="divider">
              <span>또는</span>
            </div>

            <div className="social-buttons">
              <button 
                type="button"
                className="social-button google"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <span className="social-icon">🔍</span>
                구글로 {activeTab === 'login' ? '로그인' : '회원가입'}
              </button>

              <button 
                type="button"
                className="social-button kakao"
                onClick={() => handleSocialLogin('kakao')}
                disabled={loading}
              >
                <span className="social-icon">💬</span>
                카카오로 {activeTab === 'login' ? '로그인' : '회원가입'}
              </button>

              <button 
                type="button"
                className="social-button naver"
                onClick={() => handleSocialLogin('naver')}
                disabled={loading}
              >
                <span className="social-icon">🟢</span>
                네이버로 {activeTab === 'login' ? '로그인' : '회원가입'}
              </button>
            </div>
          </div>

          {/* 하단 링크 */}
          <div className="bottom-links">
            {activeTab === 'login' ? (
              <p>
                아직 회원이 아니신가요?{' '}
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => setActiveTab('signup')}
                >
                  회원가입하기
                </button>
              </p>
            ) : (
              <p>
                이미 회원이신가요?{' '}
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => setActiveTab('login')}
                >
                  로그인하기
                </button>
              </p>
            )}

            <div className="help-links">
              <button type="button" className="help-link">아이디 찾기</button>
              <span className="separator">|</span>
              <button type="button" className="help-link">비밀번호 찾기</button>
              <span className="separator">|</span>
              <button type="button" className="help-link">고객센터</button>
            </div>
          </div>

          {/* 로딩 오버레이 */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <Sparkles className="spinning" size={32} />
                <p>처리 중입니다...</p>
              </div>
            </div>
          )}
        </div>

        {/* 커비 캐릭터 장식 */}
        <div className="kirby-decoration">
          <div className="kirby-float kirby-1">🌟</div>
          <div className="kirby-float kirby-2">💖</div>
          <div className="kirby-float kirby-3">✨</div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;