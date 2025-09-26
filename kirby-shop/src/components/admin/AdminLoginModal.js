import React, { useState } from 'react';
import { X, Shield, Key, AlertTriangle } from 'lucide-react';
import '../../styles/admin/AdminLoginModal.css';

const AdminLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onLogin(loginData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-modal">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <Shield size={24} />
            </div>
            <div>
              <h2>🔐 관리자 전용 로그인</h2>
              <p>Kirby Shop 관리 시스템에 접근하려면 관리자 인증이 필요합니다.</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 모달 콘텐츠 */}
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label>
                <Key size={16} />
                관리자 이메일
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                className="admin-form-input"
                placeholder="admin@test.com"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>
                <Key size={16} />
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                className="admin-form-input"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {/* 테스트 계정 정보 */}
            <div className="test-account-info">
              <h4>📋 테스트 계정 정보</h4>
              <div className="account-detail">
                <strong>이메일:</strong> admin@test.com
              </div>
              <div className="account-detail">
                <strong>비밀번호:</strong> admin123
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '관리자 로그인'}
            </button>
          </form>

          {/* 보안 안내 */}
          <div className="security-notice">
            <h4>
              <AlertTriangle size={16} />
              보안 안내
            </h4>
            <ul>
              <li>무단 접근 시 법적 처벌을 받을 수 있습니다</li>
              <li>관리자 권한이 없는 경우 즉시 페이지를 닫아주세요</li>
              <li>모든 접근 기록이 로그로 남습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
