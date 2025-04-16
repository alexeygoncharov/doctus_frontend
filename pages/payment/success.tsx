import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // router.push('/dashboard'); // Или другой нужный путь
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#EAF1FC] to-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl sm:p-12">
        <CheckCircle
          size={64}
          className="mx-auto mb-6 text-green-500"
        />
        <h1 className="mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl">
          Оплата прошла успешно!
        </h1>
        <p className="mb-6 text-base text-gray-600 sm:text-lg">
          Спасибо за вашу подписку. Ваш доступ обновлен.
        </p>
        <p className="mb-8 text-sm text-gray-500">
          Вы будете автоматически перенаправлены через несколько секунд, или можете перейти на главную страницу.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-[#3d81fd] px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-[#2a6bcd] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Перейти на главную
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 