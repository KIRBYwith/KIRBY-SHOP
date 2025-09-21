// src/components/hero/HeroSlider.js

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Play, Pause } from 'lucide-react';

const HeroSlider = ({ 
  images = [], 
  autoSlide = true, 
  slideInterval = 5000,
  onSlideChange,
  onButtonClick 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoSlide);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 슬라이드 이동 함수
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    if (onSlideChange) {
      onSlideChange(index, images[index]);
    }
  }, [images, onSlideChange]);

  // 다음 슬라이드
  const nextSlide = useCallback(() => {
    const nextIndex = (currentSlide + 1) % images.length;
    goToSlide(nextIndex);
  }, [currentSlide, images.length, goToSlide]);

  // 이전 슬라이드
  const prevSlide = useCallback(() => {
    const prevIndex = (currentSlide - 1 + images.length) % images.length;
    goToSlide(prevIndex);
  }, [currentSlide, images.length, goToSlide]);

  // 자동 슬라이드
  useEffect(() => {
    if (!isPlaying || isHovered || images.length <= 1) return;

    const interval = setInterval(nextSlide, slideInterval);
    return () => clearInterval(interval);
  }, [isPlaying, isHovered, nextSlide, slideInterval, images.length]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case ' ': // 스페이스바
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Home':
          goToSlide(0);
          break;
        case 'End':
          goToSlide(images.length - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [prevSlide, nextSlide, isPlaying, goToSlide, images.length]);

  // 터치 이벤트 처리
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // 재생/일시정지 토글
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // 버튼 클릭 핸들러
  const handleButtonClick = (slide) => {
    if (onButtonClick) {
      onButtonClick(slide);
    }
  };

  // 슬라이드가 없으면 기본 이미지 표시
  if (!images || images.length === 0) {
    return (
      <div className="hero-container hero-empty">
        <div className="hero-placeholder">
          <Star size={48} />
          <p>슬라이드 이미지를 준비중입니다...</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentSlide];

  return (
    <div 
      className="hero-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 슬라이드 이미지 */}
      <div className="hero-slides">
        {images.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.src})`,
              backgroundColor: slide.backgroundColor || '#ffb6c1'
            }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="hero-image"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* 슬라이드 네비게이션 버튼 */}
      {images.length > 1 && (
        <>
          <button 
            className="slide-button slide-button-left"
            onClick={prevSlide}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft size={30} />
          </button>
          
          <button 
            className="slide-button slide-button-right"
            onClick={nextSlide}
            aria-label="다음 슬라이드"
          >
            <ChevronRight size={30} />
          </button>
        </>
      )}

      {/* 슬라이드 콘텐츠 오버레이 */}
      <div 
        className="hero-overlay"
        style={{
          backgroundColor: `rgba(0,0,0,${currentImage.overlayOpacity || 0.4})`,
          color: currentImage.textColor || '#ffffff'
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">
            {currentImage.title}
          </h1>
          
          {currentImage.subtitle && (
            <p className="hero-subtitle">
              {currentImage.subtitle}
            </p>
          )}
          
          {currentImage.buttonText && (
            <button 
              className="hero-button"
              onClick={() => handleButtonClick(currentImage)}
            >
              <Star size={20} />
              {currentImage.buttonText}
            </button>
          )}

          {/* 추가 정보 표시 */}
          {currentImage.badge && (
            <div className="hero-badge">
              {currentImage.badge}
            </div>
          )}
        </div>
      </div>

      {/* 슬라이드 인디케이터 */}
      {images.length > 1 && (
        <div className="slide-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}

      {/* 재생/일시정지 컨트롤 */}
      {images.length > 1 && autoSlide && (
        <div className="slide-controls">
          <button
            className="control-button"
            onClick={togglePlayback}
            aria-label={isPlaying ? '슬라이드 일시정지' : '슬라이드 재생'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <div className="slide-progress">
            <div className="slide-counter">
              {currentSlide + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {/* 진행 바 (자동 슬라이드 시) */}
      {isPlaying && !isHovered && images.length > 1 && (
        <div className="slide-progress-bar">
          <div 
            className="progress-fill"
            style={{
              animationDuration: `${slideInterval}ms`,
              animationPlayState: isPlaying ? 'running' : 'paused'
            }}
          />
        </div>
      )}

      {/* 슬라이드 썸네일 (옵션) */}
      {images.length > 1 && images.length <= 5 && (
        <div className="slide-thumbnails">
          {images.map((slide, index) => (
            <button
              key={slide.id || index}
              className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              style={{ backgroundImage: `url(${slide.src})` }}
              aria-label={`${slide.alt} 슬라이드로 이동`}
            />
          ))}
        </div>
      )}

      {/* 키보드 단축키 안내 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="keyboard-hints">
          <p>키보드 단축키: ← → (슬라이드 이동), Space (재생/정지), Home/End (처음/끝)</p>
        </div>
      )}
    </div>
  );
};

export default HeroSlider;