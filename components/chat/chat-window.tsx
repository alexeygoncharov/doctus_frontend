"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Doctor } from "../../lib/doctors";
import { Message as ImportedMessage, FileData } from "../../lib/types";
import { 
  sendMessage, 
  getChatMessages, 
  getUserChats, 
  uploadChatFiles, 
  createChat,
  analyzeFile,
  analyzeMultipleFiles,
  searchFiles,
  searchVectorDB,
  clearChatHistory,
  exportChatToPDF
} from "../../lib/api";
import { ChatMessage } from "./chat-message";
import { Input } from "../../components/ui/input";
import { SendIcon, Clock, ShieldCheck, Brain, User, Stethoscope, Search, Upload, Camera, MessageSquare, SendHorizontal, Paperclip, CornerDownLeft, Mic, Bot } from "lucide-react";
import { SimpleAvatar } from '@/components/ui/SimpleAvatar';
import { PlusBadge } from "../../components/doctors/plus-badge";
import { CameraModal } from "./camera-modal";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { useSession } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from "../../components/ui/button";
// import { Textarea } from "../../components/ui/textarea"; // Закомментировано из-за ошибки
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { cn } from '@/lib/utils';

// Локальный интерфейс Message, расширяющий импортированный или определяющий заново
// Используем `as ImportedMessage` для импорта, чтобы избежать конфликта имен
interface Message extends Omit<ImportedMessage, 'files'> { // Наследуем от импортированного, исключая files, если нужно переопределить
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: FileData[]; // Переопределяем files, если FileData здесь отличается или добавляем fileId
  userAvatar?: string;
  processingFiles?: boolean; // Добавлено для индикатора загрузки файла
  processingStatus?: string; // Добавлено для текста статуса загрузки
  fileType?: 'image' | 'document'; 
}

interface Chat {
  id: number;
  doctor_id: number;
}

interface ApiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  doctor: Doctor | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

// Компонент для отображения пустого чата с информацией о докторе
interface EmptyChatStateProps {
  doctor: Doctor | null;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  inputRef?: React.RefObject<HTMLInputElement>;
  input?: string;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  setIsCameraOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleSendMessage?: () => void;
}

const EmptyChatState = ({ 
  doctor, 
  fileInputRef, 
  inputRef, 
  input = "", 
  setInput = () => {}, 
  setIsCameraOpen = () => {}, 
  handleSendMessage = () => {} 
}: EmptyChatStateProps) => {
  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Stethoscope className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Добро пожаловать в чат с ИИ-доктором!</h3>
        <p className="text-sm text-gray-500 max-w-md">Здесь вы можете задать любые медицинские вопросы, прикрепить результаты анализов, фотографии или другие документы для консультации.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> 
            Прикрепляйте файлы
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" /> 
            Делайте фото
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> 
            Задавайте вопросы
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Desktop header - sticky position */}
      <div className="hidden md:block p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SimpleAvatar 
                src={doctor?.avatar ? (doctor.avatar.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${doctor.avatar}` : doctor.avatar) : undefined}
                alt={doctor?.name || 'Доктор'} 
                fallbackText={doctor?.name ?? undefined}
                className="h-10 w-10"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{doctor.name}</h2>
                {doctor.isPremium && <PlusBadge />}
              </div>
              <p className="text-sm text-gray-500">{`${doctor.specialty} - ${doctor.description}`}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden p-3 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <SimpleAvatar 
              src={doctor?.avatar ? (doctor.avatar.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${doctor.avatar}` : doctor.avatar) : undefined}
              alt={doctor?.name || "Аватар доктора"}
              fallbackText={doctor?.name ?? undefined}
              className="h-8 w-8"
            />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-base font-bold">{doctor.name}</h2>
              {doctor.isPremium && <PlusBadge />}
            </div>
            <p className="text-xs text-gray-500 truncate">{doctor.specialty}</p>
          </div>
        </div>
      </div>
      
      {/* Chat placeholder content */}
      <div className="flex flex-col items-center justify-center text-center p-6 flex-grow">
        <div className="max-w-md">
          <div className="flex justify-center w-full mb-4">
            <div className="relative">
                {/* Заменяем Avatar на SimpleAvatar */}
                <SimpleAvatar 
                  src={doctor?.avatar ? (doctor.avatar.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${doctor.avatar}` : doctor.avatar) : undefined} 
                  alt={doctor?.name || 'Аватар доктора'}
                  fallbackText={doctor?.name ?? undefined}
                  className="h-16 w-16"
                />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white online-indicator"></span>
            </div>
          </div>
          
          <h3 className="text-lg font-medium">{doctor.name}</h3>
          <p className="text-sm text-gray-500 mb-6">{doctor.description}</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 mt-6">
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
      </div>
      
      {/* Input box for messaging at the bottom */}
      {fileInputRef && inputRef && (
        <div className="p-4 border-t w-full sticky bottom-0 bg-white z-10">
          <form
            className="flex items-center space-x-2 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              if (input && input.trim()) {
                handleSendMessage?.(); // Добавлен ?. для безопасности
              }
            }}
          >
            <button 
              className="h-10 px-3 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50" 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              type="button"
            >
               <Upload className="h-5 w-5" />
              <span className="ml-1 text-sm hidden sm:inline">Файлы</span>
            </button>
            <input 
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              className="hidden"
              multiple
              onChange={() => {
                // Обрабатываем загрузку файла без фокусировки на input
                if (fileInputRef.current?.files?.length) {
                  console.log("DEBUG: File upload triggered", {
                    fileCount: fileInputRef.current.files.length,
                    files: Array.from(fileInputRef.current.files).map(f => ({ name: f.name, type: f.type, size: f.size }))
                  });
                  setTimeout(() => { handleSendMessage?.(); }, 10); // Добавлен ?. для безопасности
                }
              }}
              ref={fileInputRef}
              type="file"
            />
            
            <button 
              className="h-10 px-3 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50" 
              onClick={() => setIsCameraOpen(true)}
              type="button"
            >
               <Camera className="h-5 w-5" />
              <span className="ml-1 text-sm hidden sm:inline">Фото</span>
            </button>
            
            <Input
              className="flex-1"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите сообщение или добавьте файлы..."
              ref={inputRef}
              autoComplete="off"
              autoFocus={false}
              value={input}
            />
            <button 
              className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white disabled:opacity-50" 
              disabled={!input || !input.trim()}
              onClick={() => {
                if (input && input.trim()) {
                  handleSendMessage?.(); // Добавлен ?. для безопасности
                }
              }}
              type="button"
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export function ChatWindow({ doctor, messages, setMessages }: ChatWindowProps) {
  const { user, token } = useAuth();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyAttempted, setHistoryAttempted] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: session, status } = useSession();
  
  // Function to scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Add effect to scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Initial scroll with delay for basic content
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, scrollToBottom]);
  
  // Listen for the custom event from image-message component
  useEffect(() => {
    const handleImagesLoaded = () => {
      // Additional scroll after images are loaded
      scrollToBottom();
    };
    
    window.addEventListener('chat-images-loaded', handleImagesLoaded);
    return () => {
      window.removeEventListener('chat-images-loaded', handleImagesLoaded);
    };
  }, [scrollToBottom]);
  
  // Debug chat history messages with files
  useEffect(() => {
    if (messages.some(msg => msg.files && msg.files.length > 0)) { // Исправлено: Более безопасная проверка
      console.log("CHAT HISTORY DEBUG - Messages with files:", 
        messages.filter(msg => msg.files && msg.files.length > 0).map(msg => ({ // Исправлено: Более безопасная проверка
          id: msg.id,
          role: msg.role,
          content: msg.content.substring(0, 30) + "...",
          files: msg.files?.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url
          }))
        }))
      );
    }
  }, [messages]);
  

  const handleSendMessage = async () => {
    if ((!input.trim() && !fileInputRef.current?.files?.length) || !doctor) return;
    
    // Специальное исключение для доктора "Расшифровка" (ID 20)
    // Доктор уже проверен на null выше
    const isDecodeDoctor = doctor.id.toString() === '20';
    
    // Проверяем авторизацию (кроме доктора "Расшифровка")
    if (!token && !isDecodeDoctor) {
      alert("Пожалуйста, авторизуйтесь для отправки сообщений");
      setIsLoading(false);
      return;
    }
    
    // Проверяем, доступен ли врач для текущей подписки
    // Доктор "Расшифровка" доступен без подписки и авторизации
    // @ts-ignore // Игнорируем ошибку TS, предполагая, что тип Session расширен
    if (!isDecodeDoctor && doctor.isPremium && user?.subscription?.plan?.type !== 'premium') { 
      // Показываем сообщение о необходимости подписки для Plus врачей
      const event = new CustomEvent("showPricing");
      window.dispatchEvent(event);
      return;
    }
    
    // Get user avatar from session
    const userAvatar = user?.avatar || undefined;
    
    const userMessage: Message = {
      content: input || (fileInputRef.current?.files?.length && fileInputRef.current.files.length > 1 ? "Отправлено несколько файлов" : "Отправлен файл"),
      id: crypto.randomUUID(),
      role: "user",
      timestamp: new Date(),
      userAvatar: userAvatar,
    };
    
    // Временные переменные для файлов
    let uploadedFiles: any[] = [];
    let currentChatId = chatId;
    
    // Check if there are files to upload
    if (fileInputRef.current?.files?.length) {
      const files = Array.from(fileInputRef.current.files);
      
      // Определяем тип файлов
      const isImage = files.some(file => file.type.startsWith('image/'));
      const fileType = isImage ? 'image' : 'document';
      
      // Создаем массив файлов для отображения
      const filesData = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      
      // Используем только массив files для единообразия обработки
      userMessage.files = filesData;
      
      // Добавляем информацию о типе файла для бэкенда
      userMessage.fileType = fileType;
    }
    
    // Clear input and update messages
    setInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Добавляем сообщение пользователя в список сообщений и сохраняем в state
    setMessages((prev) => [...prev, userMessage]);
    
    // Если нет текста и нет файлов, не отправляем запрос на сервер
    if (!input.trim() && !userMessage.files?.length) return;
    
    // Показываем индикатор загрузки
    setIsLoading(true);
    
    try {
      // Если у нас есть файлы и у нас нет chat_id, нужно сначала создать чат
      // Доктор уже проверен на null
      if (userMessage.files?.length && !currentChatId) {
        try {
          const newChat = await createChat(Number(doctor.id));
          currentChatId = newChat.id;
          setChatId(currentChatId);
          
          // Теперь загружаем файлы
          if (fileInputRef.current?.files?.length && currentChatId) {
            const files = Array.from(fileInputRef.current.files);
            
            // Определяем тип файла для правильной обработки на бэкенде
            // Проверяем по расширению файла для надежного определения
            const isImageFile = files.some(file => {
              // Проверка по расширению файла (более надежно чем MIME-тип)
              const fileName = file.name.toLowerCase();
              return fileName.endsWith('.jpg') || 
                     fileName.endsWith('.jpeg') || 
                     fileName.endsWith('.png') || 
                     fileName.endsWith('.gif') || 
                     fileName.endsWith('.webp');
            });
            
            const isPdfFile = files.some(file => {
              const fileName = file.name.toLowerCase();
              return fileName.endsWith('.pdf');
            });
            
            const isDocFile = files.some(file => {
              const fileName = file.name.toLowerCase();
              return fileName.endsWith('.doc') || 
                     fileName.endsWith('.docx') || 
                     fileName.endsWith('.txt') || 
                     fileName.endsWith('.rtf');
            });
            
            // Если в файлах есть документы, всегда устанавливаем тип document
            const fileType = (isPdfFile || isDocFile) ? 'document' : (isImageFile ? 'image' : 'document');
              
            try {
              // Для оптимизации сначала попробуем проанализировать файлы
              // для извлечения текста и создания векторного представления
              const analyzedFiles = await analyzeMultipleFiles(files);
              console.log('Files analyzed successfully:', analyzedFiles);
              
              // Затем загружаем файлы в чат
              const response = await uploadChatFiles(
                currentChatId, 
                files, 
                fileType
              );
              
              // Сохраняем информацию о загруженных файлах
              if (response.files) {
                uploadedFiles = response.files.map((file: any) => file.id);
              }
            } catch (uploadError) {
              console.error('Error processing files:', uploadError);
              
              // Если не удалось проанализировать файлы, попробуем просто загрузить их в чат
              try {
                console.log(`Fallback upload attempt: Using explicit file type: ${fileType} for files:`, 
                  files.map(f => ({name: f.name, type: f.type}))
                );
                
                const response = await uploadChatFiles(
                  currentChatId, 
                  files, 
                  fileType
                );
                
                if (response.files) {
                  uploadedFiles = response.files.map((file: any) => file.id);
                }
              } catch (fallbackError) {
                console.error('Failed to upload files after analysis failure:', fallbackError);
              }
            }
          }
        } catch (error) {
          console.error("Error creating chat or uploading files:", error);
          // Даже если не удалось создать чат или загрузить файлы, все равно пытаемся отправить сообщение
        }
      }
      
      // Отправляем сообщение на сервер
      // Доктор уже проверен на null
      const response = await sendMessage(
        doctor.id, 
        input, 
        uploadedFiles.length > 0 ? uploadedFiles : []
      );
      
      // Добавляем ответ от сервера в список сообщений
      if (response) {
        setMessages((prev) => [...prev, response]);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      // Добавляем сообщение об ошибке в чат
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "system",
        content: "Не удалось отправить сообщение. Пожалуйста, проверьте подключение или авторизуйтесь заново.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Обработчик выбора файлов через input[type=file]
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Доктор проверен на null выше в useEffect
    if (event.target.files?.length && doctor) { 
      try {
        setIsLoading(true);
        
        // Get user avatar from session
        const userAvatar = user?.avatar || undefined;
        
        // Создаем временное сообщение пользователя для отображения
        const filesArray = Array.from(event.target.files);
        const filesData = filesArray.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        }));
        
        const userMessage: Message = {
          content: filesArray.length > 1 ? "Отправлено несколько файлов" : `Отправлен файл: ${filesArray[0].name}`,
          files: filesData,
          id: crypto.randomUUID(),
          role: "user",
          timestamp: new Date(),
          userAvatar: userAvatar,
          processingFiles: true, // Это ключевое поле для активации прелоадера
          processingStatus: filesArray.some(file => {
            const fileName = file.name.toLowerCase();
            return file.type.startsWith('image/') || 
                   fileName.endsWith('.jpg') || 
                   fileName.endsWith('.jpeg') || 
                   fileName.endsWith('.png') || 
                   fileName.endsWith('.gif') || 
                   fileName.endsWith('.webp');
          }) ? "Загрузка изображения..." : "Загрузка документа..."
        };
        
        setMessages((prev) => [...prev, userMessage]);
        
        // Если у нас нет chat_id, нужно создать чат
        let currentChatId = chatId;
        if (!currentChatId) {
          const newChat = await createChat(Number(doctor.id));
          currentChatId = newChat.id;
          setChatId(currentChatId);
        }
        
        // Загружаем файлы на сервер
        if (currentChatId) {
          try {
            // Определяем тип файла для правильной обработки на бэкенде
            // Проверяем по расширению файла для надежного определения
            const isImageFile = filesArray.some(file => {
              // Проверка по расширению файла (более надежно чем MIME-тип)
              const fileName = file.name.toLowerCase();
              return fileName.endsWith('.jpg') || 
                     fileName.endsWith('.jpeg') || 
                     fileName.endsWith('.png') || 
                     fileName.endsWith('.gif') || 
                     fileName.endsWith('.webp');
            });
            
            const isPdfFile = filesArray.some(file => {
              const fileName = file.name.toLowerCase();
              return fileName.endsWith('.pdf');
            });
            
            const isDocFile = filesArray.some(file => {
              const fileName = file.name.toLowerCase();
              return fileName.endsWith('.doc') || 
                     fileName.endsWith('.docx') || 
                     fileName.endsWith('.txt') || 
                     fileName.endsWith('.rtf');
            });
            
            // Если в файлах есть документы, всегда устанавливаем тип document
            const fileType = (isPdfFile || isDocFile) ? 'document' : (isImageFile ? 'image' : 'document');
              
            // Определяем соответствующие сообщения статуса в зависимости от типа файла
            const processingStatusText = fileType === 'image' 
              ? "Распознавание содержимого изображения..." 
              : "Распознавание содержимого документа...";
              
            const analyzingStatusText = fileType === 'image'
              ? "Анализ изображения ИИ-моделью..."
              : "Анализ документа ИИ-моделью...";
              
            // Создаем объекты FileData для добавления в историю сообщений
            const fileDataList: FileData[] = filesArray.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file)
            }));
            
            // Обновляем сообщение пользователя, чтобы сохранить файлы в истории
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, files: fileDataList} 
                : msg
            ));
            
            // Сначала анализируем файлы для извлечения текста и создания векторного представления
            try {
              console.log(`Analyzing ${filesArray.length} files. Types:`, 
                filesArray.map(f => ({ 
                  name: f.name, 
                  type: f.type, 
                  size: f.size,
                  extension: f.name.split('.').pop()?.toLowerCase() 
                }))
              );
              const analyzedFiles = await analyzeMultipleFiles(filesArray);
              console.log('Files analyzed successfully:', analyzedFiles);
            } catch (analyzeError) {
              console.error('Error analyzing files:', analyzeError);
              // Продолжаем выполнение, даже если анализ не удался
            }
            
            // Обновляем статус обработки
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingStatus: "Загрузка файла на сервер..."} 
                : msg
            ));
            
            // Загружаем файлы в чат и получаем их идентификаторы
            console.log(`Uploading ${filesArray.length} files to chat ${currentChatId} as ${fileType}. File info:`, 
                filesArray.map(f => ({
                  name: f.name,
                  type: f.type,
                  size: f.size,
                  extension: f.name.split('.').pop()?.toLowerCase()
                }))
            );
            
            // Явно передаем тип файла, учитывая его расширение
            const uploadResponse = await uploadChatFiles(currentChatId, filesArray, fileType);
            console.log('Files uploaded successfully:', uploadResponse);
            
            if (!uploadResponse || !uploadResponse.files || uploadResponse.files.length === 0) {
              console.error('Warning: No files returned in upload response. This may cause issues with file processing!');
            } else {
              console.log(`Successfully received ${uploadResponse.files.length} file references from server`);
            }
            
            console.log('Message with processing status:', userMessage);
            
            // Обновляем статус обработки
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingStatus: processingStatusText} 
                : msg
            ));
            
            // Извлекаем идентификаторы загруженных файлов для передачи в сообщение
            const fileIds = uploadResponse.files?.map((file: any) => file.id) || []; // Исправлено: Используем any временно (Line 917)
            console.log('File IDs to attach:', fileIds);
            
            // Отправляем сообщение с описанием файлов
            // Разные подсказки для разных типов файлов
            let fileDescription;
            if (fileType === 'image') {
              fileDescription = filesArray.length > 1 
                ? "Пожалуйста, проанализируйте эти изображения и дайте комментарии."
                : "Пожалуйста, проанализируйте это изображение и дайте комментарии.";
            } else {
              // Определяем тип документа для более точного запроса
              const docTypes = new Set(filesArray.map((file: File) => { // Исправлено: Добавлен тип File (Line 938)
                const fileName = file.name.toLowerCase();
                if (fileName.endsWith('.pdf')) return 'PDF';
                if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'Word';
                if (fileName.endsWith('.txt')) return 'текстовый';
                return 'документ';
              }));
              
              // Проверяем, все ли файлы одного типа
              const uniqueTypes = Array.from(docTypes); // Исправлено: Преобразование Set в Array (Line 938)
              
              if (filesArray.length > 1) {
                if (uniqueTypes.length === 1) {
                  fileDescription = `Пожалуйста, проанализируйте эти ${uniqueTypes[0]} файлы и дайте комментарии.`;
                } else {
                  fileDescription = "Пожалуйста, проанализируйте эти документы и дайте комментарии.";
                }
              } else {
                fileDescription = `Пожалуйста, проанализируйте этот ${uniqueTypes[0]} файл и дайте комментарии.`;
              }
            }
            
            // Обновляем статус обработки
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingStatus: analyzingStatusText} 
                : msg
            ));
            
            // Отправляем запрос к модели с просьбой описать файлы,
            // передавая идентификаторы загруженных файлов
            // Доктор уже проверен на null
            await sendMessage(
              doctor.id, 
              fileDescription,
              fileIds // Передаем идентификаторы файлов в сообщение
            );
            
            // Завершаем обработку файлов
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingFiles: false, processingStatus: undefined} 
                : msg
            ));
          } catch (error) {
            console.error('Error handling uploaded files:', error);
            
            // Добавляем сообщение об ошибке в чат
            const errorMessage: Message = {
              id: crypto.randomUUID(),
              role: "system",
              content: "Произошла ошибка при обработке файлов. Пожалуйста, попробуйте еще раз.",
              timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        }
      } catch (error) {
        console.error("Error handling file upload:", error);
      } finally {
        setIsLoading(false);
        // Очищаем выбранные файлы в input для возможности повторной загрузки тех же файлов
        if (event.target) {
          event.target.value = '';
        }
      }
    }
  };
  
  const handleCameraCapture = async (capturedImages: FileData[]) => {
    // Доктор проверен на null выше в useEffect
    if (capturedImages.length > 0 && doctor) { 
      try {
        setIsLoading(true);
        
        // Специальное исключение для доктора "Расшифровка" (ID 20)
        // Доктор уже проверен на null выше
        const isDecodeDoctor = doctor.id.toString() === '20';
        
        // Get user avatar from session (если авторизован)
        const userAvatar = user?.avatar || undefined;
        
        // Создаем временное сообщение пользователя для отображения
        const userMessage: Message = {
          content: capturedImages.length > 1 ? "Отправлено несколько фото" : "Отправлено фото",
          files: capturedImages,
          id: crypto.randomUUID(),
          role: "user",
          timestamp: new Date(),
          userAvatar: userAvatar,
          processingFiles: true,
          processingStatus: "Загрузка изображения..."
        };
        
        setMessages((prev) => [...prev, userMessage]);
        
        // Если у нас нет chat_id, нужно создать чат
        let currentChatId = chatId;
        if (!currentChatId) {
          const newChat = await createChat(Number(doctor.id));
          currentChatId = newChat.id;
          setChatId(currentChatId);
        }
        
        // Загружаем файлы на сервер
        if (currentChatId) {
          try {
            // Преобразуем capturedImages в File объекты с уникальными именами
            const imageFiles = capturedImages.map((img, index) => {
              // Получаем timestamp для формирования уникального имени файла
              const timestamp = new Date().getTime();
              // Формируем уникальное имя файла для каждого изображения с камеры
              const uniqueFileName = `camera_img_${timestamp}_${index+1}.jpg`;
              
              // Преобразуем base64 URL в Blob
              const response = fetch(img.url)
                .then(res => res.blob())
                .then(blob => {
                  // Создаем файл с уникальным именем
                  return new File([blob], uniqueFileName, { type: 'image/jpeg' });
                });
              return response;
            });
            
            // Дожидаемся создания всех File объектов
            const files = await Promise.all(imageFiles);
            
            // Обновляем список файлов в сообщении для сохранения их в истории
            // Это важно для корректного отображения файлов в истории чата
            const fileDataList: FileData[] = files.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file)
            }));
            
            // Обновляем сообщение пользователя, чтобы сохранить файлы в истории
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, files: fileDataList} 
                : msg
            ));
            
            // Сначала анализируем файлы для извлечения текста и создания векторного представления
            try {
              const analyzedFiles = await analyzeMultipleFiles(files);
              console.log('Camera images analyzed successfully:', analyzedFiles);
            } catch (analyzeError) {
              console.error('Error analyzing camera images:', analyzeError);
              // Продолжаем выполнение, даже если анализ не удался
            }
            
            // Обновляем статус обработки
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingStatus: "Загрузка файла на сервер..."} 
                : msg
            ));
            
            // Загружаем файлы в чат и получаем их идентификаторы
            const uploadResponse = await uploadChatFiles(currentChatId, files, 'image');
            console.log('Files uploaded successfully:', uploadResponse);
            
            // Обновляем статус обработки
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingStatus: "Распознавание содержимого изображения..."} 
                : msg
            ));
            
            // Извлекаем идентификаторы загруженных файлов для передачи в сообщение
            const fileIds = uploadResponse.files?.map((file: any) => file.id) || []; // Исправлено: Используем any временно (Line 1097)
            console.log('File IDs to attach:', fileIds);
            
            // Отправляем сообщение с описанием изображений
            const imageDescription = capturedImages.length > 1 
              ? "Пожалуйста, проанализируйте эти изображения и дайте комментарии."
              : "Пожалуйста, проанализируйте это изображение и дайте комментарии.";
            
            // Обновляем статус обработки
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingStatus: "Анализ изображения ИИ-моделью..."} 
                : msg
            ));
            
            // Отправляем запрос к модели с просьбой описать изображения,
            // передавая идентификаторы загруженных файлов
            // Доктор уже проверен на null
            await sendMessage(
              doctor.id,
              imageDescription,
              fileIds // Передаем идентификаторы файлов в сообщение
            );
            
            // Завершаем обработку файлов
            setMessages(messages => messages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, processingFiles: false, processingStatus: undefined} 
                : msg
            ));
          } catch (error) {
            console.error('Error handling camera images:', error);
            
            // Добавляем сообщение об ошибке в чат
            const errorMessage: Message = {
              id: crypto.randomUUID(),
              role: "system",
              content: "Произошла ошибка при обработке изображений. Пожалуйста, попробуйте еще раз.",
              timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        }
      } catch (error) {
        console.error("Error handling camera capture:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Обработчик очистки истории чата и векторных эмбеддингов
  const handleClearChatHistory = async () => {
    if (!chatId) return;
    
    if (window.confirm('Вы уверены, что хотите очистить историю чата? Это удалит все сообщения и файлы. Действие нельзя отменить.')) {
      try {
        setIsLoading(true);
        
        // Очищаем чат на сервере (включая векторные эмбеддинги и файлы)
        await clearChatHistory(chatId);
        
        // Очищаем локальное состояние
        setMessages([]);
        setChatMenuOpen(false);
        
        // Сбрасываем идентификатор чата, чтобы создать новый при следующем сообщении
        setChatId(null);
        
        // Сбрасываем флаг загрузки истории, чтобы пометить что для этого доктора история снова не загружена
        if (doctor && doctor.id) {
          setHistoryAttempted(prev => {
            const result = {...prev};
            // Удаляем запись для текущего доктора, чтобы точно сбросить историю
            delete result[doctor.id.toString()];
            return result;
          });
        }
        
        // Показываем пользователю уведомление
        alert('История чата успешно очищена. Предыдущая информация больше не будет влиять на ответы.');
        
        // После очистки просто возвращаемся к начальному состоянию
        // без перезагрузки страницы, чтобы сохранить состояние UI
      } catch (error) {
        console.error('Error clearing chat history:', error);
        alert('Произошла ошибка при очистке истории чата');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Обработчик экспорта чата в PDF
  const handleExportChatPDF = async () => {
    if (!chatContainerRef.current || !doctor) return;
    
    try {
      setChatMenuOpen(false);
      await exportChatToPDF(chatContainerRef.current, doctor.name); // Доктор точно не null здесь
    } catch (error) {
      console.error('Error exporting chat to PDF:', error);
      alert('Произошла ошибка при экспорте чата в PDF');
    }
  };
  
  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatMenuOpen) {
        setChatMenuOpen(false);
      }
    };
    
    // Добавляем листенер только когда меню открыто
    if (chatMenuOpen) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [chatMenuOpen]);
  
  // Add refs to the outer scope so they can be passed to EmptyChatState
  // Экран загрузки истории чата - только если доктор выбран и история загружается
  if (isLoadingHistory && doctor) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">Загрузка истории чата...</p>
      </div>
    );
  }

  // Проверка, действительно ли это пустой чат
  const realMessagesExist = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant').length > 0;
  
  // Пустой чат - показываем разные экраны в зависимости от выбора доктора 
  // и есть ли реальные сообщения (от пользователя или ассистента, игнорируя системные)
  if (!doctor || !realMessagesExist) { // Показываем пустой стейт если нет доктора ИЛИ нет реальных сообщений
    return (
      <div className="flex flex-col h-full">
        <EmptyChatState 
          doctor={doctor} 
          fileInputRef={fileInputRef}
          inputRef={inputRef}
          input={input}
          setInput={setInput}
          setIsCameraOpen={setIsCameraOpen}
          handleSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  // ----- С этого момента doctor точно не null и есть сообщения ----- 

  return (
    <div className="flex flex-col h-full">
      {realMessagesExist && doctor ? (
        <> 
          {/* Desktop header - sticky position */}
          <div className="hidden md:block p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <SimpleAvatar 
                    src={doctor.avatar ? (doctor.avatar.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${doctor.avatar}` : doctor.avatar) : undefined}
                    alt={doctor.name || 'Доктор'} 
                    fallbackText={doctor.name ?? undefined}
                    className="h-10 w-10"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{doctor.name}</h2>
                    {doctor.isPremium && <PlusBadge />}
                  </div>
                  <p className="text-sm text-gray-500">{`${doctor.specialty} - ${doctor.description}`}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  onClick={() => setChatMenuOpen(prev => !prev)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
                {chatMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button 
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        onClick={handleClearChatHistory}
                        disabled={!chatId} // Блокируем если нет chatId
                      >
                        Очистить историю
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        onClick={handleExportChatPDF}
                        disabled={messages.length === 0} // Блокируем если нет сообщений
                      >
                        Скачать PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile header */}
          <div className="md:hidden p-3 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SimpleAvatar 
                    src={doctor.avatar ? (doctor.avatar.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${doctor.avatar}` : doctor.avatar) : undefined}
                    alt={doctor.name || "Аватар доктора"}
                    fallbackText={doctor.name ?? undefined}
                    className="h-8 w-8"
                  />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="text-base font-bold">{doctor.name}</h2>
                    {doctor.isPremium && <PlusBadge />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{doctor.specialty}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
                  onClick={() => setChatMenuOpen(prev => !prev)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
                {chatMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button 
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        onClick={handleClearChatHistory}
                         disabled={!chatId}
                      >
                        Очистить историю
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        onClick={handleExportChatPDF}
                      >
                        Скачать PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {false ? (
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div className="p-[30px]">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex justify-center w-full mb-4">
                    <div className="relative">
                      <span className="flex shrink-0 overflow-hidden rounded-full h-16 w-16 relative bg-blue-100">
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-muted bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-8 w-8">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </span>
                      </span>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white online-indicator"></span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">Начните разговор с Терапевтом</h3>
                  <p className="text-sm text-gray-500 mb-6">Первичная диагностика и лечение распространенных заболеваний</p>
                  <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 mt-6 text-gray-700">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" x2="12" y1="15" y2="3"></line>
                      </svg>
                      <span className="text-sm">Прикрепляйте файлы</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <span className="text-sm">Делайте фото</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span className="text-sm">Задавайте вопросы</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="flex-1 overflow-y-auto md:h-auto" 
              ref={chatContainerRef}
              style={{height: 'calc(100% * 1.6)'}}
            >
              <div className="p-4">
                <div className="space-y-4 w-full">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start w-full">
                      <ChatMessage
                        message={message}
                        doctor={doctor}
                      />
                    </div>
                  ))}
                  <div 
                    ref={messagesEndRef} 
                    className="h-px w-full" 
                    id="messages-end-marker"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 border-t w-full sticky bottom-0 bg-white z-10">
            <form
              className="flex items-center space-x-2 w-full"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSendMessage();
                }
              }}
            >
              <button 
                className="h-10 px-3 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50" 
                onClick={handleFileUpload}
                type="button"
              >
                <svg className="h-5 w-5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                <span className="ml-1 text-sm hidden sm:inline">Файлы</span>
              </button>
              <input 
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                className="hidden"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              
              <button 
                className="h-10 px-3 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50" 
                onClick={() => setIsCameraOpen(true)}
                type="button"
              >
                <svg className="h-5 w-5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="ml-1 text-sm hidden sm:inline">Фото</span>
              </button>
              
              <Input
                className="flex-1"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Введите сообщение или добавьте файлы..."
                ref={inputRef}
                autoComplete="off"
                autoFocus={false}
                value={input}
              />
              <button 
                className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white disabled:opacity-50" 
                disabled={!input || !input.trim()}
                onClick={() => {
                  if (input && input.trim()) {
                    handleSendMessage();
                  }
                }}
                type="button"
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stethoscope w-8 h-8 text-blue-500">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
              <circle cx="20" cy="10" r="2"></circle>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Добро пожаловать в чат с ИИ-доктором!</h3>
          <p className="text-sm text-gray-500 max-w-md">Здесь вы можете задать любые медицинские вопросы, прикрепить результаты анализов, фотографии или другие документы для консультации.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload w-5 h-5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" x2="12" y1="3" y2="15"></line>
              </svg> 
              Прикрепляйте файлы
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-5 h-5">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg> 
              Делайте фото
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square w-5 h-5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg> 
              Задавайте вопросы
            </div>
          </div>
        </div>
      )}
      
      {/* Camera Modal */}
      <CameraModal 
        onCapture={handleCameraCapture} 
        onClose={() => setIsCameraOpen(false)}
        open={isCameraOpen}
      />
    </div>
  );
}
