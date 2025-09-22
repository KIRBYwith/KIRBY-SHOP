// src/components/common/Toast.js

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, AlertCircle, Info, X, 
  Star, Heart, Gift, Sparkles 
} from 'lucide-react';
import '../../styles/Toast.css';

// Toast 타입별 아이콘과 스타일 정의
const toastConfig = {
  success: {
    icon: CheckCircle,
    className: 'toast-success',
    kirbyIcon: '🌟'
  },
  error: {
    icon: AlertCircle,
    className: 'toast-error',
    kirbyIcon: '💔'
  },
  warning: {
    icon: AlertCircle,
    className: 'toast-warning',
    kirbyIcon: '⚠️'
  },
  info: {
    icon: Info,
    className: 'toast-info',
    kirbyIcon: '💡'
  },
  love: {
    icon: Heart,
    className: 'toast-love',
    kirbyIcon: '💖'
  },
  gift: {
    icon: Gift,
    className: 'toast-gift',
    kirbyIcon: '🎁'
  }
};

const Toast = ({ 
  id,
  type = 'info',
  title,
  message,
  duration = 4000,
  position = 'top-right',
  showProgress = true,
  kirbyStyle = false,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    // 진입 애니메이션
    const enterTimer = setTimeout(() => setIsVisible(true), 50);
    
    // 프로그레스 바 애니메이션
    let progressInterval;
    if (showProgress && duration > 0) {
      const intervalTime = 50;
      const decrementAmount = (100 * intervalTime) / duration;
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - decrementAmount;
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, intervalTime);
    }

    // 자동 닫기
    let closeTimer;
    if (duration > 0) {
      closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
      clearInterval(progressInterval);
    };
  }, [duration, showProgress]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  const toastClass = `
    toast-item 
    ${config.className}
    ${kirbyStyle ? 'toast-kirby' : ''}
    ${isVisible ? 'toast-visible' : ''}
    ${isExiting ? 'toast-exiting' : ''}
  `.trim();

  return (
    <div className={toastClass} role="alert" aria-live="polite">
      {/* 커비 스타일 장식 */}
      {kirbyStyle && (
        <div className="toast-kirby-decoration">
          <span className="kirby-float-icon">{config.kirbyIcon}</span>
          <div className="kirby-sparkles">
            <Sparkles className="sparkle sparkle-1" size={12} />
            <Star className="sparkle sparkle-2" size={10} />
            <Sparkles className="sparkle sparkle-3" size={8} />
          </div>
        </div>
      )}

      <div className="toast-content">
        {/* 아이콘 */}
        <div className="toast-icon">
          <Icon size={20} />
        </div>

        {/* 텍스트 내용 */}
        <div className="toast-text">
          {title && <div className="toast-title">{title}</div>}
          <div className="toast-message">{message}</div>
        </div>

        {/* 닫기 버튼 */}
        <button 
          className="toast-close"
          onClick={handleClose}
          aria-label="알림 닫기"
        >
          <X size={16} />
        </button>
      </div>

      {/* 프로그레스 바 */}
      {showProgress && duration > 0 && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container 컴포넌트
export const ToastContainer = ({ 
  toasts = [], 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const positionClass = `toast-container-${position}`;
  const visibleToasts = toasts.slice(0, maxToasts);

  if (visibleToasts.length === 0) return null;

  return (
    <div className={`toast-container ${positionClass}`}>
      {visibleToasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default Toast;
