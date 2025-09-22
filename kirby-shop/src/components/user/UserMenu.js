// src/components/user/UserMenu.js

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Star, Heart, ShoppingCart, LogOut } from "lucide-react";

const UserMenu = ({
  isLoggedIn,
  user = {},
  showGrade = true,
  onLogout,
  onLogin,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // 드롭다운 외부 클릭시 자동 닫기
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  // 드롭다운 버튼
  const handleDropdown = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  // 로그아웃 후 홈으로 이동
  const handleLogout = () => {
    if (onLogout) onLogout();
    setOpen(false);
    navigate('/');
  };

  // 로그인 안한 경우
  if (!isLoggedIn) {
    return (
      <button className="nav-button" onClick={onLogin}>
        <User size={20} />
        <span>로그인</span>
      </button>
    );
  }

  // 로그인 중
  return (
    <div className="user-menu" ref={menuRef} tabIndex={0}>
      <button className="nav-button user-button" onClick={handleDropdown}>
        <User size={20} />
        <span className="user-name">
          {user?.name ? `${user.name}님` : "사용자님"}
        </span>
        {showGrade && user?.grade && (
          <span className={`grade-badge ${user.grade}`}>{user.grade}</span>
        )}
      </button>
      {open && (
        <div className="user-dropdown">
          <Link
            to="/mypage"
            className="dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Star size={16} style={{ marginRight: 6 }} />
            마이페이지
          </Link>
          <Link
            to="/order"
            className="dropdown-item"
            onClick={() => setOpen(false)}
          >
            <ShoppingCart size={16} style={{ marginRight: 6 }} />
            주문내역
          </Link>
          <Link
            to="/coupon"
            className="dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Heart size={16} style={{ marginRight: 6 }} />
            쿠폰함
          </Link>
          <button
            className="dropdown-item logout"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={16} style={{ marginRight: 6 }} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
