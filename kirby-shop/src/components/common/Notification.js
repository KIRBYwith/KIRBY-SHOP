// src/components/common/Notification.js
import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import "../../styles/MainPage.css"; // 스타일 통합된 경우

const VARIANT_MAP = {
  success: {
    icon: <CheckCircle color="#31c48d" />,
    className: "notification-success",
  },
  error: {
    icon: <AlertCircle color="#e74c3c" />,
    className: "notification-error",
  },
  warning: {
    icon: <AlertCircle color="#f6b93b" />,
    className: "notification-warning",
  },
  info: {
    icon: <Info color="#27b6ff" />,
    className: "notification-info",
  },
};

export default function Notification({ notifications = [], onRemove }) {
  // 자동 사라짐: 개별적으로 구현하거나 상위에서 관리(여기에선 단순히 붕괴/닫기 지원)
  return (
    <div className="notification-container" style={{
      position: "fixed", top: 24, right: 24, zIndex: 2000, display: "flex", flexDirection: "column", gap: "0.7rem"
    }}>
      {notifications.map((n) => {
        const { icon, className } = VARIANT_MAP[n.type] || VARIANT_MAP.info;
        return (
          <div
            key={n.id}
            className={`notification-box ${className || ""}`}
            style={{
              minWidth: 260,
              maxWidth: 340,
              padding: "1rem 1.3rem",
              background: "#fff",
              color: "#333",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              boxShadow: "0 4px 24px rgba(255, 105, 180, 0.15)",
              borderLeft: n.type === "error" ? "6px solid #ff5785"
                        : n.type === "success" ? "6px solid #31c48d"
                        : n.type === "warning" ? "6px solid #ffa502"
                        : "6px solid #27b6ff",
              animation: "fadeIn 0.25s"
            }}
            role="alert"
          >
            <span style={{ marginRight: 15, display: "flex" }}>{icon}</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{n.message}</span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#aaa",
                fontSize: 18,
                marginLeft: 10,
                cursor: "pointer",
              }}
              onClick={() => onRemove && onRemove(n.id)}
              aria-label="알림 닫기"
            >
              <X size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
