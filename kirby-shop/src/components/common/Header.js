// src/components/common/Header.js

import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, User, Menu, Sparkles } from 'lucide-react';
import SearchBox from './SearchBox';

const Header = ({ 
  isLoggedIn, 
  user, 
  wishlistCount, 
  cartCount, 
  onLoginClick, 
  onLogout,
  onSearchSubmit 
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleUserClick = () => {
    if (isLoggedIn) {
      // 사용자 메뉴 드롭다운 토글 또는 마이페이지로 이동
      console.log('마이페이지로 이동');
    } else {
      onLoginClick();
    }
  };

  return (
    <nav className="navbar">
      {/* 로고 영역 */}
      <div className="nav-left">
        <div className="logo">
          <Star className="logo-icon" />
          <span>KIRBY-SHOP</span>
          <Sparkles className="logo-icon" />
        </div>
      </div>
      
      {/* 검색 영역 */}
      <div className="nav-center">
        <SearchBox onSearchSubmit={onSearchSubmit} />
      </div>

      {/* 사용자 메뉴 영역 */}
      <div className="nav-right">
        {/* 모바일 메뉴 버튼 */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
        
        {/* 네비게이션 버튼들 */}
        <div className={`nav-buttons ${showMobileMenu ? 'show' : ''}`}>
          {/* 사용자 정보 또는 로그인 버튼 */}
          {isLoggedIn ? (
            <div className="user-menu">
              <button className="nav-button user-button" onClick={handleUserClick}>
                <User size={20} />
                <span className="user-name">{user?.name || '사용자'}님</span>
              </button>
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={() => console.log('마이페이지')}>
                  마이페이지
                </button>
                <button className="dropdown-item" onClick={() => console.log('주문내역')}>
                  주문내역
                </button>
                <button className="dropdown-item" onClick={() => console.log('쿠폰함')}>
                  쿠폰함
                </button>
                <button className="dropdown-item logout" onClick={onLogout}>
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <button className="nav-button" onClick={onLoginClick}>
              <User size={20} />
              <span>로그인</span>
            </button>
          )}
          
          {/* 찜목록 버튼 */}
          <button 
            className="nav-button"
            onClick={() => console.log('찜목록 페이지로 이동')}
          >
            <Heart size={20} />
            <span>찜</span>
            {wishlistCount > 0 && (
              <span className="badge">{wishlistCount}</span>
            )}
          </button>
          
          {/* 장바구니 버튼 */}
          <button 
            className="nav-button"
            onClick={() => console.log('장바구니 페이지로 이동')}
          >
            <ShoppingCart size={20} />
            <span>장바구니</span>
            {cartCount > 0 && (
              <span className="badge">{cartCount}</span>
            )}
          </button>

          {/* 회원등급 표시 (로그인 시에만) */}
          {isLoggedIn && user?.grade && (
            <div className="user-grade">
              <span className={`grade-badge ${user.grade}`}>
                {user.grade}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 오버레이 */}
      {showMobileMenu && (
        <div 
          className="mobile-overlay" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </nav>
  );
};

export default Header;