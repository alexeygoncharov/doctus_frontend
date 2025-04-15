"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react'; // Для запасной иконки
import { cn } from '@/lib/utils'; // Утилита для классов
import Image, { ImageProps } from 'next/image'; // <-- Импортируем next/image и ImageProps

// Определяем пропсы отдельно, не наследуя напрямую от ImageProps для src
interface SimpleAvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'alt'> {
  src?: string | null; // Разрешаем null и undefined для src
  alt: string;
  fallbackText?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  // Можно добавить другие пропсы Image, если нужно (напр., quality, unoptimized)
}

export function SimpleAvatar({
  src,
  alt,
  fallbackText,
  width = 40, // Задаем width по умолчанию
  height = 40, // Задаем height по умолчанию
  className,
  priority, // Добавляем проп priority для next/image
  ...props // Это div props, не Image props
}: SimpleAvatarProps) {
  const [showFallback, setShowFallback] = useState(!src); // Показываем fallback, если src изначально пуст

  useEffect(() => {
    setShowFallback(!src); // Обновляем состояние при изменении src
  }, [src]);

  const handleError = () => {
    // console.warn(`SimpleAvatar: Error loading ${src}. Using fallback.`);
    setShowFallback(true);
  };

  // Если показываем fallback
  if (showFallback) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-muted text-sm text-muted-foreground",
          className
        )}
        style={{ width: `${width}px`, height: `${height}px` }} // Используем width/height для размера fallback
        {...props} // Передаем остальные div пропсы в fallback
      >
        {fallbackText ? (
          fallbackText.substring(0, 2).toUpperCase()
        ) : (
          <User style={{ width: '50%', height: '50%' }} />
        )}
      </div>
    );
  }

  // Если есть src и нет ошибки, рендерим Image
  // src здесь гарантированно не null и не undefined
  return (
     <div 
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full", 
          className // Применяем класс к обертке
        )}
        style={{ width: `${width}px`, height: `${height}px` }} 
        {...props} // Передаем остальные div пропсы обертке
     >
        <Image
          src={src!} // Используем non-null assertion, т.к. проверили выше
          alt={alt}
          width={width} // Передаем width
          height={height} // Передаем height
          priority={priority} // Передаем priority
          onError={handleError}
          // Классы для самого изображения внутри обертки
          className="aspect-square h-full w-full object-cover" 
          // Не передаем ...props от div в Image, т.к. они могут конфликтовать
          // Можно передать специфичные пропсы для Image, если нужно
        />
     </div>
  );
} 