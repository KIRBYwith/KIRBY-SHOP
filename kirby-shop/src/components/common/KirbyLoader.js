// src/components/common/KirbyLoader.js

import React from 'react';
import '../../styles/KirbyLoader.css';

const KirbyLoader = ({ 
  text = "로딩 중...", 
  size = "medium", 
  fullScreen = false,
  overlay = false 
}) => {
  const getRandomKirbyText = () => {
    const kirbyTexts = [
      "커비가 열심히 준비하고 있어요...",
      "커비와 함께 기다려주세요...",
      "커비가 마법을 부리는 중...",
      "커비의 특별한 선물을 준비중...",
      "커비가 달려가고 있어요...",
      "커비의 꿈나라에서 가져오는 중...",
      "커비가 별을 모으고 있어요...",
      "커비의 모험이 시작됩니다..."
    ];
    return kirbyTexts[Math.floor(Math.random() * kirbyTexts.length)];
  };

  const loaderText = text === "로딩 중..." ? getRandomKirbyText() : text;

  if (fullScreen) {
    return (
      <div className="kirby-loader-fullscreen">
        <div className="kirby-loader-content">
          <div className="kirby-star-animation">
            <div className="kirby-star">⭐</div>
            <div className="kirby-star">✨</div>
            <div className="kirby-star">💫</div>
          </div>
          <div className={`kirby-text kirby-text-${size}`}>
            {loaderText.split('').map((char, index) => (
              <span 
                key={index} 
                className="kirby-char"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {char}
              </span>
            ))}
          </div>
          <div className="kirby-subtitle">
            잠깐만 기다려주세요 🌟
          </div>
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="kirby-loader-overlay">
        <div className="kirby-loader-content">
          <div className="kirby-star-animation">
            <div className="kirby-star">⭐</div>
            <div className="kirby-star">✨</div>
            <div className="kirby-star">💫</div>
          </div>
          <div className={`kirby-text kirby-text-${size}`}>
            {loaderText.split('').map((char, index) => (
              <span 
                key={index} 
                className="kirby-char"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`kirby-loader kirby-loader-${size}`}>
      <div className="kirby-star-animation">
        <div className="kirby-star">⭐</div>
        <div className="kirby-star">✨</div>
        <div className="kirby-star">💫</div>
      </div>
      <div className={`kirby-text kirby-text-${size}`}>
        {loaderText.split('').map((char, index) => (
          <span 
            key={index} 
            className="kirby-char"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default KirbyLoader;
