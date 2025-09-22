import React from 'react';

/**
 * S3 이미지 컴포넌트
 * AWS S3에 저장된 이미지를 표시하고 오류 처리를 제공합니다.
 */
const ProductImage = ({ src, alt, className, fallbackSrc = '/images/placeholder.jpg', ...props }) => {
  const getImageUrl = (imageSrc) => {
    if (!imageSrc) return fallbackSrc;
    
    // 이미 완전한 URL인 경우
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }
    
    // S3 버킷 URL과 결합
    const bucketUrl = process.env.REACT_APP_S3_BUCKET_URL;
    if (bucketUrl) {
      // 이미 슬래시가 있는 경우 중복 제거
      const cleanSrc = imageSrc.startsWith('/') ? imageSrc.slice(1) : imageSrc;
      return `${bucketUrl}/${cleanSrc}`;
    }
    
    // 환경 변수가 없는 경우 원본 경로 반환
    return imageSrc;
  };

  const handleError = (e) => {
    console.warn(`이미지 로드 실패: ${src}`);
    e.target.src = fallbackSrc;
  };

  return (
    <img
      src={getImageUrl(src)}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default ProductImage;

