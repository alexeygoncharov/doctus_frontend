import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Spinner } from "../ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Используем напрямую useSession вместо useAuth для лучшей совместимости с Vercel
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Ждем завершения загрузки
    }
    
    // Проверяем наличие ошибки токена - это может вызывать бесконечную петлю
    if (session?.error === 'RefreshAccessTokenError') {
      console.error('Обнаружена ошибка токена в ProtectedRoute, выходим');
      // Не используем редирект здесь, просто возвращаемся
      return;
    }
    
    if (!isAuthenticated) {
      console.log('ProtectedRoute: Пользователь не аутентифицирован, перенаправление на страницу входа');
      // Простое перенаправление без параметров
      router.push('/auth/login');
    } else {
      console.log('ProtectedRoute: Пользователь аутентифицирован, разрешаем доступ');
    }
  }, [isAuthenticated, isLoading, router, session]);

  // Показываем спиннер во время загрузки или если пользователь не авторизован (до редиректа)
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen-minus-header">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  // Пользователь авторизован и загрузка завершена - рендерим контент
  return <>{children}</>;
};

export default ProtectedRoute;
