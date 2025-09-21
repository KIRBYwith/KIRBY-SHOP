// src/contexts/LoadingContext.js

import React, { createContext, useContext, useState, useCallback } from 'react';
import KirbyLoader from '../components/common/KirbyLoader';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState('로딩 중...');

  // 특정 키에 대한 로딩 상태 설정
  const setLoading = useCallback((key, isLoading, text = '로딩 중...') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading ? { loading: true, text } : { loading: false, text: '' }
    }));
  }, []);

  // 특정 키의 로딩 상태 확인
  const isLoading = useCallback((key) => {
    return loadingStates[key]?.loading || false;
  }, [loadingStates]);

  // 특정 키의 로딩 텍스트 가져오기
  const getLoadingText = useCallback((key) => {
    return loadingStates[key]?.text || '로딩 중...';
  }, [loadingStates]);

  // 전역 로딩 설정
  const setGlobalLoadingState = useCallback((isLoading, text = '로딩 중...') => {
    setGlobalLoading(isLoading);
    setGlobalLoadingText(text);
  }, []);

  // 페이지 전환 로딩
  const showPageLoading = useCallback((text = '페이지를 불러오는 중...') => {
    setGlobalLoadingState(true, text);
  }, [setGlobalLoadingState]);

  // 페이지 전환 로딩 숨기기
  const hidePageLoading = useCallback(() => {
    setGlobalLoadingState(false);
  }, [setGlobalLoadingState]);

  // API 호출 로딩
  const withLoading = useCallback(async (key, asyncFunction, text = '처리 중...') => {
    const startTime = Date.now();
    try {
      setLoading(key, true, text);
      const result = await asyncFunction();
      
      // 최소 로딩 시간 (300ms) 보장 - 너무 빠른 로딩은 깜빡임 현상 발생
      const elapsed = Date.now() - startTime;
      const minLoadingTime = 300;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  // 전역 API 호출 로딩
  const withGlobalLoading = useCallback(async (asyncFunction, text = '처리 중...') => {
    const startTime = Date.now();
    try {
      setGlobalLoadingState(true, text);
      const result = await asyncFunction();
      
      // 최소 로딩 시간 (300ms) 보장
      const elapsed = Date.now() - startTime;
      const minLoadingTime = 300;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      
      return result;
    } finally {
      setGlobalLoadingState(false);
    }
  }, [setGlobalLoadingState]);

  // 임의의 로딩 상태가 있는지 확인
  const hasAnyLoading = Object.values(loadingStates).some(state => state.loading) || globalLoading;

  const contextValue = {
    // 로딩 상태 관리
    setLoading,
    isLoading,
    getLoadingText,
    
    // 전역 로딩 관리
    globalLoading,
    globalLoadingText,
    setGlobalLoadingState,
    showPageLoading,
    hidePageLoading,
    
    // 유틸리티 함수
    withLoading,
    withGlobalLoading,
    hasAnyLoading,
    
    // 전체 로딩 상태
    loadingStates
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* 전역 로딩 표시 */}
      {globalLoading && (
        <KirbyLoader
          text={globalLoadingText}
          fullScreen={true}
        />
      )}
    </LoadingContext.Provider>
  );
};

// HOC for automatic loading on component mount
export const withLoadingOnMount = (Component, loadingText = '페이지를 준비하는 중...') => {
  return function LoadingWrappedComponent(props) {
    const { showPageLoading, hidePageLoading } = useLoading();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      showPageLoading(loadingText);
      
      // 최소 로딩 시간 (UX 개선)
      const minLoadingTime = 800;
      const startTime = Date.now();
      
      const hideLoading = () => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);
        
        setTimeout(() => {
          hidePageLoading();
          setMounted(true);
        }, remainingTime);
      };

      // 컴포넌트 마운트 완료 후 로딩 숨기기
      const timer = setTimeout(hideLoading, 100);
      
      return () => {
        clearTimeout(timer);
        hidePageLoading();
      };
    }, [showPageLoading, hidePageLoading]);

    if (!mounted) {
      return null;
    }

    return <Component {...props} />;
  };
};
