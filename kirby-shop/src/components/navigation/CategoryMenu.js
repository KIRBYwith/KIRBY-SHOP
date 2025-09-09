// src/components/navigation/CategoryMenu.js

import React from 'react';

const CategoryMenu = ({ 
  categories = [], 
  selectedCategory = '전체', 
  onCategoryChange,
  showSpecialItems = false 
}) => {
  return (
    <nav className="category-menu">
      <div className="category-container">
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id} className="category-item">
              <button
                className={`category-button ${
                  selectedCategory === category.name ? 'active' : ''
                }`}
                onClick={() => onCategoryChange(category.name)}
                aria-label={`${category.name} 카테고리 보기`}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            </li>
          ))}
        </ul>
        
        {showSpecialItems && (
          <div className="special-items">
            <button 
              className="special-button new-items"
              onClick={() => onCategoryChange('신상품')}
            >
              ✨ 신상품
            </button>
            <button 
              className="special-button best-items"
              onClick={() => onCategoryChange('베스트')}
            >
              🏆 베스트
            </button>
            <button 
              className="special-button sale-items"
              onClick={() => onCategoryChange('할인상품')}
            >
              🎯 할인상품
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CategoryMenu;