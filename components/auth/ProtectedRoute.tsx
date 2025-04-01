import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Ждем завершения загрузки
    }
    
    if (!isAuthenticated) {
      // Сохраняем текущий путь для редиректа после логина
      const returnUrl = encodeURIComponent(router.asPath);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoading, router]);

  // Показываем спиннер во время загрузки или если пользователь не авторизован (до редиректа)
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen-minus-header">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Пользователь авторизован и загрузка завершена - рендерим контент
  return <>{children}</>;
};

export default ProtectedRoute;
