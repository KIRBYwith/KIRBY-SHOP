import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/AdminAccessPage.css';

const AdminAccessPage = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  const handleAccessAdmin = () => {
    setShowWarning(true);
  };

  const handleConfirmAccess = () => {
    navigate('/admin/dashboard');
  };

  const handleCancelAccess = () => {
    setShowWarning(false);
  };

  return (
    <div className="admin-access-page">
      <Header />
      
      <div className="admin-access-container">
        <div className="admin-access-card">
          <div className="admin-access-header">
            <h1>🔐 관리자 페이지</h1>
            <p className="admin-access-subtitle">Kirby Shop 관리 시스템</p>
          </div>

          <div className="admin-access-content">
            <div className="access-info">
              <h2>⚠️ 접근 경고</h2>
              <p>이 페이지는 <strong>관리자 전용</strong> 페이지입니다.</p>
              <p>무단 접근 시 법적 처벌을 받을 수 있습니다.</p>
            </div>

            <div className="legal-warning">
              <h3>🚨 법적 경고</h3>
              <ul>
                <li><strong>정보통신망법 제48조의2</strong>: 무단 침입 시 3년 이하의 징역 또는 3천만원 이하의 벌금</li>
                <li><strong>개인정보보호법 제71조</strong>: 개인정보 무단 수집·이용 시 5년 이하의 징역 또는 5천만원 이하의 벌금</li>
                <li><strong>형법 제361조</strong>: 업무방해죄로 인한 형사처벌 가능</li>
              </ul>
            </div>

            <div className="access-controls">
              {!showWarning ? (
                <button 
                  className="admin-access-btn"
                  onClick={handleAccessAdmin}
                >
                  관리자 페이지 접근
                </button>
              ) : (
                <div className="warning-confirmation">
                  <div className="warning-message">
                    <h3>⚠️ 최종 경고</h3>
                    <p>관리자 권한이 없으신 경우 즉시 페이지를 닫아주세요.</p>
                    <p>계속 진행하시겠습니까?</p>
                  </div>
                  <div className="warning-buttons">
                    <button 
                      className="confirm-btn"
                      onClick={handleConfirmAccess}
                    >
                      네, 계속합니다
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancelAccess}
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-info">
              <h3>📋 관리자 정보</h3>
              <p><strong>관리자 ID:</strong> admin@kirby-shop.com</p>
              <p><strong>접근 권한:</strong> 시스템 관리자</p>
              <p><strong>마지막 로그인:</strong> {new Date().toLocaleString('ko-KR')}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminAccessPage;



