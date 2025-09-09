// src/components/product/ProductGrid.js

import React, { useState, useEffect, useMemo } from 'react';
import { Grid, List, Filter, SortAsc, Search, RotateCcw } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductGrid = ({
  products = [],
  loading = false,
  viewMode = 'grid', // 'grid' | 'list'
  onViewModeChange,
  itemsPerPage = 12,
  showFilters = true,
  showSort = true,
  onProductClick,
  onWishlistToggle,
  onCartAdd,
  wishlist = [],
  cart = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyDiscount, setShowOnlyDiscount] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // 카테고리와 태그 추출
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  const allTags = useMemo(() => {
    const tags = products.reduce((acc, product) => {
      if (product.tags) {
        acc.push(...product.tags);
      }
      return acc;
    }, []);
    return [...new Set(tags)].sort();
  }, [products]);

  // 가격 범위 계산
  const priceInfo = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // 필터링 및 정렬된 상품
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // 태그 필터
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && selectedTags.some(tag => p.tags.includes(tag))
      );
    }

    // 가격 범위 필터
    if (priceRange.min !== '') {
      filtered = filtered.filter(p => p.price >= parseInt(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(p => p.price <= parseInt(priceRange.max));
    }

    // 재고 필터
    if (showOnlyInStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // 신상품 필터
    if (showOnlyNew) {
      filtered = filtered.filter(p => p.isNew);
    }

    // 할인상품 필터
    if (showOnlyDiscount) {
      filtered = filtered.filter(p => p.discount > 0);
    }

    // 정렬
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '2024-01-01') - new Date(a.createdAt || '2024-01-01'));
        break;
      default:
        // 기본 정렬: 인기순 (베스트 > 핫 > 신상품 > 평점순)
        filtered.sort((a, b) => {
          if (a.isBest !== b.isBest) return b.isBest - a.isBest;
          if (a.isHot !== b.isHot) return b.isHot - a.isHot;
          if (a.isNew !== b.isNew) return b.isNew - a.isNew;
          return b.rating - a.rating;
        });
    }

    return filtered;
  }, [products, selectedCategories, selectedTags, priceRange, showOnlyInStock, showOnlyNew, showOnlyDiscount, sortBy]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // 페이지 변경 시 스크롤
  useEffect(() => {
    if (currentPage > 1) {
      document.getElementById('product-grid-top')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }
  }, [currentPage]);

  // 필터 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedTags, priceRange, showOnlyInStock, showOnlyNew, showOnlyDiscount, sortBy]);

  // 필터 초기화
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setPriceRange({ min: '', max: '' });
    setShowOnlyInStock(false);
    setShowOnlyNew(false);
    setShowOnlyDiscount(false);
    setSortBy('default');
    setCurrentPage(1);
  };

  // 카테고리 토글
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 태그 토글
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 가격 범위 변경
  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedTags.length > 0 || 
                          priceRange.min !== '' || 
                          priceRange.max !== '' ||
                          showOnlyInStock || 
                          showOnlyNew || 
                          showOnlyDiscount ||
                          sortBy !== 'default';

  if (loading) {
    return (
      <div className="product-grid-container">
        <div className="loading-grid">
          {[...Array(itemsPerPage)].map((_, index) => (
            <div key={index} className="product-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-buttons"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid-container" id="product-grid-top">
      {/* 상단 컨트롤 */}
      <div className="product-grid-header">
        <div className="grid-header-left">
          <h2 className="grid-title">
            상품 목록
            <span className="product-count">
              ({filteredAndSortedProducts.length}개)
            </span>
          </h2>
        </div>

        <div className="grid-header-right">
          {/* 뷰 모드 변경 */}
          <div className="view-mode-buttons">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange?.('grid')}
              aria-label="그리드 뷰"
            >
              <Grid size={20} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange?.('list')}
              aria-label="리스트 뷰"
            >
              <List size={20} />
            </button>
          </div>

          {/* 필터 토글 */}
          {showFilters && (
            <button
              className={`filter-toggle-btn ${filtersOpen ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Filter size={20} />
              필터
              {hasActiveFilters && <span className="filter-badge"></span>}
            </button>
          )}

          {/* 정렬 */}
          {showSort && (
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">추천순</option>
              <option value="newest">신상품순</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
              <option value="rating">평점순</option>
              <option value="reviews">리뷰 많은순</option>
              <option value="discount">할인율순</option>
              <option value="name">이름순</option>
            </select>
          )}
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && filtersOpen && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>필터</h3>
            {hasActiveFilters && (
              <button className="reset-filters-btn" onClick={resetFilters}>
                <RotateCcw size={16} />
                필터 초기화
              </button>
            )}
          </div>

          <div className="filter-content">
            {/* 카테고리 필터 */}
            <div className="filter-section">
              <h4>카테고리</h4>
              <div className="filter-options">
                {categories.map(category => (
                  <label key={category} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span className="checkmark"></span>
                    {category}
                  </label>
                ))}
              </div>
            </div>

            {/* 가격 범위 필터 */}
            <div className="filter-section">
              <h4>가격 범위</h4>
              <div className="price-range">
                <input
                  type="number"
                  placeholder={`최소 (${priceInfo.min.toLocaleString()})`}
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="price-input"
                />
                <span>~</span>
                <input
                  type="number"
                  placeholder={`최대 (${priceInfo.max.toLocaleString()})`}
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>

            {/* 상품 상태 필터 */}
            <div className="filter-section">
              <h4>상품 상태</h4>
              <div className="filter-options">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showOnlyInStock}
                    onChange={(e) => setShowOnlyInStock(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  재고 있음
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showOnlyNew}
                    onChange={(e) => setShowOnlyNew(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  신상품
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showOnlyDiscount}
                    onChange={(e) => setShowOnlyDiscount(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  할인상품
                </label>
              </div>
            </div>

            {/* 태그 필터 */}
            {allTags.length > 0 && (
              <div className="filter-section">
                <h4>태그</h4>
                <div className="tag-filters">
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="active-filters">
          {selectedCategories.map(category => (
            <span key={category} className="active-filter">
              카테고리: {category}
              <button onClick={() => toggleCategory(category)}>×</button>
            </span>
          ))}
          {selectedTags.map(tag => (
            <span key={tag} className="active-filter">
              태그: {tag}
              <button onClick={() => toggleTag(tag)}>×</button>
            </span>
          ))}
          {(priceRange.min || priceRange.max) && (
            <span className="active-filter">
              가격: {priceRange.min || '0'}원 ~ {priceRange.max || '∞'}원
              <button onClick={() => setPriceRange({ min: '', max: '' })}>×</button>
            </span>
          )}
        </div>
      )}

      {/* 상품 그리드 */}
      {currentProducts.length === 0 ? (
        <div className="no-products">
          <Search size={48} />
          <h3>검색 결과가 없습니다</h3>
          <p>필터 조건을 변경하거나 다른 키워드로 검색해보세요.</p>
          {hasActiveFilters && (
            <button className="reset-filters-btn" onClick={resetFilters}>
              모든 필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div className={`product-grid ${viewMode}`}>
          {currentProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              isWishlisted={wishlist.includes(product.id)}
              cartQuantity={cart.find(item => item.id === product.id)?.quantity || 0}
              onProductClick={onProductClick}
              onWishlistToggle={onWishlistToggle}
              onCartAdd={onCartAdd}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            const isVisible = pageNum === 1 || 
                            pageNum === totalPages || 
                            Math.abs(pageNum - currentPage) <= 2;

            if (!isVisible) {
              if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                return <span key={pageNum} className="pagination-ellipsis">...</span>;
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {/* 페이지 정보 */}
      <div className="pagination-info">
        {filteredAndSortedProducts.length > 0 && (
          <p>
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedProducts.length)} / 
            총 {filteredAndSortedProducts.length}개 상품
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;