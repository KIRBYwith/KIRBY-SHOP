// src/hooks/useWishlist.js

import { useState, useEffect, useCallback } from 'react';

const WISHLIST_STORAGE_KEY = 'kirby-shop-wishlist';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 로컬 스토리지에서 찜목록 데이터 불러오기
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlistItems(parsedWishlist);
      }
    } catch (error) {
      console.error('찜목록 데이터 로드 오류:', error);
      setWishlistItems([]);
    }
  }, []);

  // 찜목록 데이터 로컬 스토리지에 저장
  const saveWishlistToStorage = useCallback((items) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('찜목록 데이터 저장 오류:', error);
    }
  }, []);

  // 찜목록에 상품 추가
  const addToWishlist = useCallback((product) => {
    setIsLoading(true);
    
    try {
      setWishlistItems(prevItems => {
        // 이미 있는 상품인지 확인
        const isAlreadyInWishlist = prevItems.some(item => item.id === product.id);
        
        if (isAlreadyInWishlist) {
          return prevItems; // 이미 있으면 그대로 반환
        }

        const newItem = {
          ...product,
          addedAt: new Date().toISOString(),
          wishlistId: `wishlist-${product.id}-${Date.now()}`
        };
        
        const newItems = [...prevItems, newItem];
        saveWishlistToStorage(newItems);
        return newItems;
      });

      return { success: true, message: '찜목록에 추가되었습니다! 💖' };
    } catch (error) {
      console.error('찜목록 추가 오류:', error);
      return { success: false, message: '찜목록 추가에 실패했습니다.' };
    } finally {
      setIsLoading(false);
    }
  }, [saveWishlistToStorage]);

  // 찜목록에서 상품 제거
  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      saveWishlistToStorage(newItems);
      return newItems;
    });
    
    return { success: true, message: '찜목록에서 제거되었습니다.' };
  }, [saveWishlistToStorage]);

  // 찜목록 토글 (추가/제거)
  const toggleWishlist = useCallback((product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    
    if (isInWishlist) {
      return removeFromWishlist(product.id);
    } else {
      return addToWishlist(product);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  // 찜목록 비우기
  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    saveWishlistToStorage([]);
    return { success: true, message: '찜목록이 모두 삭제되었습니다.' };
  }, [saveWishlistToStorage]);

  // 상품이 찜목록에 있는지 확인
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  // 찜목록 상품 ID들만 반환 (간단한 배열)
  const wishlistIds = wishlistItems.map(item => item.id);

  // 찜목록 총 개수
  const totalCount = wishlistItems.length;

  // 카테고리별 찜목록 그룹핑
  const groupedByCategory = wishlistItems.reduce((groups, item) => {
    const category = item.category || '기타';
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push(item);
    return groups;
  }, {});

  // 가격대별 찜목록 그룹핑
  const groupedByPriceRange = wishlistItems.reduce((groups, item) => {
    let priceRange;
    
    if (item.price < 10000) {
      priceRange = '1만원 미만';
    } else if (item.price < 30000) {
      priceRange = '1만원 ~ 3만원';
    } else if (item.price < 50000) {
      priceRange = '3만원 ~ 5만원';
    } else {
      priceRange = '5만원 이상';
    }
    
    if (!groups[priceRange]) {
      groups[priceRange] = [];
    }
    
    groups[priceRange].push(item);
    return groups;
  }, {});

  // 최근 추가된 상품들 (최대 5개)
  const recentItems = [...wishlistItems]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 5);

  // 할인 상품들
  const discountedItems = wishlistItems.filter(item => item.discount > 0);

  // 품절된 상품들
  const outOfStockItems = wishlistItems.filter(item => item.stock <= 0);

  // 재고 부족 상품들
  const lowStockItems = wishlistItems.filter(item => item.stock > 0 && item.stock <= 5);

  // 찜목록 정렬
  const sortWishlist = useCallback((sortBy) => {
    setWishlistItems(prevItems => {
      const sortedItems = [...prevItems];
      
      switch (sortBy) {
        case 'newest':
          sortedItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
          break;
        case 'oldest':
          sortedItems.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
          break;
        case 'price-low':
          sortedItems.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          sortedItems.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          sortedItems.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'discount':
          sortedItems.sort((a, b) => (b.discount || 0) - (a.discount || 0));
          break;
        default:
          return prevItems;
      }
      
      saveWishlistToStorage(sortedItems);
      return sortedItems;
    });
  }, [saveWishlistToStorage]);

  // 찜목록 필터링
  const filterWishlist = useCallback((filterOptions) => {
    const {
      category,
      priceMin,
      priceMax,
      inStock,
      onSale
    } = filterOptions;

    return wishlistItems.filter(item => {
      // 카테고리 필터
      if (category && item.category !== category) {
        return false;
      }
      
      // 가격 범위 필터
      if (priceMin && item.price < priceMin) {
        return false;
      }
      if (priceMax && item.price > priceMax) {
        return false;
      }
      
      // 재고 필터
      if (inStock && item.stock <= 0) {
        return false;
      }
      
      // 할인 상품 필터
      if (onSale && (!item.discount || item.discount <= 0)) {
        return false;
      }
      
      return true;
    });
  }, [wishlistItems]);

  // 찜목록 검색
  const searchWishlist = useCallback((query) => {
    const lowercaseQuery = query.toLowerCase();
    
    return wishlistItems.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      (item.tags && item.tags.some(tag => 
        tag.toLowerCase().includes(lowercaseQuery)
      ))
    );
  }, [wishlistItems]);

  // 찜목록 통계
  const getWishlistStats = useCallback(() => {
    const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
    const avgPrice = wishlistItems.length > 0 ? totalValue / wishlistItems.length : 0;
    const totalDiscountValue = discountedItems.reduce((sum, item) => {
      const discountAmount = item.price * (item.discount / 100);
      return sum + discountAmount;
    }, 0);

    return {
      totalCount,
      totalValue,
      avgPrice,
      discountedCount: discountedItems.length,
      totalDiscountValue,
      outOfStockCount: outOfStockItems.length,
      lowStockCount: lowStockItems.length,
      categoryCounts: Object.keys(groupedByCategory).map(category => ({
        category,
        count: groupedByCategory[category].length
      }))
    };
  }, [wishlistItems, discountedItems, outOfStockItems, lowStockItems, groupedByCategory, totalCount]);

  // 찜목록 내보내기 (공유용)
  const exportWishlist = useCallback(() => {
    return {
      items: wishlistItems.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        addedAt: item.addedAt
      })),
      stats: getWishlistStats(),
      exportedAt: new Date().toISOString()
    };
  }, [wishlistItems, getWishlistStats]);

  // 찜목록 가져오기 (공유받은 데이터)
  const importWishlist = useCallback((importData) => {
    try {
      if (!importData.items || !Array.isArray(importData.items)) {
        throw new Error('잘못된 데이터 형식입니다.');
      }

      const importedItems = importData.items.map(item => ({
        ...item,
        addedAt: new Date().toISOString(),
        wishlistId: `wishlist-${item.id}-${Date.now()}`
      }));

      setWishlistItems(prevItems => {
        // 중복 제거
        const existingIds = prevItems.map(item => item.id);
        const newItems = importedItems.filter(item => !existingIds.includes(item.id));
        
        const combinedItems = [...prevItems, ...newItems];
        saveWishlistToStorage(combinedItems);
        return combinedItems;
      });

      return { 
        success: true, 
        message: `${importedItems.length}개 상품이 찜목록에 추가되었습니다!` 
      };
    } catch (error) {
      console.error('찜목록 가져오기 오류:', error);
      return { 
        success: false, 
        message: '찜목록 가져오기에 실패했습니다.' 
      };
    }
  }, [saveWishlistToStorage]);

  return {
    // 상태
    wishlistItems,
    wishlistIds,
    isLoading,
    
    // 액션
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    
    // 조회
    isInWishlist,
    totalCount,
    
    // 그룹핑된 데이터
    groupedByCategory,
    groupedByPriceRange,
    recentItems,
    discountedItems,
    outOfStockItems,
    lowStockItems,
    
    // 유틸리티
    sortWishlist,
    filterWishlist,
    searchWishlist,
    getWishlistStats,
    exportWishlist,
    importWishlist
  };
};