// src/components/user/UserMenu.js

import React, { useState, useRef, useEffect } from "react";
import { User, Star, Heart, ShoppingCart, LogOut } from "lucide-react";

const UserMenu = ({
  isLoggedIn,
  user = {},
  onMyPage,
  onOrderList,
  onCoupon,
  onLogout,
  onLogin,
  showGrade = true,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleDropdown = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  // 로그인 안한 경우
  if (!isLoggedIn) {
    return (
      <button
        className="nav-button"
        aria-label="로그인"
        onClick={onLogin}
        style={{
          display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          color: "#ff69b4", fontWeight: "bold", cursor: "pointer", fontSize: 15,
        }}
      >
        <User size={20} color="#ff69b4" />
        로그인
      </button>
    );
  }

  // 로그인 중
  return (
    <div className="user-menu" ref={menuRef} style={{ position: "relative" }}>
      <button
        className="nav-button"
        aria-label="사용자 메뉴 열기"
        onClick={handleDropdown}
        style={{
          display: "flex", alignItems: "center", gap: 7, background: "none", border: "none",
          color: "#ff69b4", fontWeight: "bold", cursor: "pointer", fontSize: 15,
        }}
      >
        <User size={20} color="#ff69b4" />
        {user?.name || "사용자"}님
        {showGrade && user?.grade && (
          <span style={{
            fontSize: 12, color: "#fff", background: "linear-gradient(80deg,#ffd1dc,#ffb6c1)",
            padding: "2px 9px", borderRadius: 11, marginLeft: 5, fontWeight: 600
          }}>
            {user.grade}
          </span>
        )}
        <span style={{
          borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
          borderTop: open ? "none" : "7px solid #ff69b4",
          borderBottom: open ? "7px solid #ff69b4" : "none",
          marginLeft: 2,
          width: 0, height: 0, verticalAlign: "middle"
        }} />
      </button>
      {open && (
        <div
          className="user-dropdown"
          style={{
            position: "absolute", top: "110%", right: 0, minWidth: 145, background: "#fff",
            borderRadius: 10, boxShadow: "0 8px 32px rgba(253,121,168,0.11)",
            zIndex: 900, overflow: "hidden", border: "1.3px solid #ffe5f2",
            animation: "fadeIn 0.3s",
          }}
        >
          <button
            className="dropdown-item"
            style={{ width: "100%", textAlign: "left", padding: "13px", border: "none", background: "none", color: "#ff69b4", fontWeight: 600, cursor: "pointer" }}
            onClick={() => { setOpen(false); onMyPage && onMyPage(); }}
          >
            <Star size={16} style={{ marginRight: 8, color: "#ffe100" }} />
            마이페이지
          </button>
          <button
            className="dropdown-item"
            style={{ width: "100%", textAlign: "left", padding: "13px", border: "none", background: "none", color: "#7b5eff", fontWeight: 600, cursor: "pointer" }}
            onClick={() => { setOpen(false); onOrderList && onOrderList(); }}
          >
            <ShoppingCart size={16} style={{ marginRight: 8, color: "#b197fc" }} />
            주문내역
          </button>
          <button
            className="dropdown-item"
            style={{ width: "100%", textAlign: "left", padding: "13px", border: "none", background: "none", color: "#ff6b6b", fontWeight: 600, cursor: "pointer" }}
            onClick={() => { setOpen(false); onCoupon && onCoupon(); }}
          >
            <Heart size={16} style={{ marginRight: 8, color: "#ff6b6b" }} />
            쿠폰함
          </button>
          <button
            className="dropdown-item logout"
            style={{ width: "100%", textAlign: "left", padding: "13px", border: "none", background: "none", color: "#e74c3c", fontWeight: 700, cursor: "pointer" }}
            onClick={() => { setOpen(false); onLogout && onLogout(); }}
          >
            <LogOut size={16} style={{ marginRight: 8, color: "#e74c3c" }} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
