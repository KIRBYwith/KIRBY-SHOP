// src/components/common/Header.js

import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, User, Menu, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBox from './SearchBox';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({
  wishlistCount = 0,
  cartCount = 0,  // cartItemCount → cartCount로 통일
  onSearch,
  onCartClick,      // 추가
  onWishlistClick   // 추가
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);
  const handleUserClick = () => setDropdownOpen(!dropdownOpen);

  // 외부 클릭시 드롭다운 닫힘
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      const menu = document.querySelector('.user-menu');
      if (menu && !menu.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // 로그아웃 후 홈으로 이동
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  // 로그인 클릭
  const handleLoginClick = () => {
    navigate('/login');
  };

  // 마이페이지 이동
  const handleMyPageClick = () => {
    setDropdownOpen(false);
    navigate('/mypage');
  };

  return (
    <nav className="navbar">
      {/* 1. 로고 클릭 → 홈 */}
      <div className="nav-left">
        <Link to="/" className="logo">
          <Star className="logo-icon" />
          <span>KIRBY-SHOP</span>
          <Sparkles className="logo-icon" />
        </Link>
      </div>

      {/* 2. 검색 */}
      <div className="nav-center">
        <SearchBox onSearchSubmit={onSearch} />
      </div>

      {/* 3. 사용자 메뉴/모바일 메뉴 버튼 */}
      <div className="nav-right">
        {/* 모바일 메뉴버튼 */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>

        {/* 네비버튼들 */}
        <div className={`nav-buttons ${showMobileMenu ? 'show' : ''}`}>
          {/* 로그인/유저 드롭다운 */}
          {isAuthenticated ? (
            <div className="user-menu" tabIndex={0}>
              <button
                className="nav-button user-button"
                onClick={handleUserClick}
                type="button"
              >
                <User size={20} />
                <span className="user-name">{user?.name ? user.name : '닉네임 없음'}</span>
              </button>
              {/* 드롭다운: 항상 유지, 상태로 open 제어 */}
              <div className={`user-dropdown${dropdownOpen ? ' open' : ''}`}>
                {dropdownOpen && (
                  <>
                    <button
                      className="dropdown-item"
                      onClick={handleMyPageClick}
                      type="button"
                    >
                      마이페이지
                    </button>
                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      주문내역
                    </Link>
                    <Link
                      to="/coupon"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      쿠폰함
                    </Link>
                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                      type="button"
                    >
                      로그아웃
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <button
              className="nav-button"
              onClick={handleLoginClick}
              type="button"
            >
              <User size={20} />
              <span>로그인</span>
            </button>
          )}

          {/* 찜 버튼 */}
          <Link to="/wishlist" className="nav-button" onClick={onWishlistClick}>
            <Heart size={20} />
            <span>찜</span>
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </Link>

          {/* 장바구니 버튼 */}
          <Link to="/cart" className="nav-button" onClick={onCartClick}>
            <ShoppingCart size={20} />
            <span>장바구니</span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {/* 회원등급 */}
          {isAuthenticated && user?.grade && (
            <div className="user-grade">
              <span className={`grade-badge ${user.grade}`}>{user.grade}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. 모바일 오버레이 */}
      {showMobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
          aria-label="모바일 메뉴 닫기"
        />
      )}
    </nav>
  );
};

export default Header;
