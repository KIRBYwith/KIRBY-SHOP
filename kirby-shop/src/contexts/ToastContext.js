// src/contexts/ToastContext.js

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast는 ToastProvider 내에서 사용되어야 합니다.');
  }
  return context;
};

export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 4000,
      showProgress: true,
      kirbyStyle: false,
      position,
      ...toast,
      onClose: (toastId) => removeToast(toastId)
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      return updatedToasts.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts, position]);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 편의 메서드들
  const toast = useCallback({
    success: (message, options = {}) => addToast({
      type: 'success',
      message,
      title: options.title || '성공!',
      ...options
    }),

    error: (message, options = {}) => addToast({
      type: 'error',
      message,
      title: options.title || '오류 발생',
      duration: options.duration || 6000,
      ...options
    }),

    warning: (message, options = {}) => addToast({
      type: 'warning',
      message,
      title: options.title || '주의',
      ...options
    }),

    info: (message, options = {}) => addToast({
      type: 'info',
      message,
      title: options.title || '알림',
      ...options
    }),

    love: (message, options = {}) => addToast({
      type: 'love',
      message,
      title: options.title || '💖',
      kirbyStyle: true,
      ...options
    }),

    gift: (message, options = {}) => addToast({
      type: 'gift',
      message,
      title: options.title || '선물!',
      kirbyStyle: true,
      ...options
    }),

    kirby: (message, options = {}) => addToast({
      type: options.type || 'success',
      message,
      kirbyStyle: true,
      ...options
    }),

    // 커스텀 토스트
    custom: (options) => addToast(options)
  }, [addToast]);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toasts}
        position={position}
        maxToasts={maxToasts}
      />
    </ToastContext.Provider>
  );
};
