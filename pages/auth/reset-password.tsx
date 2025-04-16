import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Получаем токен из URL
    if (router.isReady) {
      const { token: urlToken } = router.query;
      if (urlToken && typeof urlToken === 'string') {
        setToken(urlToken);
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем совпадение паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    // Проверяем наличие токена
    if (!token) {
      setError('Отсутствует токен сброса пароля');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/reset-password/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Пароль успешно изменен');
        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.detail || 'Произошла ошибка при сбросе пароля');
      }
    } catch (err) {
      setError('Не удалось отправить запрос. Пожалуйста, проверьте подключение к интернету.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Сброс пароля | Доктус</title>
        <meta name="description" content="Сброс пароля Доктус" />
      </Head>
      
      <div className="flex min-h-screen-minus-header">
        <div className="w-full flex flex-col justify-center px-4 py-12 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto max-w-md">
          <div className="max-w-sm mx-auto w-full border border-[#E2E8F0] rounded-[9.6px] bg-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)] p-6">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-semibold mb-2">Сброс пароля</h1>
              <p className="text-sm text-gray-600">
                Введите новый пароль
              </p>
            </div>
            
            {!token && !message ? (
              <div className="text-center">
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  Отсутствует токен сброса пароля в URL.
                </p>
                <p className="mt-4">
                  <Link href="/auth/forgot-password" className="text-sm text-blue-500 hover:text-blue-600">
                    Запросить сброс пароля снова
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Новый пароль
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите новый пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting || !!message}
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Подтвердите пароль
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Повторите новый пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting || !!message}
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                    {message}
                    <p className="mt-2">Перенаправление на страницу входа...</p>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !!message || !token}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить новый пароль'}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <Link href="/auth/login" className="text-sm text-blue-500 hover:text-blue-600">
                    Вернуться к входу
                  </Link>
                </div>
              </form>
            )}
            
            <div className="mt-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">или войти с помощью</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                    </svg>
                    <span className="sr-only">Google</span>
                  </button>
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <svg className="h-5 w-5 text-[#4C75A3]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M31.4907 63.4907C0 94.9813 0 145.671 0 247.04V264.96C0 366.329 0 417.019 31.4907 448.509C62.9813 480 113.671 480 215.04 480H232.96C334.329 480 385.019 480 416.509 448.509C448 417.019 448 366.329 448 264.96V247.04C448 145.671 448 94.9813 416.509 63.4907C385.019 32 334.329 32 232.96 32H215.04C113.671 32 62.9813 32 31.4907 63.4907ZM75.6 168.267H126.747C128.427 253.76 166.133 289.973 196 297.44V168.267H244.16V242C273.653 238.827 304.64 205.227 315.093 168.267H363.253C359.313 187.435 351.46 205.583 340.186 221.579C328.913 237.574 314.461 251.071 297.733 261.227C316.41 270.499 332.907 283.63 346.132 299.751C359.357 315.873 369.01 334.618 374.453 354.747H321.44C316.555 337.262 306.614 321.61 292.865 309.754C279.117 297.899 262.173 290.368 244.16 288.107V354.747H238.373C136.267 354.747 78.0267 284.747 75.6 168.267Z"></path>
                    </svg>
                    <span className="sr-only">VK</span>
                  </button>
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <svg className="h-5 w-5 text-[#FF3333]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.04 12c0-5.523 4.476-10 10-10 5.522 0 10 4.477 10 10s-4.478 10-10 10c-5.524 0-10-4.477-10-10zm13.758-3.056c0-1.549-1.22-2.265-2.666-2.265h-2.842v10.67h1.85v-3.997h.78l1.984 3.997h2.089l-2.27-4.088c1.305-.307 2.075-1.43 2.075-3.144v-1.173zm-3.658 3.535h-.865V8.353h.865c1.035 0 1.601.443 1.601 2.06 0 1.058-.179 2.066-1.601 2.066z"></path>
                    </svg>
                    <span className="sr-only">Yandex</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Еще нет аккаунта? <Link href="/auth/register" className="font-medium text-blue-500 hover:text-blue-600">Зарегистрироваться</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 