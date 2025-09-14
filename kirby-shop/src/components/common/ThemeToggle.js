// src/components/common/ThemeToggle.js
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "../../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="다크/라이트 모드 전환"
      style={{
        background: theme === "dark" ? "#24263b" : "white",
        color: theme === "dark" ? "#ffeaa7" : "#b34ee9",
        border: "none",
        borderRadius: "14px",
        padding: "0.65rem 1rem",
        fontSize: 18,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(253,121,168,0.12)",
        transition: "background 0.15s, color 0.15s"
      }}
      tabIndex={0}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      <span style={{
        marginLeft: 9,
        fontWeight: 600,
        fontSize: 14
      }}>
        {theme === "dark" ? "밝게" : "어둡게"}
      </span>
    </button>
  );
};

export default ThemeToggle;
