import { useState } from 'react';
import { createPayment, PaymentResponse } from '../../lib/api';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentProcessorProps {
  planId: number;
  periodMonths: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  buttonText?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function PaymentProcessor({
  planId,
  periodMonths,
  onSuccess,
  onError,
  buttonText = 'Оплатить',
  className = '',
  variant = 'default'
}: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Создаем платеж
      const payment = await createPayment(planId, periodMonths);
      
      // Перенаправляем пользователя на страницу оплаты
      if (payment && payment.confirmation_url) {
        window.location.href = payment.confirmation_url;
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Не удалось получить URL для оплаты');
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className}
      variant={variant}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Подготовка платежа...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
} 