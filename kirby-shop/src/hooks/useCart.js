// src/hooks/useCart.js

import { useState, useEffect, useCallback } from 'react';

const CART_STORAGE_KEY = 'kirby-shop-cart';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 로컬 스토리지에서 장바구니 데이터 불러오기
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
    } catch (error) {
      console.error('장바구니 데이터 로드 오류:', error);
      setCartItems([]);
    }
  }, []);

  // 장바구니 데이터 로컬 스토리지에 저장
  const saveCartToStorage = useCallback((items) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('장바구니 데이터 저장 오류:', error);
    }
  }, []);

  // 장바구니에 상품 추가
  const addToCart = useCallback((product, quantity = 1, selectedOption = '') => {
    setIsLoading(true);
    
    try {
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(
          item => item.id === product.id && item.selectedOption === selectedOption
        );

        let newItems;
        
        if (existingItemIndex >= 0) {
          // 이미 있는 상품이면 수량 증가
          newItems = prevItems.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // 새 상품이면 추가
          const newItem = {
            ...product,
            quantity,
            selectedOption,
            addedAt: new Date().toISOString(),
            cartItemId: `${product.id}-${selectedOption}-${Date.now()}`
          };
          newItems = [...prevItems, newItem];
        }

        saveCartToStorage(newItems);
        return newItems;
      });

      return { success: true, message: '장바구니에 추가되었습니다!' };
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      return { success: false, message: '장바구니 추가에 실패했습니다.' };
    } finally {
      setIsLoading(false);
    }
  }, [saveCartToStorage]);

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

  // 특정 상품의 장바구니 수량 가져오기
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

  // 장바구니 총 상품 수량
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  // 장바구니 총 가격 (할인 적용)
  const totalPrice = cartItems.reduce((total, item) => {
    const itemPrice = item.discount > 0 
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  // 원래 총 가격 (할인 미적용)
  const originalTotalPrice = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // 총 할인 금액
  const totalDiscount = originalTotalPrice - totalPrice;

  // 배송비 계산 (3만원 이상 무료배송)
  const shippingFee = totalPrice >= 30000 ? 0 : 3000;

  // 최종 결제 금액
  const finalPrice = totalPrice + shippingFee;

  // 무료배송까지 남은 금액
  const freeShippingRemaining = Math.max(0, 30000 - totalPrice);

  // 장바구니 요약 정보
  const cartSummary = {
    totalQuantity,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    shippingFee,
    finalPrice,
    freeShippingRemaining,
    isEmpty: cartItems.length === 0
  };

  // 상품별 그룹핑 (같은 상품의 다른 옵션들)
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

  // 장바구니 유효성 검사 (재고 확인 등)
  const validateCart = useCallback(() => {
    const issues = [];
    
    cartItems.forEach(item => {
      // 재고 부족 체크
      if (item.stock < item.quantity) {
        issues.push({
          type: 'stock',
          item,
          message: `${item.title}의 재고가 부족합니다. (재고: ${item.stock}개)`
        });
      }
      
      // 품절 상품 체크
      if (item.stock <= 0) {
        issues.push({
          type: 'outOfStock',
          item,
          message: `${item.title}이 품절되었습니다.`
        });
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }, [cartItems]);

  // 장바구니 정리 (품절 상품 제거, 수량 조정)
  const cleanupCart = useCallback(() => {
    setCartItems(prevItems => {
      const cleanedItems = prevItems
        .filter(item => item.stock > 0) // 품절 상품 제거
        .map(item => ({
          ...item,
          quantity: Math.min(item.quantity, item.stock) // 재고에 맞게 수량 조정
        }));
      
      saveCartToStorage(cleanedItems);
      return cleanedItems;
    });
  }, [saveCartToStorage]);

  // 장바구니 내보내기 (주문용 데이터)
  const exportCartForOrder = useCallback(() => {
    return {
      items: cartItems.map(item => ({
        productId: item.id,
        productTitle: item.title,
        productImage: item.image,
        quantity: item.quantity,
        unitPrice: item.discount > 0 
          ? item.price * (1 - item.discount / 100)
          : item.price,
        originalPrice: item.price,
        discount: item.discount || 0,
        selectedOption: item.selectedOption,
        cartItemId: item.cartItemId
      })),
      summary: cartSummary,
      orderedAt: new Date().toISOString()
    };
  }, [cartItems, cartSummary]);

  return {
    // 상태
    cartItems,
    isLoading,
    
    // 액션
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // 조회
    getCartQuantity,
    isInCart,
    
    // 계산된 값들
    totalQuantity,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    shippingFee,
    finalPrice,
    freeShippingRemaining,
    cartSummary,
    groupedItems,
    
    // 유틸리티
    validateCart,
    cleanupCart,
    exportCartForOrder
  };
};