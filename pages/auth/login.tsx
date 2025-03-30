import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import SocialAuthButtons from '../../components/ui/social-auth-buttons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Используем NextAuth для аутентификации
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        throw new Error('Неверный email или пароль');
      }
      
      // Перенаправляем на главную страницу
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Вход | МедАссистент</title>
        <meta name="description" content="Вход в личный кабинет МедАссистент" />
      </Head>

      <div className="flex min-h-screen-minus-header">
        <div className="w-full flex flex-col justify-center px-4 py-12 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto max-w-md">
          <div className="max-w-sm mx-auto w-full border border-[#E2E8F0] rounded-[9.6px] bg-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)] p-6">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-semibold mb-2">Вход в личный кабинет</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Пароль</label>
                  <Link href="/auth/forgot-password" className="text-sm text-blue-500 hover:text-blue-600">
                    Забыли пароль?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Запомнить меня
                  </label>
                </div>
              </div>

              {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <SocialAuthButtons callbackUrl="/" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Еще нет аккаунта?{' '}
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