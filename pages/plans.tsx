import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PricingModal, PeriodType } from '../components/pricing/pricing-modal';
import { getStrapiPlans, StrapiPlan } from '../lib/api';
import { CheckCircle } from 'lucide-react';
import { PaymentProcessor } from '../components/payment/PaymentProcessor';

// Определяем тип для элементов FAQ
type FaqItem = {
  question: string;
  answer: string;
};

// Выносим данные FAQ в массив для удобства
const faqItems: FaqItem[] = [
  {
    question: "Как работает подписка?",
    answer: "После выбора тарифного плана вы получаете доступ ко всем функциям, включенным в ваш план. Вы можете отменить подписку в любой момент через личный кабинет. При отмене подписки вы сохраняете доступ до конца оплаченного периода."
  },
  {
    question: "Какие способы оплаты доступны?",
    answer: "Мы принимаем оплату банковскими картами Visa, MasterCard, МИР, а также через электронные платежные системы и мобильные платежи. Все платежи обрабатываются безопасно с использованием шифрования."
  },
  {
    question: "Могу ли я изменить тарифный план?",
    answer: "Да, вы можете изменить тарифный план в любое время через личный кабинет. При переходе на более дорогой план вы доплачиваете разницу за оставшийся период. При переходе на более дешевый план изменения вступят в силу со следующего платежного периода."
  },
  {
    question: "Есть ли возврат средств?",
    answer: "Мы предлагаем полный возврат средств в течение 14 дней с момента оплаты, если вы не удовлетворены нашим сервисом. Для возврата свяжитесь с нашей службой поддержки через личный кабинет."
  },
  {
    question: "Как быстро я могу начать пользоваться сервисом?",
    answer: "Доступ к сервису предоставляется сразу после оплаты. Вы можете начать пользоваться всеми функциями вашего тарифного плана немедленно после регистрации или обновления подписки."
  }
];

const PlansPage = () => {
  const [strapiPlans, setStrapiPlans] = useState<StrapiPlan[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('1m');
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null); // Состояние для открытого FAQ

  // Загружаем тарифные планы при загрузке страницы
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const response = await getStrapiPlans();
        setStrapiPlans(response.data || []);
        console.log('Strapi plans loaded:', response.data);
      } catch (error) {
        console.error('Error loading Strapi plans:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, []);
  
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

  // Функция для получения цены в зависимости от выбранного периода
  const getPlanPrice = (plan: StrapiPlan): number => {
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

  // Преобразуем период из строки в число
  const getPeriodMonths = (): number => {
    switch (selectedPeriod) {
      case '3m': return 3;
      case '6m': return 6;
      case '12m': return 12;
      default: return 1;
    }
  };

  const handlePaymentError = (error: any) => {
    setPaymentError(`Ошибка при создании платежа: ${error.message || 'Неизвестная ошибка'}`);
    setTimeout(() => setPaymentError(null), 5000);
  };

  return (
    <>
      <Head>
        <title>Планы подписки | МедАссистент</title>
        <meta name="description" content="Выберите подходящий тарифный план для расшифровки медицинских анализов и консультаций с ИИ-докторами" />
      </Head>

      <section className="px-0 md:px-2">
        <div className="pt-6 md:pt-15 pb-10 md:pb-20 px-4 md:rounded-2xl lg:rounded-5 bg-linear-to-b from-[#EAF1FC] to-slate-50">
          <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
            <div className="bg-white flex items-center gap-4 md:gap-1 rounded-3xl py-2 px-4 md:px-5 max-w-64.5 md:max-w-full">
              <Image src="/images/icons/stars.svg" alt="Start" width={40} height={40} />
              <span className="text-xs md:text-sm">Умные советы ИИ для быстрых и достоверных результатов</span>
            </div>
            <h1 className="text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold max-w-227.5">Планы подписки</h1>
            <p className="text-center max-w-227.5 text-sm sm:text-base md:text-lg lg:text-[21px] lg:-md-4 lg:-mt-5">Задайте вопрос ИИ доктору, загрузите ваши анализы, фото и получите подробную расшифровку с рекомендациями от искусственного интеллекта</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-6 max-w-181 w-full mx-auto mt-4 md:mt-0">
            {loading ? (
              <div className="col-span-2 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Free Plan */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
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
                    <Link 
                      href="/consult"
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      Начать бесплатно
                    </Link>
                  </div>
                </div>
                
                {/* Premium Plan */}
                <div className="bg-white border-2 border-blue-500 rounded-lg p-6 relative">
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
                          <span className="text-3xl font-bold">1299₽</span>
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
                          <span className="text-sm text-gray-600">Премиум качество моделей ИИ (более точные ответы)</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Приоритетная поддержка</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    {paymentError && (
                      <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                        {paymentError}
                      </div>
                    )}
                    
                    <PaymentProcessor
                      planId={getPremiumPlan()?.id || 0}
                      periodMonths={getPeriodMonths()}
                      onError={handlePaymentError}
                      buttonText="Оформить подписку"
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </section>
      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4" id="capabilities">
        <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Наши возможности</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3.5 w-full">
            <div className="bg-white rounded-xl shadow-sm py-4 px-6 sm:p-6">
              <Image src="/images/icons/possibility1.svg" alt="Доступность 24/7" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Доступность 24/7</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Получайте медицинские консультации <br /> в любое время суток, без очередей и ожидания</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/images/icons/possibility2.svg" alt="Точность анализа" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Точность анализа</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Используем передовые алгоритмы ИИ для обеспечения высокой точности медицинских рекомендаций</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/images/icons/possibility3.svg" alt="Персонализация" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Персонализация</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Индивидуальный подход к каждому пациенту с учетом личной медицинской истории</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/images/icons/possibility1.svg" alt="Доступность 24/7" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Доступность 24/7</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Получайте медицинские консультации <br /> в любое время суток, без очередей и ожидания</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/images/icons/possibility2.svg" alt="Точность анализа" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Точность анализа</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Используем передовые алгоритмы ИИ для обеспечения высокой точности медицинских рекомендаций</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/images/icons/possibility3.svg" alt="Персонализация" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Персонализация</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Индивидуальный подход к каждому пациенту с учетом личной медицинской истории</p>
            </div>
          </div>
        </div>
      </section>
      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4">
        <div className="max-w-320 mx-auto">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Часто задаваемые вопросы</h2>
          <div className="flex flex-col gap-1 md:gap-2.5 mt-6 lg:mt-10">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="bg-white border rounded-[10px] border-[#F6F6F6] overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group"
                  >
                    {item.question}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div
                    className={`px-5 md:px-7.5 pb-3.5 md:pb-5 text-sm text-gray-500 transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="pt-6 lg:pt-15 pb-10 lg:pb-30 px-4">
        <div className="max-w-320 mx-auto">
          <div className="bg-[#111827] rounded-2xl md:rounded-3xl py-10 lg:py-17.5 px-6.5 lg:px-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[40px] font-semibold text-center text-white">Получите консультацию ИИ доктора прямо сейчас</h2>
            <p className="text-sm md:text-base lg:text-lg text-center text-gray-300 mx-auto mt-3.5 lg:mt-10">Наши AI-специалисты доступны 24/7 и готовы ответить на ваши <br /> вопросы о здоровье в любое время суток</p>
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-center gap-4 md:gap-6 mt-6 lg:mt-10 max-w-[279px] md:max-w-full mx-auto">
              <div className="flex items-center gap-2">
                <Image src="/images/icons/icon-consult1.svg" alt="Доступно 24/7" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Доступно 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/images/icons/icon-consult2.svg" alt="Мгновенные ответы" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Мгновенные ответы</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/images/icons/icon-consult3.svg" alt="Профессиональная консультация" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Профессиональная консультация</span>
              </div>
            </div>
            <div className="flex justify-center mt-6 md:mt-10">
              <Link href="/consult" className="bg-blue-500 rounded-md flex items-center gap-2 h-12 px-8 hover:bg-blue-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <path d="M17.5 13.375C17.5 13.817 17.3244 14.241 17.0118 14.5535C16.6993 14.8661 16.2754 15.0417 15.8333 15.0417H5.83333L2.5 18.375V5.04167C2.5 4.59964 2.67559 4.17572 2.98816 3.86316C3.30072 3.55059 3.72464 3.375 4.16667 3.375H15.8333C16.2754 3.375 16.6993 3.55059 17.0118 3.86316C17.3244 4.17572 17.5 4.59964 17.5 5.04167V13.375Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white text-sm font-medium">Начать консультацию</span>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-center md:justify-center gap-2 md:gap-8.5 mt-6 md:mt-10">
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Безопасно и конфиденциально</p>
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Без ожидания</p>
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Доступно из любой точки мира</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PlansPage;