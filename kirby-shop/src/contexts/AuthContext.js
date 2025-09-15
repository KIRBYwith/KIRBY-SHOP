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
            await new Promise(resolve => setTimeout(resolve, 600)); // UX 딜레이 연출
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (!savedUser) {
                return { success: false, message: '가입된 회원 정보가 없습니다. 😥' };
            }
            const userData = JSON.parse(savedUser);
            // 이메일·비밀번호 모두 정확히 일치해야만 로그인 허용
            if (
                credentials.email !== userData.email ||
                credentials.password !== userData.password
            ) {
                return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.' };
            }
            // 인증 성공 → 토큰 발급, 인증 상태 갱신
            const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
            setUser(userData);
            setIsAuthenticated(true);
            return {
                success: true,
                message: `환영합니다, ${userData.name}님! 💖 오늘도 좋은 하루 보내세요.`,
                user: userData
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newUser = {
                id: Date.now(),
                email: userData.email,
                password: userData.password,
                name: userData.name,
                phone: userData.phone,
                birthDate: userData.birthDate,
                grade: '신규회원',
                points: 2000,
                joinDate: new Date().toISOString(),
                profileImage: null,
                preferences: {
                    notifications: true,
                    marketing: userData.agreeMarketing || false,
                    theme: 'pink'
                }
            };
            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            localStorage.setItem(TOKEN_STORAGE_KEY, token);

            setUser(newUser);
            setIsAuthenticated(true);

            // 게스트 데이터 이전 (새로 추가된 부분)
            try {
                // 장바구니 데이터 이전
                const guestCart = localStorage.getItem('kirby-shop-guest-cart');
                if (guestCart) {
                    const cartData = JSON.parse(guestCart);
                    const userCartKey = `kirby-shop-cart-${newUser.id}`;
                    localStorage.setItem(userCartKey, JSON.stringify(cartData.map(item => ({
                        ...item,
                        isGuest: false,
                        migratedAt: new Date().toISOString()
                    }))));
                    localStorage.removeItem('kirby-shop-guest-cart');
                    localStorage.removeItem('kirby-shop-temp-cart');
                }

                // 찜목록 데이터 이전
                const guestWishlist = localStorage.getItem('kirby-shop-guest-wishlist');
                if (guestWishlist) {
                    const wishlistData = JSON.parse(guestWishlist);
                    const userWishlistKey = `kirby-shop-wishlist-${newUser.id}`;
                    localStorage.setItem(userWishlistKey, JSON.stringify(wishlistData.map(item => ({
                        ...item,
                        isGuest: false,
                        migratedAt: new Date().toISOString()
                    }))));
                    localStorage.removeItem('kirby-shop-guest-wishlist');
                    localStorage.removeItem('kirby-shop-temp-wishlist');
                }
            } catch (migrationError) {
                console.error('데이터 이전 오류:', migrationError);
            }

            return {
                success: true,
                message: `회원가입을 축하합니다! 🎉 신규 회원에게 2,000 포인트가 지급되었습니다.`,
                user: newUser
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

    // ... 필요하다면 updateUser, changePassword 등도 추가로 넣을 수 있음!

    return (
        <AuthContext.Provider value={{
            user, isLoading, isAuthenticated,
            login, signup, logout,
            checkAuthStatus,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// 전역에서 사용할 커스텀 훅
export const useAuth = () => useContext(AuthContext);
