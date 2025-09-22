// src/components/navigation/Navbar.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Heart, ShoppingCart, Menu } from "lucide-react";
import UserMenu from "../user/UserMenu";
import CartIcon from "../cart/CartIcon";
import "../styles/MainPage.css";
import SearchBox from "../common/SearchBox";

const Navbar = ({
  isLoggedIn,
  user,
  wishlistCount = 0,
  cartCount = 0,
  onLogin,
  onLogout,
  onMyPage,
  onOrderList,
  onCoupon,
  onGoWishlist,
  onGoCart,
  onLogoClick,
  onSearchSubmit,
  children,
  showMenuBtn = false,
  onMenuBtnClick,
}) => {
  const navigate = useNavigate();
  // Goto 대신 Link, 필요시 navigate 사용
  return (
    <nav className="navbar">
      {/* 햄버거 메뉴(모바일용) */}
      {showMenuBtn && (
        <button className="mobile-menu-btn" onClick={onMenuBtnClick}>
          <Menu size={24} />
        </button>
      )}

      {/* 로고 (클릭: 홈 이동, onLogoClick 시 콜백 실행 후 이동도 가능) */}
      <Link
        to="/"
        className="logo"
        onClick={e => {
          if (onLogoClick) {
            e.preventDefault();
            onLogoClick();
          }
        }}
        style={{ textDecoration: "none" }}
      >
        <Sparkles className="logo-icon" />
        <span>KIRBY-SHOP</span>
      </Link>

      {/* 검색창 */}
      <SearchBox onSearchSubmit={onSearchSubmit} />

      {/* 네비게이션 버튼들 */}
      <div className="nav-buttons">
        {/* UserMenu가 더 복잡한 사용자/마이/드롭다운이면 여기서 불러쓰기 */}
        {/* <UserMenu ... /> */}
        {/* 로그인/마이페이지 구간 */}
        {isLoggedIn ? (
          // "000님" 클릭시 마이페이지 이동
          <Link to="/mypage" className="nav-button">
            {user?.name || "사용자"}님
          </Link>
        ) : (
          <Link to="/login" className="nav-button">
            로그인
          </Link>
        )}

        {/* 찜목록 SPA 이동 */}
        <Link to="/wishlist" className="nav-button">
          <Heart size={20} />
          <span>찜</span>
          {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
        </Link>

        {/* 장바구니 SPA 이동 */}
        <Link to="/cart" className="nav-button">
          <ShoppingCart size={20} />
          <span>장바구니</span>
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </Link>
      </div>

      {children && children}
    </nav>
  );
};

export default Navbar;
