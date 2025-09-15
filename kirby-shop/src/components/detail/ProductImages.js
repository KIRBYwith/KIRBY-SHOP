// src/components/detail/ProductImages.js
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/ProductDetail.css';

const ProductImages = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageList = images.length > 0 ? images : ['/placeholder.jpg'];

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? imageList.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev === imageList.length - 1 ? 0 : prev + 1);
  };

  return (
    <div className="product-images">
      <div className="main-image-container">
        {imageList.length > 1 && (
          <button className="image-nav prev" onClick={handlePrevious}>
            <ChevronLeft size={24} />
          </button>
        )}
        <img 
          src={imageList[currentIndex]} 
          alt="Product" 
          className="main-image"
        />
        {imageList.length > 1 && (
          <button className="image-nav next" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>
      {imageList.length > 1 && (
        <div className="thumbnail-list">
          {imageList.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;