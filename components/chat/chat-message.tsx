"use client";

import React, { forwardRef, useContext, useState, useEffect, useRef } from "react";
import { FileData, Message } from "../../lib/types";
import { SimpleAvatar } from "@/components/ui/SimpleAvatar";
import { Doctor } from "../../lib/doctors";
import { User } from "lucide-react";
import { FileMessage } from "./file-message";
import { ImageMessage } from "./image-message";
import { AvatarContext } from "../../pages/_app";
import { getBackendUrl } from "../../lib/api";
import { cacheImageData, getCachedImageData } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface ChatMessageProps {
  doctor: Doctor | null;
  message: Message;
}

// Стили для анимации fade-in эффекта - использовать глобальные из globals.css
// const fadeInKeyframes = `
// @keyframes fadeIn {
//   0% {
//     opacity: 0;
//   }
//   100% {
//     opacity: 1;
//   }
// }
// 
// .animate-fade-in {
//   animation: fadeIn 0.3s ease-in-out forwards;
// }
// `;

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, doctor }, ref) => {
  const isUser = message.role === "user";
  // Убираем отладочный вывод
  // console.log(`Message: ${message.content.substring(0, 20)}... | Role: ${message.role} | isUser: ${isUser}`);
  
  const { avatarUrl } = useContext(AvatarContext);
  const { user } = useAuth();
  
  // Преобразуем timestamp в объект Date, если это необходимо
  const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
  
  // Состояние для отображения контента при стриминге
  const [streamedContent, setStreamedContent] = useState(message.content);
  const [isCurrentlyStreaming, setIsCurrentlyStreaming] = useState(message.isStreaming);
  const [previousLength, setPreviousLength] = useState(0); // Для отслеживания длины предыдущего контента
  
  // Слушаем события обновления сообщений для стриминга
  useEffect(() => {
    const handleMessageUpdate = (event: CustomEvent) => {
      if (event.detail.id === message.id) {
        // Устанавливаем флаг, что сообщение в процессе стриминга
        setIsCurrentlyStreaming(true);
        
        // Запоминаем длину предыдущего контента
        setPreviousLength(streamedContent.length);
        
        // Используем контент как есть, без дополнительной обработки
        setStreamedContent(event.detail.content);
      }
    };
    
    const handleMessageComplete = (event: CustomEvent) => {
      if (event.detail.id === message.id) {
        // Используем финальный контент как есть
        setStreamedContent(event.detail.content);
        setIsCurrentlyStreaming(false);
        setPreviousLength(0);
      }
    };
    
    const handleMessageError = (event: CustomEvent) => {
      if (event.detail.id === message.id) {
        setIsCurrentlyStreaming(false);
        setStreamedContent(`Ошибка: ${event.detail.error}`);
      }
    };
    
    // Преобразуем типы событий для TypeScript
    window.addEventListener('chat-message-update', handleMessageUpdate as EventListener);
    window.addEventListener('chat-message-complete', handleMessageComplete as EventListener);
    window.addEventListener('chat-message-error', handleMessageError as EventListener);
    
    return () => {
      window.removeEventListener('chat-message-update', handleMessageUpdate as EventListener);
      window.removeEventListener('chat-message-complete', handleMessageComplete as EventListener);
      window.removeEventListener('chat-message-error', handleMessageError as EventListener);
    };
  }, [message.id, streamedContent]);
  
  // Обновляем содержимое при изменении message.content
  useEffect(() => {
    // Используем контент как есть, без дополнительной обработки пробелов
    setStreamedContent(message.content);
    
    // Если сообщение помечено как стримящееся, устанавливаем соответствующий флаг
    setIsCurrentlyStreaming(message.isStreaming);
    
    if (!message.isStreaming) {
      setPreviousLength(0);
    }
  }, [message.content, message.isStreaming]);
  
  // Check if we have image files
  const hasImageFiles = () => {
    if (message.files && message.files.length > 0) {
      return message.files.some(file => file.type.startsWith('image/'));
    }
    return false;
  };
  
  // Debug - console log if message has processing flag
  useEffect(() => {
    if (message.processingFiles) {
      // console.log('Message has processingFiles flag:', message.id, message.processingStatus);
    }
  }, [message.processingFiles, message.processingStatus, message.id]);
  
  // Check if we have non-image files
  const hasNonImageFiles = () => {
    if (message.files && message.files.length > 0) {
      return message.files.some(file => !file.type.startsWith('image/'));
    }
    return false;
  };
  
  // Get all files
  const getAllFiles = (): FileData[] => {
    return message.files || [];
  };
  
  // Get non-image files
  const getNonImageFiles = (): FileData[] => {
    return getAllFiles().filter(file => !file.type.startsWith('image/'));
  };
  
  // Get image files with caching
  const getImageFiles = (): FileData[] => getAllFiles().filter(file => file.type.startsWith('image/'));
  
  // Preload and cache images effect
  useEffect(() => {
    let isMounted = true;
    const imageFiles = getImageFiles();
  
    if (typeof window !== 'undefined' && imageFiles.length > 0) {
      import('../../lib/utils').then(({ getCachedImageData, cacheImageData }) => {
        const cachePromises = imageFiles.map(async (file) => {
          if (!file.cached_data) {
            try {
              const cachedData = await getCachedImageData(file.url); // Check cache first
              if (cachedData && isMounted) {
                file.cached_data = cachedData;
              } else {
                // Construct full URL if needed
                const fullUrl = file.url.startsWith('http') ? file.url : getBackendUrl(file.url);
                // Fetch using the full URL
                const response = await fetch(fullUrl);
                if (!response.ok) {
                   // Log error with more details
                  console.error(`Failed to fetch image ${fullUrl}: ${response.status} ${response.statusText}`);
                  // Throw a more specific error
                  throw new Error(`Не удалось загрузить изображение ${file.name || ''} (${response.status})`);
                }
                const blob = await response.blob();
                // Consider adding check for blob type here if needed
                // if (!blob.type.startsWith('image/')) throw new Error(...);

                const newCacheUrl = await cacheImageData(file.url, blob); // Use original relative URL as key
                if (newCacheUrl && isMounted) {
                  file.cached_data = newCacheUrl;
                }
              }
            } catch (err: any) { // Catch specific error
              console.error(`Failed to fetch/cache image ${file.url}:`, err);
              // Optionally set an error state on the file object for UI feedback
              // file.error = err.message;
            }
          }
          return file;
        });
    
        Promise.all(cachePromises).then(updatedFiles => {
          if (isMounted) {
            // console.log('Image caching process completed.');
            // Force re-render if necessary, e.g., if relying on file.cached_data in ImageMessage
            // This might require managing files in component state instead of direct mutation
          }
        }).catch(err => console.error('Error during image caching process:', err));
    
      }).catch(err => console.error('Error importing utils for image caching:', err));
    }
  
    return () => {
      isMounted = false;
      // Consider revoking Object URLs here if created and stored
    };
  }, [message.files]); // Dependency on message.files
  
  // Determine if we have text content or only files
  const hasTextContent = streamedContent && streamedContent !== "Sent a file" && streamedContent !== "Sent files" &&
    streamedContent !== "Отправлен файл" && streamedContent !== "Отправлено несколько файлов";
    
  // Функция для форматирования текста с Markdown
  const formatText = (text: string) => {
    if (!text) return '';
    
    // Убираем лишние пробелы перед знаками препинания
    let formatted = text.replace(/\s+([,.!?;:])/g, '$1');
    
    // Поддержка базового Markdown
    // Полужирный текст
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Курсив
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Списки
    formatted = formatted.replace(/^[\s]*[-*+][\s]+(.*)/gm, '<li>$1</li>');
    formatted = formatted.replace(/^[\s]*(\d+)\. (.*)/gm, '<li>$2</li>');
    
    // Заголовки
    formatted = formatted.replace(/^###[\s]+(.*)/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^##[\s]+(.*)/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^#[\s]+(.*)/gm, '<h1>$1</h1>');
    
    // Преобразуем переносы строк в <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };
  
  // Функция для отображения стриминга с анимацией
  const renderStreamingText = () => {
    // Форматируем текст с Markdown без дополнительной обработки пробелов
    const formattedText = formatText(streamedContent);
    
    if (!isCurrentlyStreaming) {
      // Если стриминг завершен, показываем текст с поддержкой HTML
      return (
        <div 
          className="whitespace-pre-wrap break-words markdown-formatted"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    }
    
    // В режиме стриминга разделяем на уже показанный текст и новый
    const oldText = formattedText.substring(0, previousLength);
    const newText = formattedText.substring(previousLength);
    
    // Отображаем с анимацией только для нового текста
    return (
      <div className="whitespace-pre-wrap break-words">
        <span dangerouslySetInnerHTML={{ __html: oldText }} />
        <span 
          className="stream-fade-in"
          dangerouslySetInnerHTML={{ __html: newText }} 
        />
      </div>
    );
  };
  
  return (
    <div ref={ref} className={cn(
        "flex items-start gap-2 sm:gap-3 py-3 w-full", // Добавляем w-full для гарантии ширины
        isUser ? "justify-end" : "justify-start" // Выравнивание всего блока
    )}>
      {/* Doctor Avatar - только для сообщений от доктора (слева) */}
      {!isUser && doctor && typeof doctor === 'object' && (
        <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0">
          <SimpleAvatar
            src={doctor.avatar 
              ? (doctor.avatar.startsWith('/uploads/') 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${doctor.avatar}` 
                : doctor.avatar) 
              : undefined}
            alt={doctor.name || 'Доктор'}
            fallbackText={doctor.name ? doctor.name.charAt(0) : 'D'} // Используем первую букву имени или 'D'
            className="h-full w-full" // Растягиваем на весь контейнер
          />
        </div>
      )}

      {/* Message Content Block */}
      <div className={cn(
        'flex flex-col gap-1', // Вертикальное расположение
        'max-w-[75%] sm:max-w-[70%]', // Максимальная ширина
        isUser ? 'items-end' : 'items-start', // Выравнивание внутри блока
        // Стили только если НЕТ файлов
        (!hasImageFiles() && !hasNonImageFiles())
          ? isUser
            ? "px-3 py-2 sm:px-4 rounded-[9.6px] border border-[#E2E8F0] bg-[#3B82F6] text-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)]"
            : "px-3 py-2 sm:px-4 rounded-[9.6px] border border-[#E2E8F0] bg-white text-[#334155] shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)]"
          : "p-0" // Без отступов и фона если есть файлы
      )}>

        {/* Processing status (if applicable) */}
        {message.processingFiles && (
          <div className={cn(
            "flex items-center gap-1 text-xs px-1", // Add some padding?
            isUser ? "text-blue-100" : "text-gray-500"
          )}>
            <Spinner size="sm" />
            <span>{message.processingStatus || "Обработка файлов..."}</span>
          </div>
        )}

        {/* Image files */}
        {hasImageFiles() && (
          <div className="flex flex-wrap gap-2 mt-1">
            <ImageMessage
              images={getImageFiles()}
              processingStatus={message.processingFiles ? { isProcessing: true, status: message.processingStatus } : undefined}
            />
          </div>
        )}

        {/* Non-image files */}
        {hasNonImageFiles() && (
          <div className="flex flex-col gap-2 mt-1">
            {getNonImageFiles().map((file, index) => (
              <FileMessage
                key={index}
                file={file}
              />
            ))}
          </div>
        )}

        {/* Text content - Now without background/border styles itself */}
        {hasTextContent && (
          <div className={cn(
            'whitespace-pre-wrap break-words markdown-formatted',
             // Add margin only if files are present above
             (hasImageFiles() || hasNonImageFiles()) ? 'mt-1' : '',
             // Apply padding here IF files are present (since the outer div won't have it)
             (hasImageFiles() || hasNonImageFiles()) ? 'px-3 py-2 sm:px-4' : ''
             // Text color applied conditionally if needed (depends on outer div style)
             // isUser ? 'text-white' : 'text-[#334155]' // Potentially needed if outer div bg changes
          )}>
            {renderStreamingText()}
          </div>
        )}

        {/* Timestamp */}
        <div className={cn(
          "text-xs mt-1 w-full", // Common style + margin, full width for text-align
          isUser ? "text-right text-blue-200" : "text-left text-gray-400", // Text align + Color
          // Padding adjustment might be needed depending on layout
          'px-1'
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* User Avatar - только для сообщений от пользователя (справа) */}
      {isUser && (
         <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0">
           <SimpleAvatar
             src={message.userAvatar || user?.avatar || avatarUrl || undefined}
             alt="User"
             fallbackText={user?.name ? user.name.charAt(0) : 'U'}
             className="h-full w-full"
           />
         </div>
       )}
    </div>
  );
});
ChatMessage.displayName = "ChatMessage";