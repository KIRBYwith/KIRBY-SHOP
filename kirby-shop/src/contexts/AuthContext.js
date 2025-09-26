// src/contexts/AuthContext.js
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const USER_STORAGE_KEY = 'kirby-shop-user';
const TOKEN_STORAGE_KEY = 'kirby-shop-token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => { checkAuthStatus(); }, []);

    const checkAuthStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
            if (savedUser && savedToken) {
                const userData = JSON.parse(savedUser);
                const isTokenValid = await validateToken(savedToken);
                if (isTokenValid) {
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    logout();
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error('인증 상태 확인 오류:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const validateToken = async (token) => {
        try {
            return token && token.length > 10;
        } catch {
            return false;
        }
    };

    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        try {
            // 실제 백엔드 API 호출 시도
            try {
                const response = await fetch('http://localhost:8000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // 백엔드에서 받은 토큰과 사용자 정보 저장
                    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
                    
                    setUser(data.user);
                    setIsAuthenticated(true);
                    
                    return {
                        success: true,
                        message: `환영합니다, ${data.user.name}님! 💖 오늘도 좋은 하루 보내세요.`,
                        user: data.user
                    };
                }
            } catch (apiError) {
                console.warn('백엔드 API 호출 실패:', apiError);
                return { 
                    success: false, 
                    message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' 
                };
            }
            
            // 백엔드 API 호출이 실패한 경우
            return { 
                success: false, 
                message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
            };
        } catch (err) {
            return { success: false, message: '로그인 처리 중 오류가 발생했어요.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (userData) => {
        setIsLoading(true);
        try {
            // 백엔드 API 호출 시도
            try {
                const response = await fetch('http://localhost:8000/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: userData.email,
                        password: userData.password,
                        name: userData.name,
                        phone: userData.phone,
                        birth_date: userData.birthDate
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // 백엔드에서 받은 토큰과 사용자 정보 저장
                    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
                    
                    setUser(data.user);
                    setIsAuthenticated(true);
                    
                    return {
                        success: true,
                        message: `회원가입을 축하합니다! 🎉 신규 회원에게 2,000 포인트가 지급되었습니다.`,
                        user: data.user
                    };
                }
            } catch (apiError) {
                console.warn('백엔드 API 호출 실패:', apiError);
                return { 
                    success: false, 
                    message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' 
                };
            }
            
            // 백엔드 API 호출이 실패한 경우
            return { 
                success: false, 
                message: '회원가입에 실패했습니다.' 
            };
        } catch (error) {
            return { success: false, message: '회원가입 도중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setIsAuthenticated(false);
        return { success: true, message: '로그아웃되었습니다. 또 만나요! 🌟' };
    }, []);

    const updateUser = useCallback((updatedData) => {
        if (!user) return { success: false, message: '로그인이 필요합니다.' };
        
        try {
            const updatedUser = { ...user, ...updatedData };
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true, message: '개인정보가 성공적으로 수정되었습니다.' };
        } catch (error) {
            return { success: false, message: '개인정보 수정 중 오류가 발생했습니다.' };
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user, isLoading, isAuthenticated,
            login, signup, logout, updateUser,
            checkAuthStatus,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// 전역에서 사용할 커스텀 훅
export const useAuth = () => useContext(AuthContext);
