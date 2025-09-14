// src/contexts/ThemeContext.js

import React, { createContext, useContext, useEffect, useState } from "react";

// 사용할 theme 종류
export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";

// context 생성
const ThemeContext = createContext({
  theme: THEME_LIGHT,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // prefers-color-scheme 고려
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem("kirby-theme");
      if (persisted === THEME_DARK || persisted === THEME_LIGHT) return persisted;
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      return media.matches ? THEME_DARK : THEME_LIGHT;
    }
    return THEME_LIGHT;
  };
  const [theme, setTheme] = useState(getInitialTheme);

  // theme 변경 시 localStorage 동기화 및 body class 관리
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kirby-theme", theme);
      document.body.className = (document.body.className.replace(/\btheme-(dark|light)\b/g, "") + " theme-" + theme).trim();
      // 고대비 mode 스타일용 클래스 추가 가능
    }
  }, [theme]);

  // 토글 함수
  const toggleTheme = () => {
    setTheme((prev) => (prev === THEME_DARK ? THEME_LIGHT : THEME_DARK));
  };

  // Context value
  const contextValue = {
    theme,
    isDark: theme === THEME_DARK,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

// 편의용 hook
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
