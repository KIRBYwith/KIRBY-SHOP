// src/hooks/useAuth.js

import { useState, useEffect, useCallback } from 'react';

const USER_STORAGE_KEY = 'kirby-shop-user';
const TOKEN_STORAGE_KEY = 'kirby-shop-token';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 저장된 사용자 정보와 토큰 확인
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        
        // 토큰 유효성 검사 (실제로는 서버에서 검증)
        const isTokenValid = await validateToken(savedToken);
        
        if (isTokenValid) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // 토큰이 유효하지 않으면 로그아웃 처리
          logout();
        }
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 토큰 유효성 검사 (실제로는 API 호출)
  const validateToken = async (token) => {
    try {
      // 실제로는 서버 API 호출
      // const response = await fetch('/api/auth/validate', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // return response.ok;
      
      // 데모용: 간단한 토큰 형식 검사
      return token && token.length > 10;
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      return false;
    }
  };

  // 로그인
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    
    try {
      // 실제로는 서버 API 호출
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });
      // const data = await response.json();
      
      // 데모용 로그인 로직
      await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 시뮬레이션
      
      const mockUserData = {
        id: Date.now(),
        email: credentials.email,
        name: credentials.email.split('@')[0] + ' 님',
        grade: '일반회원',
        points: 1000,
        joinDate: new Date().toISOString(),
        profileImage: null,
        preferences: {
          notifications: true,
          marketing: true,
          theme: 'pink'
        }
      };
      
      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 사용자 정보와 토큰 저장
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUserData));
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      
      setUser(mockUserData);
      setIsAuthenticated(true);
      
      return { 
        success: true, 
        message: `환영합니다, ${mockUserData.name}님! 💖`,
        user: mockUserData 
      };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { 
        success: false, 
        message: error.message || '로그인에 실패했습니다.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 회원가입
  const signup = useCallback(async (userData) => {
    setIsLoading(true);
    
    try {
      // 실제로는 서버 API 호출
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      // const data = await response.json();
      
      // 데모용 회원가입 로직
      await new Promise(resolve => setTimeout(resolve, 1500)); // API 호출 시뮬레이션
      
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        birthDate: userData.birthDate,
        grade: '신규회원',
        points: 2000, // 신규 가입 혜택
        joinDate: new Date().toISOString(),
        profileImage: null,
        preferences: {
          notifications: true,
          marketing: userData.agreeMarketing || false,
          theme: 'pink'
        }
      };
      
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 자동 로그인 처리
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { 
        success: true, 
        message: `회원가입을 축하합니다! 🎉 신규 회원 혜택으로 2000 포인트가 지급되었습니다.`,
        user: newUser 
      };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return { 
        success: false, 
        message: error.message || '회원가입에 실패했습니다.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 소셜 로그인
  const socialLogin = useCallback(async (provider) => {
    setIsLoading(true);
    
    try {
      // 실제로는 소셜 로그인 API 호출
      // window.location.href = `/api/auth/${provider}`;
      
      // 데모용 소셜 로그인 로직
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const socialUserData = {
        id: Date.now(),
        email: `user${Date.now()}@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} 사용자`,
        grade: '일반회원',
        points: 1500,
        joinDate: new Date().toISOString(),
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        provider: provider,
        preferences: {
          notifications: true,
          marketing: false,
          theme: 'pink'
        }
      };
      
      const token = `${provider}_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(socialUserData));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      setUser(socialUserData);
      setIsAuthenticated(true);
      
      return { 
        success: true, 
        message: `${provider} 로그인 완료! 환영합니다! ✨`,
        user: socialUserData 
      };
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
      return { 
        success: false, 
        message: `${provider} 로그인에 실패했습니다.` 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    
    return { 
      success: true, 
      message: '로그아웃되었습니다. 또 만나요! 🌟' 
    };
  }, []);

  // 사용자 정보 업데이트
  const updateUser = useCallback(async (updates) => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    setIsLoading(true);
    
    try {
      // 실제로는 서버 API 호출
      // const response = await fetch('/api/user/update', {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY)}`
      //   },
      //   body: JSON.stringify(updates)
      // });
      
      // 데모용 업데이트 로직
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { 
        success: true, 
        message: '정보가 성공적으로 업데이트되었습니다!',
        user: updatedUser 
      };
    } catch (error) {
      console.error('사용자 정보 업데이트 오류:', error);
      return { 
        success: false, 
        message: '정보 업데이트에 실패했습니다.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 비밀번호 변경
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    setIsLoading(true);
    
    try {
      // 실제로는 서버 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 데모용: 간단한 비밀번호 검증
      if (currentPassword.length < 4) {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      }
      
      return { 
        success: true, 
        message: '비밀번호가 성공적으로 변경되었습니다!' 
      };
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      return { 
        success: false, 
        message: error.message || '비밀번호 변경에 실패했습니다.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 계정 탈퇴
  const deleteAccount = useCallback(async (password) => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    setIsLoading(true);
    
    try {
      // 실제로는 서버 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 로컬 데이터 모두 삭제
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('kirby-shop-cart');
      localStorage.removeItem('kirby-shop-wishlist');
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { 
        success: true, 
        message: '계정이 성공적으로 삭제되었습니다. 그동안 이용해 주셔서 감사합니다.' 
      };
    } catch (error) {
      console.error('계정 탈퇴 오류:', error);
      return { 
        success: false, 
        message: '계정 탈퇴에 실패했습니다.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 포인트 추가 (관리자 기능 또는 이벤트)
  const addPoints = useCallback(async (points, reason = '포인트 적립') => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const updatedUser = {
      ...user,
      points: (user.points || 0) + points,
      pointHistory: [
        ...(user.pointHistory || []),
        {
          amount: points,
          reason,
          date: new Date().toISOString(),
          type: 'earn'
        }
      ]
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);

    return { 
      success: true, 
      message: `${points} 포인트가 적립되었습니다!`,
      user: updatedUser 
    };
  }, [user]);

  // 포인트 사용
  const usePoints = useCallback(async (points, reason = '포인트 사용') => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    if ((user.points || 0) < points) {
      return { success: false, message: '보유 포인트가 부족합니다.' };
    }

    const updatedUser = {
      ...user,
      points: (user.points || 0) - points,
      pointHistory: [
        ...(user.pointHistory || []),
        {
          amount: -points,
          reason,
          date: new Date().toISOString(),
          type: 'use'
        }
      ]
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);

    return { 
      success: true, 
      message: `${points} 포인트를 사용했습니다!`,
      user: updatedUser 
    };
  }, [user]);

  // 사용자 등급 업데이트
  const updateUserGrade = useCallback((newGrade) => {
    if (!user) return;

    const gradeMap = {
      '신규회원': { benefits: '신규 회원 특가', discountRate: 0 },
      '일반회원': { benefits: '일반 혜택', discountRate: 2 },
      '우수회원': { benefits: '우수 회원 특가', discountRate: 5 },
      'VIP회원': { benefits: 'VIP 전용 혜택', discountRate: 10 },
      'VVIP회원': { benefits: 'VVIP 프리미엄 혜택', discountRate: 15 }
    };

    const updatedUser = {
      ...user,
      grade: newGrade,
      gradeBenefits: gradeMap[newGrade] || gradeMap['일반회원'],
      gradeUpdatedAt: new Date().toISOString()
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  // 사용자 활동 기록
  const trackActivity = useCallback((activity) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      activities: [
        ...(user.activities || []).slice(-19), // 최근 20개만 유지
        {
          ...activity,
          timestamp: new Date().toISOString()
        }
      ]
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  // 토큰 갱신
  const refreshToken = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!currentToken) {
        throw new Error('토큰이 없습니다.');
      }

      // 실제로는 서버 API 호출
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${currentToken}` }
      // });
      
      // 데모용 토큰 갱신
      const newToken = `refreshed_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      
      return { success: true, token: newToken };
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      logout();
      return { success: false, message: '세션이 만료되었습니다. 다시 로그인해주세요.' };
    }
  }, [logout]);

  // 현재 토큰 가져오기
  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }, []);

  // 사용자 권한 확인
  const hasPermission = useCallback((permission) => {
    if (!user) return false;

    const permissions = {
      'admin': ['VVIP회원'],
      'moderator': ['VIP회원', 'VVIP회원'],
      'premium': ['우수회원', 'VIP회원', 'VVIP회원'],
      'basic': ['일반회원', '우수회원', 'VIP회원', 'VVIP회원']
    };

    return permissions[permission]?.includes(user.grade) || false;
  }, [user]);

  return {
    // 상태
    user,
    isLoading,
    isAuthenticated,
    
    // 인증 액션
    login,
    signup,
    socialLogin,
    logout,
    
    // 사용자 관리
    updateUser,
    changePassword,
    deleteAccount,
    
    // 포인트 관리
    addPoints,
    usePoints,
    
    // 기타 기능
    updateUserGrade,
    trackActivity,
    refreshToken,
    getToken,
    hasPermission,
    
    // 유틸리티
    checkAuthStatus
  };
};