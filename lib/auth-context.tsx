import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserProfile } from './api';

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  const cookieString = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax" + secureFlag;
  document.cookie = cookieString;
};

// Helper function to get a cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // Guard against SSR
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        return value;
    }
  }
  return null;
};

// Helper function to erase a cookie
const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return; // Guard against SSR
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax' + secureFlag;
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, name: string, password: string) => Promise<void>;
}

// Значения по умолчанию для контекста
const defaultContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  register: async () => {},
};

// Создаем контекст
const AuthContext = createContext<AuthContextType>(defaultContext);

// Hook для использования контекста авторизации
export const useAuth = () => useContext(AuthContext);

// Провайдер контекста
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Функция для входа пользователя
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const tokenResponse = await fetch(`${backendUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        mode: 'cors',
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`[Auth Login] Token request failed: ${tokenResponse.status}, ${errorText}`);
        throw new Error('Неверный email или пароль');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Сохраняем токен в localStorage и cookie (на 1 день)
      localStorage.setItem('auth_token', accessToken);
      setCookie('auth_token', accessToken, 1); // Устанавливаем куку!
      setToken(accessToken);

      // Получаем данные пользователя
      const userResponse = await fetch(`${backendUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        mode: 'cors',
      });

      if (!userResponse.ok) {
        eraseCookie('auth_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        const errorText = await userResponse.text();
        console.error(`[Auth Login] /auth/me request failed: ${userResponse.status}, ${errorText}`);
        throw new Error('Не удалось получить данные пользователя');
      }

      const userData = await userResponse.json();
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);

      // Перенаправляем на главную страницу или на returnUrl, если он есть
      const returnUrl = router.query.returnUrl || '/';
      const redirectTarget = typeof returnUrl === 'string' ? returnUrl : '/';
      router.push(redirectTarget);

    } catch (error) {
      console.error('[Auth Login] Login failed:', error);
      eraseCookie('auth_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setToken(null);
      setUser(null);
      throw error; // Пробрасываем ошибку для обработки на странице входа
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для регистрации пользователя
  const register = async (email: string, name: string, password: string) => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const registerResponse = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, name, password,
          medical_profile: { gender: "not_specified", height: 0, weight: 0 }
        }),
        mode: 'cors',
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        console.error(`[Auth Register] Register request failed: ${registerResponse.status}, ${errorText}`);
        throw new Error('Ошибка при регистрации');
      }

      await login(email, password);

    } catch (error) {
      console.error('[Auth Register] Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для выхода пользователя
  const logout = () => {
    eraseCookie('auth_token'); // Удаляем cookie
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setToken(null);
    router.push('/auth/login');
  };

  // При инициализации проверяем сохраненные данные
  useEffect(() => {
    const initAuth = async () => {
      let activeToken: string | null = null;
      let userDataFromStorage: UserProfile | null = null;

      try {
        const cookieToken = getCookie('auth_token');
        const storedToken = localStorage.getItem('auth_token');
        const storedUserDataRaw = localStorage.getItem('user_data');

        if (cookieToken) {
            activeToken = cookieToken;
            if (storedToken !== cookieToken) {
                localStorage.setItem('auth_token', cookieToken);
            }
        } else if (storedToken) {
            activeToken = storedToken;
            setCookie('auth_token', storedToken, 1);
        }

        if (storedUserDataRaw) {
            try {
                userDataFromStorage = JSON.parse(storedUserDataRaw);
            } catch (e) {
                console.error('[Auth Init] Error parsing stored user data:', e);
                localStorage.removeItem('user_data');
            }
        }

        if (activeToken) {
            setToken(activeToken);
            if (userDataFromStorage) {
                setUser(userDataFromStorage);
            }

            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${backendUrl}/auth/me`, {
                  headers: { 'Authorization': `Bearer ${activeToken}` },
                  mode: 'cors',
                });

                if (response.ok) {
                  const freshUserData = await response.json();
                  setUser(freshUserData);
                  localStorage.setItem('user_data', JSON.stringify(freshUserData));
                } else {
                  console.warn(`[Auth Init] Token verification failed (status: ${response.status}). Logging out.`);
                  logout();
                  activeToken = null;
                }
            } catch (error) {
                console.error('[Auth Init] Network error during token verification:', error);
            }
        } else {
           setToken(null);
           setUser(null);
        }

      } catch (error) {
        console.error('[Auth Init] Error during auth initialization:', error);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
