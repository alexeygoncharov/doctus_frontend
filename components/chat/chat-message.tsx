"use client";

import React, { forwardRef, useContext, useState, useEffect, useRef } from "react";
import { FileData, Message } from "../../lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Doctor } from "../../lib/doctors";
import { User } from "lucide-react";
import { FileMessage } from "./file-message";
import { ImageMessage } from "./image-message";
import { AvatarContext } from "../../pages/_app";
import { getBackendUrl } from "../../lib/api";

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
  const { avatarUrl } = useContext(AvatarContext);
  
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
      console.log('Message has processingFiles flag:', message.id, message.processingStatus);
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
  const getImageFiles = (): FileData[] => {
    const imageFiles = getAllFiles().filter(file => file.type.startsWith('image/'));
    
    // Preload and cache images if we're in the browser
    if (typeof window !== 'undefined') {
      // Use dynamic import to avoid SSR issues
      import('../../lib/utils').then(({ getCachedImageData, cacheImageData }) => {
        imageFiles.forEach(async (file) => {
          // Check if we already have cached data
          if (!file.cached_data) {
            // First check localStorage
            const cachedData = getCachedImageData(file.url);
            if (cachedData) {
              file.cached_data = cachedData;
            } else {
              // If not in localStorage, try to cache it
              try {
                const newCache = await cacheImageData(file.url);
                if (newCache) {
                  file.cached_data = newCache;
                }
              } catch (err) {
                console.error(`Failed to cache image ${file.url}:`, err);
              }
            }
          }
        });
      }).catch(err => console.error('Error preloading images:', err));
    }
    
    return imageFiles;
  };
  
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
    <div ref={ref} className={`flex items-start gap-2 sm:gap-3 py-3 ${isUser ? "justify-end" : "justify-start"} transition-colors duration-300`}>
      {!isUser && doctor && typeof doctor === 'object' && (
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-blue-100">
          <AvatarImage alt={doctor.name} src={doctor.avatar} draggable="false" />
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`
        ${(!hasImageFiles() && !hasNonImageFiles()) ? 'px-3 py-2 sm:px-4' : 'p-0'} 
        max-w-[75%] sm:max-w-[70%]
        ${(!hasImageFiles() && !hasNonImageFiles()) ? (isUser 
          ? "rounded-[9.6px] border border-[#E2E8F0] bg-[#3B82F6] text-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)]" 
          : "rounded-[9.6px] border border-[#E2E8F0] bg-white shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)]") 
          : ""
        }
      `}>
        {/* Files display */}
        {(hasImageFiles() || hasNonImageFiles()) ? (
          <div>
            {/* Images gallery with timestamp */}
            {hasImageFiles() && (
              <>
                <div className="text-xs text-gray-500 mb-1">
                  {isUser ? (
                    <span className="flex justify-end">
                      {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  ) : (
                    <span>{new Date(message.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  )}
                </div>
                <ImageMessage 
                  images={getImageFiles()} 
                  processingStatus={message.processingFiles ? {
                    isProcessing: true,
                    status: message.processingStatus
                  } : undefined}
                />
                {/* Debug info - remove in production */}
                {message.processingFiles && (
                  <div className="text-xs text-gray-500 mb-1">
                    Processing status: {message.processingStatus || "Unknown"}
                  </div>
                )}
              </>
            )}
            
            {/* Non-image files with timestamp */}
            {hasNonImageFiles() && getNonImageFiles().map(file => (
              <div className="mb-1" key={file.url}>
                <div className="text-xs text-gray-500 mb-1">
                  {isUser ? (
                    <span className="flex justify-end">
                      {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  ) : (
                    <span>{new Date(message.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  )}
                </div>
                <FileMessage file={file} />
              </div>
            ))}
            
            {/* Text content if any */}
            {hasTextContent && (
              <div className={`px-3 py-2 mt-2 ${isUser 
                ? "rounded-[9.6px] border border-[#E2E8F0] bg-[#3B82F6] text-white" 
                : "rounded-[9.6px] border border-[#E2E8F0] bg-white"
              }`}>
                <div className={`markdown-content whitespace-normal break-normal ${
                  isUser 
                    ? "text-sm sm:text-base" 
                    : "text-sm sm:text-base text-[#334155] font-normal leading-[22.75px] tracking-[0.35px] font-inter"
                }`}>
                  <div className="text-content">
                    {renderStreamingText()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Timestamp */}
            <div className="text-[10px] sm:text-xs px-0 pb-1 pt-1 text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <>
            {/* Text-only message */}
            <div className={`markdown-content whitespace-normal break-normal ${
              isUser 
                ? "text-sm sm:text-base" 
                : "text-sm sm:text-base text-[#334155] font-normal leading-[22.75px] tracking-[0.35px] font-inter"
            }`}>
              <div className="text-content">
                {renderStreamingText()}
              </div>
            </div>
            
            <div className={`text-[10px] sm:text-xs mt-1 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </>
        )}
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-blue-500">
          {avatarUrl || message.userAvatar ? (
            <AvatarImage 
              alt="User" 
              src={getBackendUrl(avatarUrl || message.userAvatar || '')} 
              draggable="false"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <User className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
});