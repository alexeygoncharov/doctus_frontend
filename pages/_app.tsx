import '@/styles/globals.css';
import '@/styles/overrides.css';
import type { AppProps } from 'next/app';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import { useEffect, useState, createContext } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import Head from 'next/head';
import { AuthProvider } from '@/lib/auth-context';

// Необходимо для TypeScript, чтобы распознавал глобальные функции
declare global {
  interface Window {
    openProfile: () => void;
    closeMobileMenu: () => void;
    updateUserAvatar: (avatarUrl: string) => void;
  }
}

// Создаем контекст для обновления аватара
export const AvatarContext = createContext({
  avatarUrl: '',
  updateAvatar: (url: string) => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith('/auth/');
  
  // Состояние для аватара - инициализируем из session если есть
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Инициализация аватара из localStorage
  useEffect(() => {
    // Проверяем localStorage при первой загрузке
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
        console.log('Initial avatar loaded from localStorage:', savedAvatar);
      }
    }
  }, []);

  useEffect(() => {
    // Настройка NProgress для отображения загрузки страницы
    const handleStart = () => {
      NProgress.start();
    };
    
    const handleComplete = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  useEffect(() => {
    // Добавляем обработчик для деталей (details)
    const detailsElements = document.querySelectorAll('details');
    
    const handleDetailsToggle = function(this: HTMLDetailsElement) {
      if (this.open) {
        // Закрываем остальные детали при открытии текущей
        detailsElements.forEach(otherDetail => {
          if (otherDetail !== this && otherDetail.open) {
            otherDetail.open = false;
          }
        });
      }
    };
    
    detailsElements.forEach(detail => {
      detail.addEventListener('toggle', handleDetailsToggle);
    });

    // Функция для обработки обновления аватара
    window.updateUserAvatar = (newAvatarUrl: string) => {
      setAvatarUrl(newAvatarUrl);
      // Сохраняем в localStorage для доступа между сессиями
      localStorage.setItem('userAvatar', newAvatarUrl);
      console.log('Avatar updated via global function:', newAvatarUrl);
    };

    // Функция для обработки профиля
    window.openProfile = () => {
      const profileMenu = document.getElementById('profile-menu');
      if (profileMenu) {
        const dropDown = profileMenu.previousElementSibling;
        const isVisible = profileMenu.classList.contains('opacity-100');
        
        if (dropDown) {
          dropDown.classList.toggle('rotate-180');
        }
        
        if (isVisible) {
          profileMenu.classList.remove('opacity-100', 'visible', 'translate-y-1');
          profileMenu.classList.add('opacity-0', 'invisible', '-translate-y-1');
        } else {
          profileMenu.classList.add('opacity-100', 'visible', 'translate-y-1');
          profileMenu.classList.remove('opacity-0', 'invisible', '-translate-y-1');
        }
      }
    };
    
    // Функция для закрытия мобильного меню
    window.closeMobileMenu = () => {
      const mobileMenuElements = document.querySelectorAll('[data-mobile-menu]');
      mobileMenuElements.forEach(menu => {
        if (menu instanceof HTMLElement) {
          const overlay = menu.querySelector('[data-mobile-menu-overlay]');
          const content = menu.querySelector('[data-mobile-menu-content]');
          
          if (overlay instanceof HTMLElement) {
            overlay.classList.remove('opacity-100', 'visible');
            overlay.classList.add('opacity-0', 'invisible');
          }
          
          if (content instanceof HTMLElement) {
            content.classList.remove('translate-x-0');
            content.classList.add('translate-x-full');
          }
        }
      });
    };

    // Закрытие меню профиля при клике вне его
    const handleDocumentClick = (event: MouseEvent) => {
      const profileMenu = document.getElementById('profile-menu');
      if (profileMenu) {
        const dropDown = profileMenu.previousElementSibling;
        
        if (profileMenu && dropDown && 
            !profileMenu.contains(event.target as Node) && 
            !dropDown.contains(event.target as Node)) {
          
          if (dropDown) {
            dropDown.classList.remove('rotate-180');
          }
          
          profileMenu.classList.remove('opacity-100', 'visible', 'translate-y-1');
          profileMenu.classList.add('opacity-0', 'invisible', '-translate-y-1');
        }
      }
    };
    
    document.addEventListener('click', handleDocumentClick);

    return () => {
      // Удаляем обработчики событий при размонтировании компонента
      detailsElements.forEach(detail => {
        detail.removeEventListener('toggle', handleDetailsToggle);
      });
      
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="ИИ доктор - онлайн консультация с искусственным интеллектом. Расшифровка анализов, медицинские рекомендации." />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AvatarContext.Provider value={{ avatarUrl, updateAvatar: setAvatarUrl }}>
        {isAuthPage ? (
          <AuthLayout>
            <Component {...pageProps} />
          </AuthLayout>
        ) : (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        )}
      </AvatarContext.Provider>
    </AuthProvider>
  );
}