import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import SocialAuthButtons from '../../components/ui/social-auth-buttons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { returnUrl, callbackUrl } = router.query;

  // Если пользователь уже авторизован, перенаправляем его
  /*
  if (status === 'authenticated' && session?.user?.id) {
    console.log('Login page: User is authenticated, redirecting to', callbackUrl || returnUrl || '/');
    const redirectUrl = (callbackUrl || returnUrl || '/') as string;
    router.push(redirectUrl);
    return null;
  }
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      console.log('Attempting login with credentials', { email });
      
      // Получаем URL для перенаправления после успешного входа
      const redirectTo = (callbackUrl || returnUrl || '/') as string;
      console.log('Redirect URL after login:', redirectTo);
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: redirectTo
      });

      console.log('SignIn result:', { 
        ok: result?.ok, 
        error: result?.error,
        url: result?.url,
        status: result?.status
      });

      if (result?.error) {
        // Map specific error messages if needed
        let displayError = 'Неверный email или пароль';
        
        if (result.error === 'RefreshAccessTokenError') {
          displayError = 'Сессия устарела. Пожалуйста, войдите снова.';
        }
        
        setErrorMsg(displayError);
        console.error('Ошибка входа:', result.error);
      } else if (result?.ok) {
        // Успешная авторизация, ждем короткую задержку для гарантии инициализации сессии
        console.log('Login successful, redirecting after delay for session init');
        
        // Используем url из результата, если он есть, иначе fallback
        const redirectTarget = result?.url || redirectTo || '/';
        console.log('Will redirect to:', redirectTarget);
        
        // Небольшая задержка, чтобы дать NextAuth время обновить сессию
        setTimeout(() => {
          router.push(redirectTarget);
        }, 500);
      } else {
        // Непредвиденная ситуация - есть результат, но нет ни ошибки, ни признака успеха
        console.warn('Unexpected result from signIn:', result);
        setErrorMsg('Произошла непредвиденная ошибка при входе');
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      setErrorMsg('Произошла ошибка при входе в систему');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Вход | МедАссистент</title>
        <meta name="description" content="Вход в сервис МедАссистент для расшифровки медицинских анализов" />
      </Head>

      <div className="flex min-h-screen-minus-header">
        <div className="w-full flex flex-col justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto max-w-md">
          <div className="max-w-sm mx-auto w-full border border-[#E2E8F0] rounded-[9.6px] bg-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)] p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold mb-2">Вход в аккаунт</h1>
              <p className="text-gray-500 text-sm">
                Введите ваши данные для входа в систему
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-blue-500 hover:text-blue-600">
                      Забыли пароль?
                    </Link>
                  </div>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Запомнить меня
                </label>
              </div>

              {errorMsg && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {errorMsg}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? 'Вход...' : 'Войти'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <SocialAuthButtons callbackUrl={(callbackUrl || returnUrl || '/') as string} />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Ещё нет аккаунта?{' '}
                <Link href="/auth/register" className="font-medium text-blue-500 hover:text-blue-600">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;