"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { X, CheckCircle } from "lucide-react";
import { 
  getStrapiPlans, 
  subscribeToPlan, 
  StrapiPlan, 
  SubscriptionResponse 
} from "../../lib/api";
import { PaymentProcessor } from "../payment/PaymentProcessor";

export type PeriodType = '1m' | '3m' | '6m' | '12m';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionResponse | null;
  onSubscribe: (planId: number, strapiPlanId?: number, period?: string) => Promise<void>;
  loading?: boolean;
}

export function PricingModal({ 
  isOpen, 
  onClose, 
  subscription, 
  onSubscribe,
  loading = false 
}: PricingModalProps) {
  const [strapiPlans, setStrapiPlans] = useState<StrapiPlan[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('1m');
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем планы при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);
  
  // Эффект для отображения выбранной цены при изменении периода
  useEffect(() => {
    // console.log('Selected period changed:', selectedPeriod);
    if (getPremiumPlan()) {
      // console.log('Premium plan prices:', {
      //   price: getPremiumPlan()?.price,
      //   price_3m: getPremiumPlan()?.price_3m,
      //   price_6m: getPremiumPlan()?.price_6m,
      //   price_12m: getPremiumPlan()?.price_12m
      // });
    }
  }, [selectedPeriod, strapiPlans]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      setError(null);
      
      const response = await getStrapiPlans();
      setStrapiPlans(response.data || []);
      // console.log('Strapi plans loaded:', response.data);
    } catch (error) {
      console.error('Error loading Strapi plans:', error);
      setError('Не удалось загрузить тарифные планы');
    } finally {
      setLoadingPlans(false);
    }
  };

  // Функция для получения цены в зависимости от выбранного периода
  const getPlanPrice = (plan: StrapiPlan): number => {
    // Выводим в консоль для отладки все цены
    // console.log('Plan prices:', {
    //   price: plan.price,
    //   price_3m: plan.price_3m,
    //   price_6m: plan.price_6m,
    //   price_12m: plan.price_12m,
    //   selectedPeriod
    // });
    
    switch (selectedPeriod) {
      case '3m':
        return plan.price_3m || plan.price || 0;
      case '6m':
        return plan.price_6m || plan.price || 0;
      case '12m':
        return plan.price_12m || plan.price || 0;
      default:
        return plan.price || 0;
    }
  };

  // Функция для получения текста периода
  const getPeriodText = (): string => {
    switch (selectedPeriod) {
      case '3m':
        return '3 месяца';
      case '6m':
        return '6 месяцев';
      case '12m':
        return '1 год';
      default:
        return 'месяц';
    }
  };

  // Проверка наличия типа плана по названию
  const isPlanType = (plan: StrapiPlan, type: string): boolean => {
    if (type === 'free') {
      return plan.price === 0;
    } else if (type === 'premium') {
      return plan.price > 0;
    }
    return false;
  };

  // Получаем планы по типу
  const getFreePlan = (): StrapiPlan | undefined => {
    return strapiPlans.find(p => isPlanType(p, 'free'));
  };

  const getPremiumPlan = (): StrapiPlan | undefined => {
    return strapiPlans.find(p => isPlanType(p, 'premium'));
  };
  
  // Функция для получения преимуществ плана из Benefits
  const getPlanBenefits = (plan: StrapiPlan | undefined): string[] => {
    if (!plan || !plan.benefits) {
      return [];
    }
    
    // Разбиваем текст benefits на строки по переносу строки
    return plan.benefits.split('\n').filter(benefit => benefit.trim().length > 0);
  };

  // Преобразуем период из строки в число
  const getPeriodMonths = (): number => {
    switch (selectedPeriod) {
      case '3m': return 3;
      case '6m': return 6;
      case '12m': return 12;
      default: return 1;
    }
  };

  // Обработчик успешной оплаты
  const handlePaymentSuccess = () => {
    // Закрываем модальное окно после перенаправления на страницу оплаты
    onClose();
  };

  // Обработчик ошибки оплаты
  const handlePaymentError = (error: any) => {
    setError(`Ошибка при создании платежа: ${error.message || 'Неизвестная ошибка'}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Тарифные планы</DialogTitle>
          <Button
            className="absolute right-4 top-4"
            onClick={onClose}
            size="icon"
            variant="outline"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {loadingPlans ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadPlans}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <>
            {/* Plans */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Free Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    {getFreePlan()?.name || "Бесплатный тариф"}
                  </h3>
                  <div className="mt-2 flex items-end">
                    <span className="text-3xl font-bold">0₽</span>
                    <span className="text-gray-500 ml-1">/месяц</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  {getFreePlan() && getPlanBenefits(getFreePlan()).length > 0 ? (
                    // Используем benefits из Strapi
                    <>
                      {getPlanBenefits(getFreePlan()).map((benefit, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Если планы из Strapi не загружены, используем дефолтные
                    <>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">10 сообщений в день</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Базовый доступ к терапевту и неврологу</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Загрузка до 5 файлов в день</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-4">
                    {!subscription ? 'Вы используете бесплатный тариф' : ''}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    disabled={!subscription}
                    onClick={() => subscription && onSubscribe(0)}
                  >
                    {!subscription ? 'Текущий тариф' : 'Перейти на бесплатный'}
                  </Button>
                </div>
              </div>
              
              {/* Premium Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Рекомендуем
                </div>
                
                {/* Premium plan period selector */}
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-md flex divide-x divide-gray-300">
                    <button 
                      className={`flex-1 py-2 text-sm font-medium ${selectedPeriod === '1m' ? 'bg-blue-500 text-white' : 'text-gray-700'} rounded-l-md transition`}
                      onClick={() => setSelectedPeriod('1m')}
                    >
                      1 месяц
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium ${selectedPeriod === '3m' ? 'bg-blue-500 text-white' : 'text-gray-700'} transition`}
                      onClick={() => setSelectedPeriod('3m')}
                    >
                      3 месяца
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium ${selectedPeriod === '6m' ? 'bg-blue-500 text-white' : 'text-gray-700'} transition`}
                      onClick={() => setSelectedPeriod('6m')}
                    >
                      6 месяцев
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium ${selectedPeriod === '12m' ? 'bg-blue-500 text-white' : 'text-gray-700'} rounded-r-md transition`}
                      onClick={() => setSelectedPeriod('12m')}
                    >
                      1 год
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    {getPremiumPlan()?.name || "+Plus тариф"}
                  </h3>
                  <div className="mt-2 flex items-end">
                    {getPremiumPlan() ? (
                      <>
                        <span className="text-3xl font-bold">
                          {getPlanPrice(getPremiumPlan()!)}₽
                        </span>
                        <span className="text-gray-500 ml-1">/{getPeriodText()}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">299₽</span>
                        <span className="text-gray-500 ml-1">/месяц</span>
                      </>
                    )}
                  </div>
                  
                  {/* Display savings */}
                  {selectedPeriod !== '1m' && getPremiumPlan() && (
                    <div className="mt-1">
                      <span className="text-xs text-green-600">
                        {(() => {
                          const premiumPlan = getPremiumPlan()!;
                          const regularPrice = premiumPlan.price || 0;
                          const currentPrice = getPlanPrice(premiumPlan);
                          const months = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
                          const savings = (regularPrice * months - currentPrice) / (regularPrice * months) * 100;
                          return `Экономия ${Math.round(savings)}%`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-4">
                  {getPremiumPlan() && getPlanBenefits(getPremiumPlan()).length > 0 ? (
                    // Используем benefits из Strapi
                    <>
                      {getPlanBenefits(getPremiumPlan()).map((benefit, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Если планы из Strapi не загружены, используем дефолтные
                    <>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Безлимитные сообщения</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Доступ ко всем специалистам (15+ докторов)</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Неограниченная загрузка файлов и фото</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Приоритетная поддержка</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6">
                  {subscription && subscription.plan.id === getPremiumPlan()?.id ? (
                    <p className="text-xs text-gray-500 mb-4">
                      Вы уже используете этот тариф
                    </p>
                  ) : (
                    <PaymentProcessor
                      planId={getPremiumPlan()?.id || 0}
                      periodMonths={getPeriodMonths()}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      buttonText={subscription ? 'Перейти на Premium' : 'Оформить подписку'}
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Отмена подписки в любое время. Автоматическое списание средств после пробного периода.</p>
              <p className="mt-2">При оплате вы соглашаетесь с условиями пользовательского соглашения.</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}