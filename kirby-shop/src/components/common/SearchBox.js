// src/components/common/SearchBox.js

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

const SearchBox = ({ onSearchSubmit, placeholder = "커비 굿즈를 검색해보세요 ✨" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    '커비 인형', '커비 머그컵', '커비 후드티', '커비 키링', 
    '커비 에코백', '커비 피규어', '커비 무드등', '커비 스티커'
  ]);
  
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);

  // 컴포넌트 마운트 시 최근 검색어 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('kirby-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 최근 검색어 저장
  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const updatedRecent = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5); // 최대 5개까지만 저장
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('kirby-recent-searches', JSON.stringify(updatedRecent));
  };

  // 검색 실행
  const handleSearch = (query = searchQuery) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    saveRecentSearch(trimmedQuery);
    setSearchQuery(trimmedQuery);
    setShowSuggestions(false);
    
    if (onSearchSubmit) {
      onSearchSubmit(trimmedQuery);
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // 입력값이 있으면 자동완성 표시
    if (value.trim()) {
      setShowSuggestions(true);
    }
  };

  // 입력창 포커스 시
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // 검색어 클리어
  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // 최근 검색어 삭제
  const removeRecentSearch = (searchToRemove) => {
    const updated = recentSearches.filter(item => item !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem('kirby-recent-searches', JSON.stringify(updated));
  };

  // 모든 최근 검색어 삭제
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('kirby-recent-searches');
  };

  // 제안된 검색어 클릭
  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  // 검색어 하이라이트 함수
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  // 필터링된 인기 검색어 (현재 입력과 매칭)
  const filteredPopularSearches = searchQuery 
    ? popularSearches.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularSearches;

  return (
    <div className="search-box-container" ref={searchBoxRef}>
      <form className="search-box" onSubmit={handleSubmit}>
        <div className="pink-box"></div>
        <Search className="search-icon" size={20} />
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder={placeholder}
          className="search-input"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        
        {searchQuery && (
          <button 
            type="button"
            className="search-clear"
            onClick={clearSearch}
            aria-label="검색어 지우기"
          >
            <X size={18} />
          </button>
        )}
        
        <button 
          type="submit" 
          className="search-submit"
          aria-label="검색하기"
        >
          검색
        </button>
      </form>

      {/* 검색 자동완성 및 제안 */}
      {showSuggestions && (
        <div className="search-suggestions">
          {/* 현재 검색어가 있을 때 */}
          {searchQuery && (
            <div className="suggestion-section">
              <div className="suggestion-header">
                <Search size={16} />
                <span>'{searchQuery}' 검색</span>
              </div>
              <button 
                className="suggestion-item search-current"
                onClick={() => handleSearch(searchQuery)}
              >
                <Search size={16} />
                <span>{searchQuery}</span>
              </button>
            </div>
          )}

          {/* 최근 검색어 */}
          {recentSearches.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-header">
                <Clock size={16} />
                <span>최근 검색어</span>
                <button 
                  className="clear-all-btn"
                  onClick={clearAllRecentSearches}
                >
                  전체삭제
                </button>
              </div>
              {recentSearches.map((recent, index) => (
                <div key={index} className="suggestion-item recent-item">
                  <button 
                    className="suggestion-text"
                    onClick={() => handleSuggestionClick(recent)}
                  >
                    <Clock size={16} />
                    <span>{highlightMatch(recent, searchQuery)}</span>
                  </button>
                  <button 
                    className="remove-recent"
                    onClick={() => removeRecentSearch(recent)}
                    aria-label="최근 검색어 삭제"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 인기 검색어 */}
          {filteredPopularSearches.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-header">
                <TrendingUp size={16} />
                <span>인기 검색어</span>
              </div>
              {filteredPopularSearches.slice(0, 5).map((popular, index) => (
                <button 
                  key={index}
                  className="suggestion-item popular-item"
                  onClick={() => handleSuggestionClick(popular)}
                >
                  <TrendingUp size={16} />
                  <span>{highlightMatch(popular, searchQuery)}</span>
                  <span className="popular-rank">{index + 1}</span>
                </button>
              ))}
            </div>
          )}

          {/* 검색 결과가 없을 때 */}
          {searchQuery && filteredPopularSearches.length === 0 && (
            <div className="suggestion-section">
              <div className="no-suggestions">
                <p>검색 결과가 없습니다.</p>
                <p>다른 키워드로 검색해보세요! 🔍</p>
              </div>
            </div>
          )}

          {/* 검색 팁 */}
          {!searchQuery && (
            <div className="suggestion-section search-tips">
              <div className="suggestion-header">
                <span>💡 검색 팁</span>
              </div>
              <div className="search-tip-content">
                <p>상품명이나 브랜드명으로 검색해보세요</p>
                <p>'커비 인형', '핑크 머그컵' 등 구체적으로 검색하면 더 정확해요</p>
                <p>카테고리별로 찾으시려면 상단 메뉴를 이용해주세요</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 모바일용 오버레이 */}
      {showSuggestions && (
        <div 
          className="search-overlay"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default SearchBox;