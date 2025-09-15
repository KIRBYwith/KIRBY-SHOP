import React, { useState } from 'react';

const CategoryMenu = ({ 
  categories = [], 
  selectedCategory = '전체', 
  onCategoryChange,
  showSpecialItems = false 
}) => {
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  const toggleMobileCategory = () => {
    setIsMobileCategoryOpen(!isMobileCategoryOpen);
  };

  const handleCategorySelect = (categoryName) => {
    onCategoryChange(categoryName);
    setIsMobileCategoryOpen(false); // 모바일에서 선택 후 메뉴 닫기
  };

  return (
    <nav className="category-menu">
      <div className="category-container">
        {/* 모바일용 드롭다운 버튼 */}
        <div className="mobile-category-header">
          <button 
            className="mobile-category-toggle"
            onClick={toggleMobileCategory}
            aria-label="카테고리 메뉴 열기"
          >
            <span className="current-category">
              <span className="category-icon">
                {categories.find(cat => cat.name === selectedCategory)?.icon || '☕'}
              </span>
              <span className="category-text">{selectedCategory}</span>
            </span>
            <span className={`dropdown-arrow ${isMobileCategoryOpen ? 'active' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* 데스크톱용 가로 리스트 & 모바일용 드롭다운 리스트 */}
        <ul className={`category-list ${isMobileCategoryOpen ? 'mobile-open' : ''}`}>
          {categories.map((category) => (
            <li key={category.id} className="category-item">
              <button
                className={`category-button ${
                  selectedCategory === category.name ? 'active' : ''
                }`}
                onClick={() => handleCategorySelect(category.name)}
                aria-label={`${category.name} 카테고리 보기`}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            </li>
          ))}
        </ul>
        
        {showSpecialItems && (
          <div className={`special-items ${isMobileCategoryOpen ? 'mobile-open' : ''}`}>
            <button 
              className="special-button new-items"
              onClick={() => handleCategorySelect('신상품')}
            >
              ✨ 신상품
            </button>
            <button 
              className="special-button best-items"
              onClick={() => handleCategorySelect('베스트')}
              >
              🏆 베스트
            </button>
            <button 
              className="special-button sale-items"
              onClick={() => handleCategorySelect('할인상품')}
              style={{
                background: 'linear-gradient(90deg, #00c97b 0%,rgb(118, 127, 255) 100%)',
                color: '#fff',
              }}>
              🎯 할인상품
            </button>
          </div>
        )}
      </div>
      
      {/* 모바일 오버레이 */}
      {isMobileCategoryOpen && (
        <div 
          className="mobile-category-overlay"
          onClick={() => setIsMobileCategoryOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default CategoryMenu;