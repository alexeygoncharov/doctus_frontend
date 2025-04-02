import React, { createContext, useContext, ReactNode, useState } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import { UserProfile } from './api'; // Assuming this defines the user structure you need

// Расширяем существующие типы из next-auth, добавляя только нужные поля
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

interface AppAuthContextType {
  user: (UserProfile & { id: string }) | null | undefined; // User profile or null/undefined during loading
  token: string | null | undefined; // Access token or null/undefined
  isLoading: boolean; // Loading state from useSession
  isAuthenticated: boolean; // Based on session status
  login: (email: string, password: string) => Promise<void>; // Using signIn from next-auth
  logout: () => void; // Using signOut from next-auth
  register: (email: string, name: string, password: string) => Promise<void>; // Keep your custom register logic
}

// Default context value matching the type
const defaultContext: AppAuthContextType = {
  user: undefined, // Start as undefined
  token: undefined,
  isLoading: true, // Initially loading
  isAuthenticated: false,
  login: async () => { throw new Error('Login function not implemented'); },
  logout: () => { throw new Error('Logout function not implemented'); },
  register: async () => { throw new Error('Register function not implemented'); },
};

const AppAuthContext = createContext<AppAuthContextType>(defaultContext);

export const useAuth = () => useContext(AppAuthContext);

// Internal provider component that uses useSession hook
const AuthProviderInternal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const [isRegistering, setIsRegistering] = useState(false);

  // Custom registration function (assuming it hits your backend directly)
  const register = async (email: string, name: string, password: string) => {
    // Replace with your actual registration API call logic
    try {
      setIsRegistering(true); // Используем отдельное состояние для регистрации
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const registerResponse = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name, // Ensure your backend expects 'name' and not 'full_name' here
          password,
          medical_profile: { gender: "not_specified", height: 0, weight: 0 } // Or handle this separately
        }),
        mode: 'cors',
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        console.error(`[Auth Register] Register request failed: ${registerResponse.status}, ${errorText}`);
        // Try to parse backend error detail
        let detail = 'Ошибка при регистрации';
        try {
          const errorJson = JSON.parse(errorText);
          detail = errorJson.detail || detail;
        } catch (e) { /* ignore json parse error */ }
        throw new Error(detail);
      }

      // After successful registration, automatically log the user in
      await login(email, password);

    } catch (error) {
      console.error('[Auth Register] Registration failed:', error);
      throw error; // Re-throw the error for the UI to handle
    } finally {
      setIsRegistering(false); // Выключаем состояние загрузки
    }
  };

  // Login function using next-auth signIn
  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false, // Prevent NextAuth from redirecting automatically
      email,
      password,
    });

    if (result?.error) {
      console.error('[Auth Login] NextAuth signIn failed:', result.error);
       // Map common NextAuth errors or use the error directly
       let errorMessage = 'Неверный email или пароль'; // Default message
       if (result.error === 'CredentialsSignin') {
           // This is the typical error for bad credentials passed from authorize
           // You might have thrown a custom error message from authorize
           // However, NextAuth often masks the specific message here.
           // Consider checking session?.error after the hook updates if needed.
           errorMessage = 'Учетные данные неверны. Пожалуйста, проверьте email и пароль.';
       } else {
           // Handle other potential errors (network, configuration, etc.)
           errorMessage = `Ошибка входа: ${result.error}`;
       }
      throw new Error(errorMessage);
    }

    // No need to manually set user/token here, useSession handles it
    // No need to manually redirect, handle redirects in the page using router based on status
    console.log('[Auth Login] NextAuth signIn successful');
  };

  // Logout function using next-auth signOut
  const logout = () => {
    signOut({ callbackUrl: '/auth/login' }); // Redirect to login after sign out
    // No need to manually clear state, SessionProvider handles it
  };

  const value: AppAuthContextType = {
    // Use optional chaining and type assertion as needed
    user: session?.user as (UserProfile & { id: string }) | null | undefined,
    token: session?.accessToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register, // Include your custom register function
  };

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
};

// The main AuthProvider that wraps everything in NextAuth's SessionProvider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SessionProvider> {/* Removed refetchInterval for simplicity, add if needed */}
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </SessionProvider>
  );
};

export default AppAuthContext; // Export the context itself if needed elsewhere
