// src/components/navigation/Navbar.js

import React from "react";
import { Sparkles, Heart, ShoppingCart, Menu } from "lucide-react";
import UserMenu from "../user/UserMenu";
import CartIcon from "../cart/CartIcon";
import "../styles/MainPage.css"; // 혹시 css 분리라면 import '../../styles/MainPage.css'
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
  return (
    <nav className="navbar" style={{ background: "linear-gradient(135deg,#ff69b4 0%,#ff1493 100%)", color: "#fff", position: "sticky", top: 0, zIndex: 1000 }}>
      <div className="nav-left" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {showMenuBtn && (
          <button className="mobile-menu-btn" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginRight: "8px" }} onClick={onMenuBtnClick} aria-label="메뉴 열기">
            <Menu size={28} />
          </button>
        )}
        <a
          className="logo"
          style={{ display: "flex", alignItems: "center", fontWeight: 800, fontSize: "2rem", color: "#fff", textDecoration: "none", gap: 8, cursor: "pointer" }}
          href="/"
          onClick={e => { onLogoClick && (e.preventDefault(), onLogoClick()); }}
        >
          <Sparkles className="logo-icon" size={30} style={{ color: "#fff200", filter: "drop-shadow(0 0 8px #fff20088)" }} />
          KIRBY-SHOP
        </a>
      </div>
      <div className="nav-center" style={{ flex: 2, display: "flex", justifyContent: "center" }}>
        <div className="search-box-container" style={{ width: "100%", maxWidth: 420 }}>
          <SearchBox onSearchSubmit={onSearchSubmit} />
        </div>
      </div>
      <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="nav-button"
          aria-label="찜목록"
          onClick={onGoWishlist}
          style={{
            position: "relative", display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "none", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}
        >
          <Heart size={22} color="#ff69b4" />
          찜
          {wishlistCount > 0 && (
            <span className="badge" style={{
              background: "#ff1493", color: "#fff", borderRadius: "50%", fontSize: 12, fontWeight: "bold",
              padding: "2px 7px", marginLeft: 4,
              position: "absolute", top: "-8px", right: "-13px"
            }}>
              {wishlistCount}
            </span>
          )}
        </button>
        <button
          className="nav-button"
          aria-label="장바구니"
          onClick={onGoCart}
          style={{
            position: "relative", display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "none", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}
        >
          <CartIcon count={cartCount} showBadge={true} size={23} color="#fff" />
          장바구니
        </button>
        <UserMenu
          isLoggedIn={isLoggedIn}
          user={user}
          onLogin={onLogin}
          onLogout={onLogout}
          onMyPage={onMyPage}
          onOrderList={onOrderList}
          onCoupon={onCoupon}
          showGrade={true}
        />
      </div>
      {children && children}
    </nav>
  );
};

export default Navbar;
