// src/pages/MyPage.js

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Star, ChevronRight, Gift, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/MyPage.css';

const MyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 로그아웃시 홈으로 리디렉트
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 만약 로그인 안되어 있을 때 예외처리
  if (!user) {
    return (
      <>
        <Header />
        <div className="mypage-container">
          <div className="mypage-box">
            <p>로그인이 필요합니다.</p>
            <button className="btn" onClick={() => navigate('/login')}>로그인하러 가기</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mypage-container">
        <div className="mypage-profile">
        <div className="profile-main">
          <User size={36} className="profile-icon" />
          <div className="profile-info">
            <span className="profile-name">{user.name || '닉네임 없음'}</span>
            <span className={`profile-grade ${user.grade}`}>{user.grade || ''}</span>
          </div>
        </div>
        {/* (예시) 프로필 이미지 들어가면 <img src={user.profileImage} ... /> 추가 */}
        </div>
        <div className="mypage-menu">
        <button className="menu-item" onClick={() => navigate('/orders')}>
          <Gift size={18} />
          <span>주문내역</span>
          <ChevronRight size={16} />
        </button>
        <button className="menu-item" onClick={() => navigate('/coupon')}>
          <Star size={18} />
          <span>쿠폰함</span>
          <ChevronRight size={16} />
        </button>
        {/* (예시) 포인트·내정보 등 확장 가능 */}
        <button className="menu-item" style={{ color: '#ff5656' }} onClick={handleLogout}>
          <LogOut size={18} />
          <span>로그아웃</span>
        </button>
        </div>
        {/* 추가: 회원 탈퇴, 프로필 수정 등 */}
      </div>
      <Footer />
    </>
  );
};

export default MyPage;
