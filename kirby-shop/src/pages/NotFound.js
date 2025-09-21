import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="not-found-page">
        <div className="not-found-container">
          {/* 커비 404 일러스트 */}
          <div className="kirby-404">
            <div className="kirby-face">
              <div className="kirby-eyes">
                <div className="eye left"></div>
                <div className="eye right"></div>
              </div>
              <div className="kirby-mouth">?</div>
            </div>
            <div className="kirby-body">
              <div className="kirby-feet">
                <div className="foot left"></div>
                <div className="foot right"></div>
              </div>
            </div>
          </div>

          {/* 404 텍스트 */}
          <div className="error-content">
            <h1 className="error-code">404</h1>
            <h2 className="error-title">페이지를 찾을 수 없습니다</h2>
            <p className="error-description">
              죄송합니다. 요청하신 페이지가 존재하지 않거나<br/>
              이동되었을 수 있습니다.
            </p>

            {/* 액션 버튼들 */}
            <div className="action-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate('/')}
              >
                <Home size={20} />
                홈으로 돌아가기
              </button>
              
              <button 
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
                이전 페이지
              </button>
            </div>

            {/* 도움말 섹션 */}
            <div className="help-section">
              <h3>도움이 필요하신가요?</h3>
              <div className="help-links">
                <button 
                  className="help-link"
                  onClick={() => navigate('/')}
                >
                  <Search size={16} />
                  상품 검색
                </button>
                <button 
                  className="help-link"
                  onClick={() => navigate('/qna')}
                >
                  <AlertCircle size={16} />
                  문의하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
