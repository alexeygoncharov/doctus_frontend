import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import SocialAuthButtons from '../../components/ui/social-auth-buttons';
import { useAuth } from '../../lib/auth-context';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Валидация полей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }
    
    setLoading(true);
    
    try {
      // Формируем полное имя
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // Используем функцию register из AuthContext
      await register(formData.email, fullName, formData.password);
      
      // Перенаправление происходит внутри register
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Регистрация | МедАссистент</title>
        <meta name="description" content="Регистрация в сервисе МедАссистент для расшифровки медицинских анализов" />
      </Head>

      <div className="flex min-h-screen-minus-header">
        <div className="w-full flex flex-col justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto max-w-md">
          <div className="max-w-sm mx-auto w-full border border-[#E2E8F0] rounded-[9.6px] bg-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)] p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold mb-2">Создание аккаунта</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Минимум 8 символов"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Подтверждение пароля</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center mt-4">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                  Я согласен с <Link href="/terms" className="text-blue-500 hover:text-blue-600">условиями использования</Link> и <Link href="/privacy" className="text-blue-500 hover:text-blue-600">политикой конфиденциальности</Link>
                </label>
              </div>

              {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <SocialAuthButtons callbackUrl="/" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="font-medium text-blue-500 hover:text-blue-600">
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;