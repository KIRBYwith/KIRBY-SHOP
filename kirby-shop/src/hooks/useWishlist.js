// src/hooks/useWishlist.js - 비로그인 사용자 지원 버전

import { useState, useEffect, useCallback } from 'react';

const GUEST_WISHLIST_KEY = 'kirby-shop-guest-wishlist';
const TEMP_WISHLIST_KEY = 'kirby-shop-temp-wishlist'; // 회원가입 시 이전용

export const useWishlist = (user) => {
  // 로그인 상태에 따른 스토리지 키 결정
  const getStorageKey = () => {
    if (user && user.id) {
      return `kirby-shop-wishlist-${user.id}`;
    }
    return GUEST_WISHLIST_KEY;
  };

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 찜목록 불러오기
  useEffect(() => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      setWishlistItems(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('찜목록 데이터 로드 오류:', error);
      setWishlistItems([]);
    }
  }, [user]);

  // 다른 탭/컴포넌트에서의 변경 사항에 반응 (storage + 커스텀 이벤트)
  useEffect(() => {
    const handleStorage = (e) => {
      const key = getStorageKey();
      if (e && e.key === key) {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          setWishlistItems(Array.isArray(next) ? next : []);
        } catch (_) {}
      }
    };
    const handleCustom = (e) => {
      if (e?.detail?.type === 'wishlist:update') {
        const key = getStorageKey();
        try {
          const saved = localStorage.getItem(key);
          setWishlistItems(saved ? JSON.parse(saved) : []);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('kirby:wishlist', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('kirby:wishlist', handleCustom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 스토리지 저장
  const saveWishlist = useCallback(items => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(items));
      
      // 비로그인 사용자의 경우 임시 백업도 저장 (회원가입 시 이전용)
      if (!user || !user.id) {
        localStorage.setItem(TEMP_WISHLIST_KEY, JSON.stringify(items));
      }

      // 커스텀 이벤트 브로드캐스트
      try {
        const evt = new CustomEvent('kirby:wishlist', { detail: { type: 'wishlist:update' } });
        window.dispatchEvent(evt);
      } catch (_) {}
    } catch (error) {
      console.error('찜목록 데이터 저장 오류:', error);
    }
  }, [user]);

  // 찜목록 추가 (비로그인 사용자도 가능)
  const addToWishlist = useCallback((product) => {
    setIsLoading(true);
    try {
      let result = null;
      setWishlistItems(prev => {
        if (prev.some(item => item.id === product.id)) {
          result = { success: false, message: '이미 찜한 상품입니다.' };
          return prev;
        }
        
        const newItem = {
          ...product,
          addedAt: new Date().toISOString(),
          wishlistId: `wishlist-${product.id}-${Date.now()}`,
          isGuest: !user || !user.id // 게스트 여부 표시
        };
        const newItems = [...prev, newItem];
        saveWishlist(newItems);
        result = { 
          success: true, 
          message: user && user.id 
            ? '찜목록에 추가되었습니다!' 
            : '찜목록에 추가되었습니다! (회원가입 시 저장됩니다)'
        };
        return newItems;
      });
      return result || { success: true, message: '찜목록에 추가되었습니다!' };
    } catch (error) {
      console.error('찜목록 추가 오류:', error);
      return { success: false, message: '찜목록 추가에 실패했습니다.' };
    } finally {
      setIsLoading(false);
    }
  }, [user, saveWishlist]);

  // 찜목록에서 제거
  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prev => {
      const newItems = prev.filter(item => item.id !== productId);
      saveWishlist(newItems);
      return newItems;
    });
    return { success: true, message: '찜목록에서 제거되었습니다.' };
  }, [saveWishlist]);

  // 찜 토글
  const toggleWishlist = useCallback((product) => {
    const isIn = wishlistItems.some(item => item.id === product.id);
    return isIn ? removeFromWishlist(product.id) : addToWishlist(product);
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  // 찜목록 비우기
  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    saveWishlist([]);
    return { success: true, message: '찜목록이 모두 삭제되었습니다.' };
  }, [saveWishlist]);

  // 찜목록에 있는지 확인
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  // 구매 가능 여부 확인 (로그인 필요)
  const canPurchaseWishlist = useCallback(() => {
    return {
      canPurchase: !!(user && user.id),
      message: user && user.id 
        ? '구매할 수 있습니다.' 
        : '구매하려면 로그인이 필요합니다.'
    };
  }, [user]);

  // 게스트 데이터를 회원 데이터로 이전
  const migrateGuestWishlist = useCallback((newUser) => {
    if (!newUser || !newUser.id) return;
    
    try {
      const guestWishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
      const tempWishlist = localStorage.getItem(TEMP_WISHLIST_KEY);
      
      if (guestWishlist || tempWishlist) {
        const wishlistData = JSON.parse(guestWishlist || tempWishlist || '[]');
        const userStorageKey = `kirby-shop-wishlist-${newUser.id}`;
        
        // 게스트 표시 제거하고 유저 찜목록으로 저장
        const migratedItems = wishlistData.map(item => ({
          ...item,
          isGuest: false,
          migratedAt: new Date().toISOString()
        }));
        
        localStorage.setItem(userStorageKey, JSON.stringify(migratedItems));
        
        // 임시 데이터 정리
        localStorage.removeItem(GUEST_WISHLIST_KEY);
        localStorage.removeItem(TEMP_WISHLIST_KEY);
        
        setWishlistItems(migratedItems);
      }
    } catch (error) {
      console.error('찜목록 데이터 이전 오류:', error);
    }
  }, []);

  // 찜목록 정렬
  const sortWishlist = useCallback((type) => {
    setWishlistItems(prev => {
      const sorted = [...prev].sort((a, b) => {
        switch (type) {
          case 'newest':
            return new Date(b.addedAt) - new Date(a.addedAt);
          case 'price-high':
            return b.price - a.price;
          case 'price-low':
            return a.price - b.price;
          case 'discount':
            return (b.discount || 0) - (a.discount || 0);
          default:
            return new Date(b.addedAt) - new Date(a.addedAt);
        }
      });
      saveWishlist(sorted);
      return sorted;
    });
  }, [saveWishlist]);

  // 찜목록 필터링
  const filterWishlist = useCallback((filters) => {
    return wishlistItems.filter(item => {
      // 카테고리 필터
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      
      // 가격 범위 필터
      if (filters.minPrice && item.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && item.price > filters.maxPrice) {
        return false;
      }
      
      // 재고 필터
      if (filters.inStock && item.stock <= 0) {
        return false;
      }
      
      // 할인 상품 필터
      if (filters.onSale && (!item.discount || item.discount <= 0)) {
        return false;
      }
      
      return true;
    });
  }, [wishlistItems]);

  // 찜목록 통계
  const getWishlistStats = useCallback(() => {
    const stats = {
      totalCount: wishlistItems.length,
      totalValue: 0,
      avgPrice: 0,
      discountedCount: 0,
      outOfStockCount: 0,
      categories: {},
      hasGuestItems: false
    };

    wishlistItems.forEach(item => {
      const price = item.discount > 0 
        ? item.price * (1 - item.discount / 100)
        : item.price;
      
      stats.totalValue += price;
      
      if (item.discount > 0) stats.discountedCount++;
      if (item.stock <= 0) stats.outOfStockCount++;
      if (item.isGuest) stats.hasGuestItems = true;
      
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    });

    if (wishlistItems.length > 0) {
      stats.avgPrice = stats.totalValue / wishlistItems.length;
    }

    stats.canPurchase = canPurchaseWishlist();
    
    return stats;
  }, [wishlistItems, canPurchaseWishlist]);

  // ID 배열 (간편 사용용)
  const wishlistIds = wishlistItems.map(item => item.id);
  const totalCount = wishlistItems.length;

  return {
    wishlistItems,
    wishlistIds,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    canPurchaseWishlist,
    migrateGuestWishlist,
    sortWishlist,
    filterWishlist,
    getWishlistStats,
    totalCount,
  };
};