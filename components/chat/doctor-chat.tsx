"use client";

import React, { useState, useEffect } from "react";
import { Doctor, doctors as staticDoctors, mapApiDoctorToUi } from "../../lib/doctors";
import { getDoctors, getChatMessages, getUserChats } from "../../lib/api";
import { Message } from "../../lib/types";
import { DoctorList } from "../../components/doctors/doctor-list";
import { ChatWindow } from "../../components/chat/chat-window";
import { MenuIcon, User, Stethoscope, Upload, Camera, MessageSquare } from "lucide-react";
import { PricingModal } from "../../components/pricing/pricing-modal";
import { useAuth } from "@/lib/auth-context";
import { useMessageLimit } from '@/lib/message-limit-context';

interface DoctorChatProps {
  initialDoctorId?: string | number;
}

export function DoctorChat({ initialDoctorId }: DoctorChatProps = {}) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [chatSessions, setChatSessions] = useState<{[doctorId: string]: Message[]}>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyAttempted, setHistoryAttempted] = useState<Record<string, boolean>>({});
  const { token, user } = useAuth();
  const { messagesCount, messagesLimit } = useMessageLimit();
  
  // Проверяем авторизацию
  const isAuthenticated = !!token;
  // Проверяем активную подписку
  const hasActiveSubscription = !!user?.subscription?.is_active;
  
  // Вычисляем оставшиеся сообщения, ТОЛЬКО если НЕТ подписки
  const remainingMessages = !hasActiveSubscription
    ? Math.max(0, messagesLimit - messagesCount)
    : null; // Если есть подписка, лимита нет (null)
  
  // Загрузка докторов из API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const apiDoctors = await getDoctors();
        // Преобразуем данные из API в формат, используемый во фронтенде
        const mappedDoctors = apiDoctors.map(mapApiDoctorToUi);
        setDoctors(mappedDoctors);
        
        // Если передан initialDoctorId, выбираем соответствующего доктора
        if (initialDoctorId) {
          const initialDoctor = mappedDoctors.find((d: Doctor) => 
            d.id.toString() === initialDoctorId.toString()
          );
          if (initialDoctor) {
            setSelectedDoctor(initialDoctor);
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке докторов:", err);
        // Используем статические данные в случае ошибки
        setDoctors(staticDoctors);
        
        // Если передан initialDoctorId, выбираем соответствующего доктора из статических данных
        if (initialDoctorId) {
          const initialDoctor = staticDoctors.find((d: Doctor) => 
            d.id.toString() === initialDoctorId.toString()
          );
          if (initialDoctor) {
            setSelectedDoctor(initialDoctor);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [initialDoctorId]);
  
  // Initialize empty chat sessions for each doctor
  useEffect(() => {
    if (doctors.length === 0) return;
    
    const initialSessions: {[doctorId: string]: Message[]} = {};
    doctors.forEach(doctor => {
      initialSessions[doctor.id] = [];
    });
    setChatSessions(initialSessions);
  }, [doctors]);
  
  // Загрузка истории чата при выборе доктора
  useEffect(() => {
    // Import getUserChats at the top of the file if not already done:
    // import { ..., getUserChats } from "../../lib/api"; 

    if (selectedDoctor && token && !historyAttempted[selectedDoctor.id]) {
      const findAndFetchChatHistory = async () => {
        console.log(`Attempting to find/fetch chat history for doctor ${selectedDoctor.id}`);
        setIsLoadingHistory(true);
        // Mark as attempted *before* the async operation starts
        setHistoryAttempted(prev => ({ ...prev, [selectedDoctor.id]: true }));
  
        try {
          // 1. Fetch all user chats
          const userChats = await getUserChats(); // Fetch user chats
          console.log(`User chats fetched:`, userChats);
  
          // 2. Find the chat for the selected doctor
          const relevantChat = userChats.find((chat: any) => chat.doctor_id.toString() === selectedDoctor.id.toString());
  
          if (relevantChat) {
            console.log(`Found existing chat with ID ${relevantChat.id} for doctor ${selectedDoctor.id}`);
            // 3. Fetch history using the found chatId
            const history = await getChatMessages(relevantChat.id); // Use relevantChat.id
            console.log(`Fetched history for chat ${relevantChat.id}:`, history);
  
            if (Array.isArray(history)) {
              setChatSessions(prev => ({
                ...prev,
                [selectedDoctor.id]: history
              }));
            } else {
              console.warn("getChatMessages did not return an array for chat:", relevantChat.id, history);
              setChatSessions(prev => ({
                ...prev,
                [selectedDoctor.id]: [] // Reset to empty if data is invalid
              }));
            }
          } else {
            console.log(`No existing chat found for doctor ${selectedDoctor.id}. Displaying empty chat.`);
            // Ensure the chat session is empty if no chat exists
             setChatSessions(prev => ({
               ...prev,
               [selectedDoctor.id]: []
             }));
          }
        } catch (error) {
          console.error(`Error finding or fetching chat history for doctor ${selectedDoctor.id}:`, error);
           // Ensure the chat session is empty on error
           setChatSessions(prev => ({
             ...prev,
             [selectedDoctor.id]: []
           }));
        } finally {
          setIsLoadingHistory(false);
        }
      };
  
      findAndFetchChatHistory();
    } else if (selectedDoctor && !historyAttempted[selectedDoctor.id]) {
       // If no token, or already attempted, ensure chat is empty and mark attempted
       setChatSessions(prev => ({ ...prev, [selectedDoctor.id]: [] }));
       setHistoryAttempted(prev => ({ ...prev, [selectedDoctor.id]: true }));
    }
  }, [selectedDoctor, token, historyAttempted]); // Dependencies remain the same
  
  // Event listener for showing pricing modal
  useEffect(() => {
    const handleShowPricing = () => {
      setIsPricingModalOpen(true);
    };
    
    window.addEventListener('showPricing', handleShowPricing);
    
    return () => {
      window.removeEventListener('showPricing', handleShowPricing);
    };
  }, []);
  
  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // On mobile, automatically close the sidebar when a doctor is selected
    setIsMobileMenuOpen(false);
  };
  
  const currentMessages = selectedDoctor ? chatSessions[selectedDoctor.id] || [] : [];
  
  const setCurrentMessages = (updater: React.SetStateAction<Message[]>) => {
    if (!selectedDoctor) return;
    
    setChatSessions(prev => {
      const newMessages = typeof updater === 'function' 
        ? updater(prev[selectedDoctor.id] || [])
        : updater;
      
      return {
        ...prev,
        [selectedDoctor.id]: newMessages
      };
    });
  };

  return (
    <div className="h-[650px] md:h-[75vh] lg:h-[80vh] w-full border rounded-lg overflow-hidden flex flex-col md:flex-row relative bg-background">
      {/* Doctor list sidebar */}
      <div 
        className={`
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
          transition-transform duration-200 
          absolute md:relative z-20 
          h-full w-full md:w-1/3 lg:w-1/4 
          bg-background md:border-r top-0
        `}
      >
        <DoctorList 
          isMobile={isMobileMenuOpen} 
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          onSelectDoctor={handleSelectDoctor}
          selectedDoctorId={selectedDoctor?.id || null}
          doctors={doctors}
          isLoading={isLoading}
          error={null}
        />
      </div>
      
      {/* Основная часть окна чата */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Информация о лимите сообщений показывается ТОЛЬКО если НЕТ подписки */}
        {!hasActiveSubscription && (
          <div className="bg-blue-50 p-2 text-center text-sm text-blue-800 border-b">
            {remainingMessages !== null && remainingMessages > 0 ? (
              // Текст для тех, у кого остались сообщения
              <>Осталось {remainingMessages} бесплатных сообщений. {isAuthenticated ? <a href="/tariffs" className="text-blue-600 underline">Оформить подписку</a> : <><a href="/auth/login" className="text-blue-600 underline">Войдите</a> или <a href="/auth/register" className="text-blue-600 underline">зарегистрируйтесь</a></>} для безлимитного доступа.</>
            ) : (
              // Текст для тех, у кого закончились сообщения
              <>Вы использовали все бесплатные сообщения. {isAuthenticated ? <a href="/tariffs" className="text-blue-600 underline">Оформить подписку</a> : <><a href="/auth/login" className="text-blue-600 underline">Войдите</a> или <a href="/auth/register" className="text-blue-600 underline">зарегистрируйтесь</a></>} для продолжения.</>
            )}
          </div>
        )}
        
        {/* Отображаем компонент чата */}
        {selectedDoctor ? (
          <ChatWindow
            doctor={selectedDoctor}
            messages={currentMessages}
            setMessages={setCurrentMessages}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Выберите доктора для начала консультации</h3>
            <p className="text-sm text-gray-500 max-w-md">Выберите специалиста из списка слева, чтобы задать вопрос или проконсультироваться</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" /> 
                Прикрепляйте файлы
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" /> 
                Делайте фото
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" /> 
                Задавайте вопросы
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Мобильная кнопка меню */}
      <button
        className="md:hidden absolute left-4 top-4 z-30 bg-background p-2 rounded-md"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      
      {/* Модальное окно с тарифами */}
      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        subscription={null}
        onSubscribe={async () => {
          setIsPricingModalOpen(false);
        }}
      />
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}