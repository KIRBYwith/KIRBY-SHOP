import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  Star, 
  Award, 
  Calendar,
  ArrowRight,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  MessageCircle
} from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/PointsPage.css';

const PointsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [points, setPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      // 사용자 포인트 정보 로드
      setPoints(user?.points || 0);
      
      // 포인트 히스토리 로드 (임시 데이터)
      setPointHistory([
        {
          id: 1,
          type: 'earn',
          amount: 1000,
          description: '회원가입 보너스',
          date: '2024-01-15',
          status: 'completed'
        },
        {
          id: 2,
          type: 'earn',
          amount: 500,
          description: '첫 구매 보너스',
          date: '2024-01-20',
          status: 'completed'
        },
        {
          id: 3,
          type: 'spend',
          amount: -200,
          description: '상품 구매 시 사용',
          date: '2024-01-25',
          status: 'completed'
        },
        {
          id: 4,
          type: 'earn',
          amount: 300,
          description: '리뷰 작성 보너스',
          date: '2024-01-30',
          status: 'completed'
        }
      ]);
    }
    setLoading(false);
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="points-page-wrapper">
        <Header />
        <div className="points-login-required">
          <div className="login-required-container">
            <div className="login-required-icon">
              <Coins size={64} />
            </div>
            <h2>포인트를 확인하려면 로그인이 필요합니다</h2>
            <p>로그인 후 포인트 적립 및 사용 내역을 확인할 수 있습니다.</p>
            <button 
              className="login-btn"
              onClick={() => window.location.href = '/login'}
            >
              로그인하기
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="points-page-wrapper">
        <Header />
        <div className="points-loading">
          <div className="loading-spinner"></div>
          <p>포인트 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const totalEarned = pointHistory
    .filter(item => item.type === 'earn')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSpent = Math.abs(pointHistory
    .filter(item => item.type === 'spend')
    .reduce((sum, item) => sum + item.amount, 0));

  return (
    <div className="points-page-wrapper">
      <Header />
      <div className="points-main-container">
        {/* 포인트 헤더 */}
        <div className="points-header">
          <div className="points-header-content">
            <div className="points-icon">
              <Coins size={48} />
            </div>
            <div className="points-info">
              <h1>내 포인트</h1>
              <div className="current-points">
                <span className="points-amount">{points.toLocaleString()}</span>
                <span className="points-unit">P</span>
              </div>
            </div>
          </div>
        </div>

        {/* 포인트 통계 */}
        <div className="points-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">총 적립</span>
              <span className="stat-value">{totalEarned.toLocaleString()}P</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Gift size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">총 사용</span>
              <span className="stat-value">{totalSpent.toLocaleString()}P</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">등급</span>
              <span className="stat-value">{user?.grade || '일반회원'}</span>
            </div>
          </div>
        </div>

        {/* 포인트 적립 방법 */}
        <div className="points-earn-section">
          <h2>포인트 적립 방법</h2>
          <div className="earn-methods">
            <div className="earn-method">
              <div className="method-icon">
                <ShoppingCart size={24} />
              </div>
              <div className="method-content">
                <h3>상품 구매</h3>
                <p>구매 금액의 1% 적립</p>
              </div>
            </div>
            <div className="earn-method">
              <div className="method-icon">
                <MessageCircle size={24} />
              </div>
              <div className="method-content">
                <h3>리뷰 작성</h3>
                <p>리뷰 작성 시 100P 적립</p>
              </div>
            </div>
            <div className="earn-method">
              <div className="method-icon">
                <Award size={24} />
              </div>
              <div className="method-content">
                <h3>이벤트 참여</h3>
                <p>이벤트 참여 시 포인트 지급</p>
              </div>
            </div>
          </div>
        </div>

        {/* 포인트 히스토리 */}
        <div className="points-history-section">
          <h2>포인트 사용 내역</h2>
          <div className="history-list">
            {pointHistory.length > 0 ? (
              pointHistory.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-icon">
                    {item.type === 'earn' ? (
                      <Plus size={20} className="earn-icon" />
                    ) : (
                      <Minus size={20} className="spend-icon" />
                    )}
                  </div>
                  <div className="history-content">
                    <div className="history-description">{item.description}</div>
                    <div className="history-date">{item.date}</div>
                  </div>
                  <div className="history-amount">
                    <span className={`amount ${item.type}`}>
                      {item.type === 'earn' ? '+' : ''}{item.amount.toLocaleString()}P
                    </span>
                    <div className="history-status">
                      {item.status === 'completed' ? (
                        <CheckCircle size={16} className="completed-icon" />
                      ) : (
                        <Clock size={16} className="pending-icon" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-history">
                <AlertCircle size={48} />
                <p>포인트 사용 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 포인트 사용 안내 */}
        <div className="points-info-section">
          <h2>포인트 사용 안내</h2>
          <div className="info-content">
            <div className="info-item">
              <div className="info-icon">
                <CheckCircle size={20} />
              </div>
              <p>포인트는 1P = 1원으로 사용할 수 있습니다.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <CheckCircle size={20} />
              </div>
              <p>포인트는 구매 시 현금처럼 사용할 수 있습니다.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <CheckCircle size={20} />
              </div>
              <p>적립된 포인트는 2년 후 자동 소멸됩니다.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <CheckCircle size={20} />
              </div>
              <p>포인트는 현금으로 환불되지 않습니다.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PointsPage;
