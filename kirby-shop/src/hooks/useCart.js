// src/hooks/useCart.js - 비로그인 사용자 지원 버전

import { useState, useEffect, useCallback } from 'react';
import { calculateFinalPrice, formatPrice } from '../utils/priceCalculator';

const GUEST_CART_KEY = 'kirby-shop-guest-cart';
const TEMP_CART_KEY = 'kirby-shop-temp-cart'; // 회원가입 시 이전용

export const useCart = (user) => {
  // 로그인 상태에 따른 스토리지 키 결정
  const getStorageKey = () => {
    if (user && user.id) {
      return `kirby-shop-cart-${user.id}`;
    }
    return GUEST_CART_KEY;
  };

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 장바구니 불러오기
  useEffect(() => {
    try {
      const storageKey = getStorageKey();
      const savedCart = localStorage.getItem(storageKey);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } catch (error) {
      console.error('장바구니 데이터 로드 오류:', error);
      setCartItems([]);
    }
  }, [user]);

  // 다른 탭/컴포넌트에서의 변경 사항에 반응 (storage 이벤트 및 커스텀 이벤트)
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e) return;
      const key = getStorageKey();
      if (e.key === key) {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(Array.isArray(next) ? next : []);
        } catch (_) {}
      }
    };
    const handleCustom = (e) => {
      if (e?.detail?.type === 'cart:update') {
        const key = getStorageKey();
        try {
          const saved = localStorage.getItem(key);
          setCartItems(saved ? JSON.parse(saved) : []);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('kirby:cart', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('kirby:cart', handleCustom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 스토리지 저장
  const saveCartToStorage = useCallback((items) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(items));
      
      // 비로그인 사용자의 경우 임시 백업도 저장 (회원가입 시 이전용)
      if (!user || !user.id) {
        localStorage.setItem(TEMP_CART_KEY, JSON.stringify(items));
      }

      // 커스텀 이벤트 브로드캐스트 (동일 탭 내 컴포넌트 동기화)
      try {
        const evt = new CustomEvent('kirby:cart', { detail: { type: 'cart:update' } });
        window.dispatchEvent(evt);
      } catch (_) {}
    } catch (error) {
      console.error('장바구니 데이터 저장 오류:', error);
    }
  }, [user]);

  // 장바구니 추가 (비로그인 사용자도 가능)
  const addToCart = useCallback((product, quantity = 1, selectedOption = '') => {
    setIsLoading(true);
    try {
      let result = null;
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(
          item => item.id === product.id && item.selectedOption === selectedOption
        );
        
        let newItems;
        if (existingItemIndex >= 0) {
          newItems = prevItems.map((item, idx) =>
            idx === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem = {
            ...product,
            quantity,
            selectedOption,
            addedAt: new Date().toISOString(),
            cartItemId: `${product.id}-${selectedOption}-${Date.now()}`,
            isGuest: !user || !user.id // 게스트 여부 표시
          };
          newItems = [...prevItems, newItem];
        }
        
        saveCartToStorage(newItems);
        result = { 
          success: true, 
          message: user && user.id 
            ? '장바구니에 추가되었습니다!' 
            : '장바구니에 추가되었습니다! (회원가입 시 저장됩니다)'
        };
        return newItems;
      });
      return result || { success: true, message: '장바구니에 추가되었습니다!' };
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      return { success: false, message: '장바구니 추가에 실패했습니다.' };
    } finally {
      setIsLoading(false);
    }
  }, [user, saveCartToStorage]);

  // 장바구니에서 상품 제거
  const removeFromCart = useCallback((cartItemId) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.cartItemId !== cartItemId);
      saveCartToStorage(newItems);
      return newItems;
    });
  }, [saveCartToStorage]);

  // 상품 수량 업데이트
  const updateQuantity = useCallback((cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      );
      saveCartToStorage(newItems);
      return newItems;
    });
  }, [removeFromCart, saveCartToStorage]);

  // 장바구니 비우기
  const clearCart = useCallback(() => {
    setCartItems([]);
    saveCartToStorage([]);
  }, [saveCartToStorage]);

  // 구매 가능 여부 확인 (로그인 필요)
  const canPurchase = useCallback(() => {
    return {
      canPurchase: !!(user && user.id),
      message: user && user.id 
        ? '구매할 수 있습니다.' 
        : '구매하려면 로그인이 필요합니다.'
    };
  }, [user]);

  // 게스트 데이터를 회원 데이터로 이전
  const migrateGuestCart = useCallback((newUser) => {
    if (!newUser || !newUser.id) return;
    
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      const tempCart = localStorage.getItem(TEMP_CART_KEY);
      
      if (guestCart || tempCart) {
        const cartData = JSON.parse(guestCart || tempCart || '[]');
        const userStorageKey = `kirby-shop-cart-${newUser.id}`;
        
        // 게스트 표시 제거하고 유저 장바구니로 저장
        const migratedItems = cartData.map(item => ({
          ...item,
          isGuest: false,
          migratedAt: new Date().toISOString()
        }));
        
        localStorage.setItem(userStorageKey, JSON.stringify(migratedItems));
        
        // 임시 데이터 정리
        localStorage.removeItem(GUEST_CART_KEY);
        localStorage.removeItem(TEMP_CART_KEY);
        
        setCartItems(migratedItems);
      }
    } catch (error) {
      console.error('장바구니 데이터 이전 오류:', error);
    }
  }, []);

  // 특정 상품의 장바구니 수량
  const getCartQuantity = useCallback((productId, selectedOption = '') => {
    const item = cartItems.find(
      item => item.id === productId && item.selectedOption === selectedOption
    );
    return item ? item.quantity : 0;
  }, [cartItems]);

  // 장바구니에 상품이 있는지 확인
  const isInCart = useCallback((productId, selectedOption = '') => {
    return cartItems.some(
      item => item.id === productId && item.selectedOption === selectedOption
    );
  }, [cartItems]);

  // 통일된 금액 계산 사용
  const priceCalculation = calculateFinalPrice(cartItems);
  
  const {
    totalQuantity,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    shippingFee,
    finalPrice,
    freeShippingRemaining
  } = priceCalculation;

  const cartSummary = {
    totalQuantity,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    shippingFee,
    finalPrice,
    freeShippingRemaining,
    isEmpty: cartItems.length === 0,
    hasGuestItems: cartItems.some(item => item.isGuest),
    canPurchase: canPurchase(),
    formattedPrice: formatPrice(finalPrice),
    formattedShippingFee: formatPrice(shippingFee),
    formattedTotalPrice: formatPrice(totalPrice)
  };

  // 그룹화된 아이템
  const groupedItems = cartItems.reduce((groups, item) => {
    const existingGroup = groups.find(group => group.productId === item.id);
    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.totalQuantity += item.quantity;
    } else {
      groups.push({
        productId: item.id,
        productTitle: item.title,
        productImage: item.image,
        items: [item],
        totalQuantity: item.quantity
      });
    }
    return groups;
  }, []);

  // 유효성 검사
  const validateCart = useCallback(() => {
    const issues = [];
    cartItems.forEach(item => {
      if (item.stock < item.quantity) {
        issues.push({
          type: 'stock',
          item,
          message: `${item.title}의 재고가 부족합니다. (재고: ${item.stock}개)`
        });
      }
      if (item.stock <= 0) {
        issues.push({
          type: 'outOfStock',
          item,
          message: `${item.title}이 품절되었습니다.`
        });
      }
    });
    return { isValid: issues.length === 0, issues };
  }, [cartItems]);

  return {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartQuantity,
    isInCart,
    canPurchase,
    migrateGuestCart,
    totalQuantity,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    shippingFee,
    finalPrice,
    freeShippingRemaining,
    cartSummary,
    groupedItems,
    validateCart,
  };
};