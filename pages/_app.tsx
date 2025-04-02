import '@/styles/globals.css';
import '@/styles/overrides.css';
import type { AppProps } from 'next/app';
// import { SessionProvider } from 'next-auth/react'; // SessionProvider now comes from AuthProvider
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { useEffect, useState, createContext } from 'react';
import 'nprogress/nprogress.css';
import Head from 'next/head';
import { AuthProvider } from '@/lib/auth-context'; // This now includes SessionProvider
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Необходимо для TypeScript, чтобы распознавал глобальные функции
declare global {
  interface Window {
    openProfile: () => void;
    closeMobileMenu: () => void;
    updateUserAvatar?: (avatarUrl: string) => void;
  }
}

// Контекст для управления аватаром пользователя (можно оставить, если используется)
interface AvatarContextType {
  avatarUrl: string | null;
  updateAvatar: (url: string | null) => void;
}

export const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: null,
  updateAvatar: () => {},
});

// Note: We removed `session` from pageProps destructuring as SessionProvider handles it
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith('/auth/');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Инициализация аватара из localStorage (можно оставить)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
        console.log('Initial avatar loaded from localStorage:', savedAvatar);
      }
    }
  }, []);

  // NProgress logic (оставить)
  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  // UI interaction logic (details toggle, profile menu, mobile menu) - можно оставить
  useEffect(() => {
    const detailsElements = document.querySelectorAll('details');
    const handleDetailsToggle = function(this: HTMLDetailsElement) {
      if (this.open) {
        detailsElements.forEach(otherDetail => {
          if (otherDetail !== this && otherDetail.open) {
            otherDetail.open = false;
          }
        });
      }
    };
    detailsElements.forEach(detail => detail.addEventListener('toggle', handleDetailsToggle));

    window.updateUserAvatar = (avatarUrl: string) => {
      console.log('Avatar updated via global function:', avatarUrl);
      
      // Обновляем в localStroage для будущих загрузок страницы
      localStorage.setItem('userAvatar', avatarUrl);
      
      // Обновляем другие компоненты через контекст
      if (setAvatarUrl) {
        setAvatarUrl(avatarUrl);
      }
      
      // Обновляем все аватары в DOM напрямую
      setTimeout(() => {
        const avatarImages = document.querySelectorAll('img[alt*="Пользователь"], img[class*="avatar"], img[class*="profile"]');
        avatarImages.forEach(img => {
          const fullUrl = avatarUrl.startsWith('http') 
            ? avatarUrl 
            : `${process.env.NEXT_PUBLIC_API_URL || 'https://backend.doctus.chat'}${avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`}`;
          
          (img as HTMLImageElement).src = fullUrl;
          // Проверяем, есть ли родительский элемент со стилем background-image
          const parent = img.parentElement;
          if (parent) {
            parent.style.backgroundImage = `url(${fullUrl})`;
          }
        });
      }, 100);
    };

    window.openProfile = () => {
       const profileMenu = document.getElementById('profile-menu');
       if (profileMenu) {
         const dropDown = profileMenu.previousElementSibling;
         const isVisible = profileMenu.classList.contains('opacity-100');
         dropDown?.classList.toggle('rotate-180');
         if (isVisible) {
           profileMenu.classList.remove('opacity-100', 'visible', 'translate-y-1');
           profileMenu.classList.add('opacity-0', 'invisible', '-translate-y-1');
         } else {
           profileMenu.classList.add('opacity-100', 'visible', 'translate-y-1');
           profileMenu.classList.remove('opacity-0', 'invisible', '-translate-y-1');
         }
       }
    };

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

    const handleDocumentClick = (event: MouseEvent) => {
       const profileMenu = document.getElementById('profile-menu');
       if (profileMenu) {
         const dropDown = profileMenu.previousElementSibling;
         if (profileMenu && dropDown &&
             !profileMenu.contains(event.target as Node) &&
             !dropDown.contains(event.target as Node)) {
           dropDown.classList.remove('rotate-180');
           profileMenu.classList.remove('opacity-100', 'visible', 'translate-y-1');
           profileMenu.classList.add('opacity-0', 'invisible', '-translate-y-1');
         }
       }
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      detailsElements.forEach(detail => detail.removeEventListener('toggle', handleDetailsToggle));
      document.removeEventListener('click', handleDocumentClick);
      // Очищаем при размонтировании компонента
      window.updateUserAvatar = undefined;
    };
  }, [setAvatarUrl]);

  return (
    // Wrap the entire app in AuthProvider, which now includes SessionProvider
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="ИИ доктор - онлайн консультация с искусственным интеллектом. Расшифровка анализов, медицинские рекомендации." />
        <link rel="icon" href="/favicon.png" />
      </Head>
      {/* AvatarContext can wrap the layout if needed by components within */}
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
