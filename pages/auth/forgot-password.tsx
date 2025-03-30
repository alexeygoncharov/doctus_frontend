import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/reset-password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Инструкции по сбросу пароля отправлены на ваш email');
        setEmail('');
      } else {
        setError(data.detail || 'Произошла ошибка при запросе сброса пароля');
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
        <title>Восстановление пароля | МедАссистент</title>
        <meta name="description" content="Восстановление пароля МедАссистент" />
      </Head>

      <div className="flex min-h-screen-minus-header">
        <div className="w-full flex flex-col justify-center px-4 py-12 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto max-w-md">
          <div className="max-w-sm mx-auto w-full border border-[#E2E8F0] rounded-[9.6px] bg-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)] p-6">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-semibold mb-2">Восстановление пароля</h1>
              <p className="text-sm text-gray-600">
                Введите ваш email, и мы отправим вам ссылку для сброса пароля
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
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
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить инструкции'}
                </button>
              </div>

              <div className="text-center mt-4">
                <Link href="/auth/login" className="text-sm text-blue-500 hover:text-blue-600">
                  Вернуться к входу
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 