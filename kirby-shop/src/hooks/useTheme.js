// src/hooks/useTheme.js

import { useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";

// 테마에 관련된 값/함수: useTheme() 한 번으로 하위에서 모두 사용 가능 (toggleTheme 포함)
export default function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}
