import Head from 'next/head';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { CheckCircle } from 'lucide-react';
import { PricingModal } from '../components/pricing/pricing-modal';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AvatarContext } from './_app';
import { SubscriptionSection } from '../components/subscription/SubscriptionSection';
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadFile, 
  UserUpdate, 
  getBackendUrl,
  changePassword,
  PasswordChangeData,
  getPlans,
  getCurrentSubscription,
  subscribeToPlan,
  cancelSubscription,
  PlanResponse,
  SubscriptionResponse,
  getStrapiPlans,
  StrapiPlan
} from '../lib/api';

const SettingsPage = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  {/* Убираем локальное хранение strapiPlans, так как они теперь хранятся в компоненте PricingModal */}
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  // selectedPeriod теперь управляется внутри компонента PricingModal
  
  // Перенаправляем на страницу входа, если пользователь не авторизован
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const tabs = [
    { id: 'profile', label: 'Личные данные' },
    { id: 'security', label: 'Безопасность' },
    { id: 'subscription', label: 'Подписка' },
    { id: 'history', label: 'История анализов' }
  ];

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'not_specified',
    height: '',
    weight: '',
    allergies: '',
    chronic_diseases: '',
    medications: ''
  });
  
  // Заполняем данные формы из сессии
  useEffect(() => {
    if (session?.user) {
      const nameParts = (session.user.name || '').split(' ');
      setProfileForm(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user.email || ''
      }));
    }
  }, [session]);

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };


  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityForm({
      ...securityForm,
      [name]: value
    });
  };

  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Загружаем данные с сервера при загрузке компонента
  useEffect(() => {
    // Добавлено условие, чтобы не выполнять запрос, если пользователь не авторизован
    if (session?.user?.id && status === 'authenticated') {
      // Запрашиваем данные с сервера
      fetchUserProfile(session.user.id);
      fetchSubscriptionData();
      
      // Выводим доступные данные из сессии
      console.log('Session data:', session);
    }
  }, [session, status]);
  
  // Функция загрузки данных о подписке
  const fetchSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      
      // Загружаем доступные планы из локального API
      const plansData = await getPlans();
      setPlans(plansData);
      
      // Пытаемся загрузить текущую подписку пользователя
      try {
        const subscriptionData = await getCurrentSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        // Если подписки нет, это не ошибка для пользователя
        console.log('No active subscription found');
        setSubscription(null);
      }
    } catch (error: any) {
      console.error('Error fetching subscription data:', error);
      setSubscriptionError('Ошибка при загрузке данных о подписке');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Функция загрузки профиля
  const fetchUserProfile = async (userId: string | number) => {
    try {
      setIsLoading(true);
      console.log('Fetching profile for user ID:', userId);
      const userData = await getUserProfile(Number(userId));
      
      console.log('User data received:', userData);
      
      // Парсим имя в firstName и lastName
      const nameParts = (userData.name || '').split(' ');
      
      // Проверяем, откуда брать медицинские данные - напрямую из userData или из medical_profile
      const medical = userData.medical_profile || userData;
      
      setProfileForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userData.email || '',
        phone: userData.phone || '',
        birthDate: medical.birth_date ? new Date(medical.birth_date).toISOString().split('T')[0] : '',
        gender: medical.gender || 'not_specified',
        height: medical.height ? medical.height.toString() : '',
        weight: medical.weight ? medical.weight.toString() : '',
        allergies: medical.allergies || '',
        chronic_diseases: medical.chronic_diseases || '',
        medications: medical.medications || ''
      });
      
      // Логируем обработанные медицинские данные для отладки
      console.log('Processed medical data:', {
        height: medical.height,
        weight: medical.weight,
        allergies: medical.allergies,
        chronic_diseases: medical.chronic_diseases,
        medications: medical.medications,
        gender: medical.gender,
        birth_date: medical.birth_date
      });
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setUpdateError('Не удалось загрузить данные профиля');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка загрузки аватара
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAvatar } = useContext(AvatarContext);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Устанавливаем файл без обработки для предварительного просмотра
      setAvatarFile(file);
      
      try {
        setIsLoading(true);
        
        // Создаем FormData и добавляем файл напрямую
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'user_avatars');
        
        // Отправляем запрос
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {
          method: 'POST',
          body: formData,
          headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
        }
        
        const uploadData = await response.json();
        console.log('Upload response:', uploadData);
        
        // Получаем URL аватарки
        const avatarUrl = uploadData.url;
        
        if (session?.user) {
          // Обновляем данные пользователя с новой аватаркой
          const userData: UserUpdate = {
            avatar: avatarUrl
          };
          
          await updateUserProfile(Number(session.user.id), userData);
          
          // Обновляем локальную сессию через механизм next-auth
          await updateSession({
            user: {
              ...session.user,
              image: avatarUrl
            }
          });
          
          // Обновляем аватар в контексте приложения
          updateAvatar(avatarUrl);
          
          // Вызываем глобальную функцию обновления аватара для совместимости
          if (typeof window !== 'undefined' && window.updateUserAvatar) {
            window.updateUserAvatar(avatarUrl);
          }
          
          // Добавляем в localStorage для сохранения между сессиями
          if (typeof window !== 'undefined') {
            localStorage.setItem('userAvatar', avatarUrl);
          }
          
          // Показываем сообщение об успехе
          setUpdateSuccess(true);
          console.log('Avatar updated successfully:', avatarUrl);
          setTimeout(() => setUpdateSuccess(false), 3000);
        }
      } catch (error) {
        console.error('Ошибка при загрузке аватара:', error);
        setUpdateError('Не удалось загрузить аватар');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError(null);
    setIsLoading(true);
    
    try {
      if (!session?.user?.id) {
        throw new Error('Пользователь не авторизован');
      }
      
      // Аватарка уже загружена в handleAvatarChange, если была выбрана
      // Просто используем ту, что в сессии
      const avatarUrl = session?.user?.image;
      
      // Создаем объект с данными профиля
      // Преобразуем date string в ISO формат
      const birthDate = profileForm.birthDate ? 
        new Date(profileForm.birthDate).toISOString() : null;
        
      const userData: UserUpdate = {
        name: `${profileForm.firstName} ${profileForm.lastName}`,
        // Не обновляем аватар тут, он уже обновлен в handleAvatarChange если нужно
        medical_profile: {
          gender: profileForm.gender || null,
          birth_date: birthDate,
          height: profileForm.height ? parseInt(profileForm.height) : null,
          weight: profileForm.weight ? parseInt(profileForm.weight) : null,
          allergies: profileForm.allergies || null,
          chronic_diseases: profileForm.chronic_diseases || null,
          medications: profileForm.medications || null
        }
      };
      
      console.log('Trying to update profile with data:', userData);
      
      // Отправляем реальный запрос к API
      await updateUserProfile(Number(session.user.id), userData);
      
      setUpdateSuccess(true);
      
      // Аватарка обновляется отдельно в handleAvatarChange, здесь не нужно обновлять страницу
      
      // Задержка перед скрытием сообщения об успехе
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      console.error('Ошибка при обновлении профиля:', error);
      
      // Делаем сообщение более подробным для отладки
      const errorMsg = error.message || 'Произошла ошибка при обновлении профиля';
      setUpdateError(errorMsg);
      
      // Выводим сообщение об ошибке без неопределенных данных
      console.error('Произошла ошибка при отправке данных');
    } finally {
      setIsLoading(false);
    }
  };

  // State for security form messages
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setSecuritySuccess(false);
    setSecurityError(null);
    
    // Validate password match
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityError('Новый пароль и подтверждение не совпадают');
      return;
    }
    
    // Validate password length
    if (securityForm.newPassword.length < 8) {
      setSecurityError('Новый пароль должен содержать минимум 8 символов');
      return;
    }
    
    try {
      setSecurityLoading(true);
      
      // Prepare data for API
      const passwordData: PasswordChangeData = {
        current_password: securityForm.currentPassword,
        new_password: securityForm.newPassword
      };
      
      // Call the API to change password
      const result = await changePassword(passwordData);
      
      // Show success message
      setSecuritySuccess(true);
      
      // Reset form
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSecuritySuccess(false), 3000);
      
    } catch (error: any) {
      console.error('Ошибка при смене пароля:', error);
      setSecurityError(error.message || 'Произошла ошибка при смене пароля');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Функция для подписки на план
  const handleSubscribeToPlan = async (planId: number, strapiPlanId?: number, period: string = '1m') => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      
      // Здесь можно добавить логику для связывания локального плана с планом из Strapi
      // и передачи информации о выбранном периоде
      
      // В реальном приложении, мы бы отправили strapiPlanId и period на бэкенд
      console.log(`Subscribing to plan ${planId} with Strapi ID ${strapiPlanId} for period ${period}`);
      
      // Создаем подписку
      const newSubscription = await subscribeToPlan(planId);
      setSubscription(newSubscription);
      
      // Показываем сообщение об успехе
      setSubscriptionSuccess(true);
      setTimeout(() => setSubscriptionSuccess(false), 3000);
      
      // Закрываем модальное окно
      setShowPricingModal(false);
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      setSubscriptionError(error.message || 'Ошибка при оформлении подписки');
    } finally {
      setSubscriptionLoading(false);
    }
  };
  
  // Функция для отмены подписки
  const handleCancelSubscription = async () => {
    if (!confirm('Вы уверены, что хотите отменить подписку?')) {
      return;
    }
    
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      
      // Отменяем подписку
      const canceledSubscription = await cancelSubscription();
      setSubscription(null);
      
      // Показываем сообщение об успехе
      setSubscriptionSuccess(true);
      setTimeout(() => setSubscriptionSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      setSubscriptionError(error.message || 'Ошибка при отмене подписки');
    } finally {
      setSubscriptionLoading(false);
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };
  
  return (
    <>
      <Head>
        <title>Настройки | МедАссистент</title>
        <meta name="description" content="Управление настройками вашего аккаунта МедАссистент" />
      </Head>
      
      {/* Модальное окно с тарифами */}
      {showPricingModal && (
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          subscription={subscription}
          onSubscribe={handleSubscribeToPlan}
          loading={subscriptionLoading}
        />
      )}

      <div className="px-4 py-10 md:py-16">
        <div className="max-w-320 mx-auto">
          <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-left">Настройки аккаунта</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-full overflow-hidden relative group cursor-pointer" onClick={handleAvatarClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {session?.user?.image || avatarFile ? (
                      <>
                        <Image 
                          src={avatarFile 
                            ? URL.createObjectURL(avatarFile) 
                            : (session?.user?.image 
                                ? (session.user.image.startsWith('http') 
                                    ? session.user.image 
                                    : getBackendUrl(session.user.image))
                                : '')} 
                          alt={session?.user?.name || 'Пользователь'} 
                          className="object-cover w-full h-full rounded-full" 
                          width={64} 
                          height={64} 
                        />
                        <div className={`absolute inset-0 flex items-center justify-center ${isLoading ? 'bg-black bg-opacity-70 opacity-100' : 'bg-black bg-opacity-50 opacity-0 group-hover:opacity-100'} transition-opacity rounded-full`}>
                          {isLoading ? (
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span className="text-white text-xs">Изменить</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl group-hover:opacity-80 transition-opacity rounded-full">
                        {session?.user?.name?.[0].toUpperCase() || 'У'}
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <span className="text-white text-xs">Изменить</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium">{session?.user?.name || 'Пользователь'}</h2>
                    <p className="text-sm text-gray-500 text-left">{session?.user?.email}</p>
                  </div>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
                <button 
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isLoading}
                  className={`mt-4 text-sm ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600'}`}
                >
                  {isLoading ? 'Загрузка...' : 'Изменить фото'}
                </button>
              </div>

              <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`w-full text-left px-6 py-3 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-500 border-l-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                {activeTab === 'profile' && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Личные данные</h2>
                    <form onSubmit={handleProfileSubmit}>
                      <h3 className="text-lg font-medium mb-4">Основная информация</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            Имя
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={profileForm.firstName}
                            onChange={handleProfileChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Фамилия
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={profileForm.lastName}
                            onChange={handleProfileChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Телефон
                          </label>
                          <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Дата рождения
                          </label>
                          <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={profileForm.birthDate}
                            onChange={handleProfileChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                            Пол
                          </label>
                          <select
                            id="gender"
                            name="gender"
                            value={profileForm.gender}
                            onChange={handleProfileChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                            <option value="other">Другой</option>
                          </select>
                        </div>
                      </div>

                      <h3 className="text-lg font-medium mb-4 mt-8 pt-6 border-t border-gray-200">Медицинская информация</h3>
                      <div className="space-y-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                              Рост (см)
                            </label>
                            <input
                              type="number"
                              id="height"
                              name="height"
                              value={profileForm.height}
                              onChange={handleProfileChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                              Вес (кг)
                            </label>
                            <input
                              type="number"
                              id="weight"
                              name="weight"
                              value={profileForm.weight}
                              onChange={handleProfileChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                            Аллергии
                          </label>
                          <textarea
                            id="allergies"
                            name="allergies"
                            value={profileForm.allergies}
                            onChange={handleProfileChange}
                            rows={3}
                            placeholder="Укажите, если у вас есть аллергии на продукты, лекарства или другие вещества"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label htmlFor="chronic_diseases" className="block text-sm font-medium text-gray-700 mb-1">
                            Хронические заболевания
                          </label>
                          <textarea
                            id="chronic_diseases"
                            name="chronic_diseases"
                            value={profileForm.chronic_diseases}
                            onChange={handleProfileChange}
                            rows={3}
                            placeholder="Перечислите имеющиеся хронические заболевания"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-1">
                            Принимаемые медикаменты
                          </label>
                          <textarea
                            id="medications"
                            name="medications"
                            value={profileForm.medications}
                            onChange={handleProfileChange}
                            rows={3}
                            placeholder="Перечислите препараты, которые вы принимаете на постоянной основе"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </div>
                      </div>
                      
                      {updateSuccess && (
                        <div className="mb-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
                          Профиль успешно обновлен!
                        </div>
                      )}
                      
                      {updateError && (
                        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                          {updateError}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-blue-300"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                      </div>
                    </form>
                  </>
                )}


                {activeTab === 'security' && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Безопасность</h2>
                    <form onSubmit={handleSecuritySubmit}>
                      <div className="space-y-6 mb-6">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Текущий пароль
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={securityForm.currentPassword}
                            onChange={handleSecurityChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Новый пароль
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={securityForm.newPassword}
                            onChange={handleSecurityChange}
                            required
                            minLength={8}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Пароль должен содержать минимум 8 символов, включая буквы и цифры
                          </p>
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Подтверждение нового пароля
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={securityForm.confirmPassword}
                            onChange={handleSecurityChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {securitySuccess && (
                        <div className="mb-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
                          Пароль успешно изменен!
                        </div>
                      )}
                      
                      {securityError && (
                        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                          {securityError}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-blue-300"
                          disabled={securityLoading}
                        >
                          {securityLoading ? 'Изменение...' : 'Изменить пароль'}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {activeTab === 'subscription' && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Подписка</h2>
                    <SubscriptionSection onShowPricingModal={() => setShowPricingModal(true)} />
                  </>
                )}

                {activeTab === 'history' && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">История анализов</h2>
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">Общий анализ крови</h3>
                            <p className="text-sm text-gray-500">Загружен 15.02.2025</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm text-blue-500 bg-blue-50 rounded-md hover:bg-blue-100 transition">
                              Просмотреть
                            </button>
                            <button className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                              Скачать
                            </button>
                          </div>
                        </div>
                        <div className="px-6 py-4">
                          <p className="text-sm text-gray-500 mb-2">Расшифровка:</p>
                          <p className="text-sm">
                            Результаты в пределах нормы. Незначительное повышение уровня лейкоцитов, что может указывать на
                            воспалительный процесс. Рекомендуется контрольный анализ через 2 недели.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">Биохимический анализ крови</h3>
                            <p className="text-sm text-gray-500">Загружен 10.01.2025</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm text-blue-500 bg-blue-50 rounded-md hover:bg-blue-100 transition">
                              Просмотреть
                            </button>
                            <button className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                              Скачать
                            </button>
                          </div>
                        </div>
                        <div className="px-6 py-4">
                          <p className="text-sm text-gray-500 mb-2">Расшифровка:</p>
                          <p className="text-sm">
                            Все показатели в пределах референсных значений. Уровень холестерина на верхней границе нормы.
                            Рекомендуется диета с низким содержанием насыщенных жиров и повторный анализ через 3 месяца.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center mt-8">
                        <button className="px-4 py-2 text-sm text-blue-500 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition">
                          Загрузить еще анализы
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;