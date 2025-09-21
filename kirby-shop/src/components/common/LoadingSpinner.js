import React from 'react';
import KirbyLoader from './KirbyLoader';

// 기존 LoadingSpinner를 KirbyLoader로 대체하는 래퍼 컴포넌트
const LoadingSpinner = ({ size = 'md', color = '#ff69b4', type = 'default', text }) => {
  // 사이즈 매핑
  const sizeMap = {
    'sm': 'small',
    'md': 'medium', 
    'lg': 'large',
    'small': 'small',
    'medium': 'medium',
    'large': 'large'
  };

  const kirbySize = sizeMap[size] || 'medium';
  
  // 기본 텍스트 설정
  const defaultText = text || '로딩 중...';

  return (
    <KirbyLoader 
      text={defaultText}
      size={kirbySize}
    />
  );
};

export default LoadingSpinner;