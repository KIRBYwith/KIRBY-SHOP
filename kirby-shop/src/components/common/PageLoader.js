// src/components/common/PageLoader.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';

const PageLoader = ({ children }) => {
  const location = useLocation();
  const { showPageLoading, hidePageLoading } = useLoading();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // 페이지 전환 시작
    setIsTransitioning(true);
    
    const getPageLoadingText = (pathname) => {
      const pageTexts = {
        '/': '커비와 함께하는 쇼핑몰로 이동 중...',
        '/login': '로그인 페이지를 준비하는 중...',
        '/signup': '회원가입 페이지를 준비하는 중...',
        '/cart': '장바구니를 불러오는 중...',
        '/order': '주문서를 작성하는 중...',
        '/payment': '결제 페이지를 준비하는 중...',
        '/wishlist': '찜목록을 불러오는 중...',
        '/mypage': '마이페이지를 준비하는 중...',
        '/orders': '주문내역을 불러오는 중...',
        '/coupon': '쿠폰함을 열어보는 중...',
        '/review': '리뷰 페이지를 준비하는 중...',
        '/qna': '문의사항을 확인하는 중...',
        '/admin': '관리자 페이지로 이동 중...'
      };

      if (pathname.startsWith('/product/')) {
        return '상품 정보를 불러오는 중...';
      }
      
      return pageTexts[pathname] || '페이지를 불러오는 중...';
    };

    const loadingText = getPageLoadingText(location.pathname);
    showPageLoading(loadingText);

    // 실제 DOM 렌더링 완료 후 로딩 숨기기
    const timer = setTimeout(() => {
      hidePageLoading();
      setIsTransitioning(false);
    }, 300); // 짧은 시간으로 변경

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, showPageLoading, hidePageLoading]);

  // 페이지 전환 중일 때는 children을 렌더링하지 않음
  if (isTransitioning) {
    return null;
  }

  return <>{children}</>;
};

export default PageLoader;
