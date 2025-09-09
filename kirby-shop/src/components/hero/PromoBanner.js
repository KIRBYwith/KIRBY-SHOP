// src/components/hero/PromoBanner.js (아이콘 없는 버전)

import React, { useState, useEffect } from 'react';

const PromoBanner = ({ 
  banners = [], 
  autoRotate = true, 
  rotateInterval = 8000,
  onBannerClick,
  onClose,
  closeable = true 
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // 기본 배너 데이터 (props로 전달되지 않은 경우)
  const defaultBanners = [
    {
      id: 'signup-discount',
      type: 'signup',
      icon: '👑',
      title: '🎉 신규 회원가입 시 20% 할인쿠폰 증정! 🎉',
      subtitle: '지금 가입하고 특별 혜택을 받아보세요!',
      buttonText: '회원가입하기',
      backgroundColor: 'linear-gradient(90deg, #ffb6c1 0%, #ff69b4 50%, #ffb6c1 100%)',
      textColor: '#ffffff',
      buttonColor: '#ffffff',
      buttonTextColor: '#ff1493',
      link: '/signup',
      priority: 1,
      isActive: true
    },
    {
      id: 'free-shipping',
      type: 'shipping',
      icon: '🎁',
      title: '🚚 3만원 이상 구매시 무료배송! 🚚',
      subtitle: '전국 어디든 빠르고 안전하게 배송해드려요',
      buttonText: '쇼핑하기',
      backgroundColor: 'linear-gradient(90deg, #e6e6fa 0%, #dda0dd 50%, #e6e6fa 100%)',
      textColor: '#4b0082',
      buttonColor: '#4b0082',
      buttonTextColor: '#ffffff',
      link: '/products',
      priority: 2,
      isActive: true
    },
    {
      id: 'limited-edition',
      type: 'limited',
      icon: '✨',
      title: '⭐ 한정판 커비 컬렉션 출시! ⭐',
      subtitle: '놓치면 후회할 특별한 아이템들을 만나보세요',
      buttonText: '한정판 보기',
      backgroundColor: 'linear-gradient(90deg, #fff5ee 0%, #ffd700 50%, #fff5ee 100%)',
      textColor: '#8b4513',
      buttonColor: '#8b4513',
      buttonTextColor: '#ffffff',
      link: '/limited-edition',
      priority: 3,
      isActive: true,
      endDate: '2024-12-31'
    }
  ];

  const activeBanners = banners.length > 0 
    ? banners.filter(banner => banner.isActive) 
    : defaultBanners.filter(banner => banner.isActive);

  // 자동 로테이션
  useEffect(() => {
    if (!autoRotate || activeBanners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % activeBanners.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, activeBanners.length, isPaused, rotateInterval]);

  // 배너 클릭 핸들러
  const handleBannerClick = (banner) => {
    if (onBannerClick) {
      onBannerClick(banner);
    } else if (banner.link) {
      // 기본 동작: 링크로 이동
      if (banner.link.startsWith('http')) {
        window.open(banner.link, '_blank');
      } else {
        // 내부 링크의 경우 React Router 사용 (여기서는 콘솔 로그)
        console.log('Navigate to:', banner.link);
      }
    }
  };

  // 배너 닫기
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsVisible(false);
      // 세션 스토리지에 닫힌 상태 저장 (브라우저 세션 동안만)
      sessionStorage.setItem('promo-banner-hidden', 'true');
    }
  };

  // 컴포넌트 마운트 시 숨김 상태 확인
  useEffect(() => {
    const isHidden = sessionStorage.getItem('promo-banner-hidden');
    if (isHidden === 'true') {
      setIsVisible(false);
    }
  }, []);

  // D-day 계산
  const calculateDDay = (endDate) => {
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return null;
    if (days === 0) return 'D-DAY';
    return `D-${days}`;
  };

  // 배너가 없거나 숨겨진 상태면 렌더링 안함
  if (!isVisible || activeBanners.length === 0) {
    return null;
  }

  const banner = activeBanners[currentBanner];
  const dDay = calculateDDay(banner.endDate);

  return (
    <div 
      className="promo-banner"
      style={{ background: banner.backgroundColor }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="promo-content">
        {/* 아이콘 */}
        <div className="promo-icon-wrapper">
          <span 
            className="promo-icon-emoji"
            style={{ fontSize: '24px' }}
          >
            {banner.icon}
          </span>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="promo-main">
          <div className="promo-text-section">
            <h3 
              className="promo-title"
              style={{ color: banner.textColor }}
            >
              {banner.title}
            </h3>
            
            {banner.subtitle && (
              <p 
                className="promo-subtitle"
                style={{ color: banner.textColor }}
              >
                {banner.subtitle}
              </p>
            )}
          </div>

          {/* D-day 표시 */}
          {dDay && (
            <div className="promo-dday">
              <span>⏰</span>
              <span>{dDay}</span>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {banner.buttonText && (
          <button 
            className="promo-button"
            style={{ 
              backgroundColor: banner.buttonColor,
              color: banner.buttonTextColor,
              borderColor: banner.buttonColor
            }}
            onClick={() => handleBannerClick(banner)}
          >
            {banner.buttonText}
            {banner.link?.startsWith('http') && (
              <span style={{ marginLeft: '5px' }}>🔗</span>
            )}
          </button>
        )}

        {/* 인디케이터 (여러 배너가 있을 때) */}
        {activeBanners.length > 1 && (
          <div className="promo-indicators">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                className={`promo-indicator ${index === currentBanner ? 'active' : ''}`}
                onClick={() => setCurrentBanner(index)}
                aria-label={`${index + 1}번째 프로모션으로 이동`}
              />
            ))}
          </div>
        )}

        {/* 닫기 버튼 */}
        {closeable && (
          <button 
            className="promo-close"
            onClick={handleClose}
            aria-label="프로모션 배너 닫기"
            style={{ color: banner.textColor }}
          >
            ×
          </button>
        )}
      </div>

      {/* 진행 바 (자동 로테이션 시) */}
      {autoRotate && activeBanners.length > 1 && !isPaused && (
        <div className="promo-progress">
          <div 
            className="promo-progress-fill"
            style={{
              animationDuration: `${rotateInterval}ms`,
              backgroundColor: banner.textColor || '#ffffff'
            }}
          />
        </div>
      )}
    </div>
  );
};

// 특별한 이벤트나 긴급 공지용 상단 고정 배너
export const TopFixedBanner = ({ 
  message, 
  type = 'info', 
  link, 
  linkText = '자세히 보기',
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const typeStyles = {
    info: {
      backgroundColor: '#e3f2fd',
      color: '#1565c0',
      borderColor: '#1976d2'
    },
    warning: {
      backgroundColor: '#fff3e0',
      color: '#ef6c00',
      borderColor: '#f57c00'
    },
    success: {
      backgroundColor: '#e8f5e8',
      color: '#2e7d32',
      borderColor: '#388e3c'
    },
    error: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      borderColor: '#d32f2f'
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="top-fixed-banner"
      style={typeStyles[type]}
    >
      <div className="top-banner-content">
        <span className="top-banner-message">{message}</span>
        
        {link && (
          <a 
            href={link}
            className="top-banner-link"
            target={link.startsWith('http') ? '_blank' : '_self'}
            rel={link.startsWith('http') ? 'noopener noreferrer' : ''}
          >
            {linkText}
            {link.startsWith('http') && <span style={{ marginLeft: '5px' }}>🔗</span>}
          </a>
        )}
        
        <button 
          className="top-banner-close"
          onClick={handleClose}
          aria-label="공지 배너 닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;