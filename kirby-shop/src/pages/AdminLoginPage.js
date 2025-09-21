import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/AdminLoginPage.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 관리자 계정 정보 (평문으로 저장)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 초기화
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 입력값 검증
      if (!formData.username.trim() || !formData.password.trim()) {
        setError('아이디와 비밀번호를 모두 입력해주세요.');
        setIsLoading(false);
        return;
      }

      // 관리자 계정 확인
      if (formData.username === ADMIN_CREDENTIALS.username && 
          formData.password === ADMIN_CREDENTIALS.password) {
        
        // 로그인 성공 - 관리자 세션 저장
        const adminSession = {
          isAdmin: true,
          username: formData.username,
          loginTime: new Date().toISOString(),
          role: 'admin'
        };
        
        localStorage.setItem('kirby-shop-admin-session', JSON.stringify(adminSession));
        
        // 관리자 페이지로 이동
        navigate('/admin/dashboard');
        
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Admin login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="page-container admin-login-page">
      <Header />
      <div className="page-content">
        <main className="admin-login-main">
          <div className="login-container">
            <div className="login-header">
              <div className="admin-icon">⚙️</div>
              <h1 className="login-title">관리자 로그인</h1>
              <p className="login-subtitle">
                Kirby-shop의 관리자페이지에 오신것을 환영합니다
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  관리자 아이디
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="관리자 아이디를 입력하세요"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    로그인 중...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🔐</span>
                    관리자 로그인
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <div className="admin-info">
                <h3>관리자 계정 정보</h3>
                <div className="account-details">
                  <div className="account-item">
                    <span className="account-label">아이디:</span>
                    <span className="account-value">{ADMIN_CREDENTIALS.username}</span>
                  </div>
                  <div className="account-item">
                    <span className="account-label">비밀번호:</span>
                    <span className="account-value">{ADMIN_CREDENTIALS.password}</span>
                  </div>
                </div>
              </div>
              
              <div className="security-notice">
                <div className="notice-icon">🛡️</div>
                <div className="notice-content">
                  <h4>보안 안내</h4>
                  <p>관리자 페이지는 중요한 시스템 관리 기능을 포함하고 있습니다. 안전한 환경에서만 접속하시기 바랍니다.</p>
                </div>
              </div>
            </div>

            <div className="back-to-site">
              <button 
                onClick={() => navigate('/')}
                className="back-button"
              >
                <span className="back-icon">🏠</span>
                메인 사이트로 돌아가기
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLoginPage;
