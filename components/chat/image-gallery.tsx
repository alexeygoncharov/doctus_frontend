"use client";

import { useEffect, useState } from "react";
import { FileData } from "../../lib/types";

interface ImageGalleryProps {
  images: FileData[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGallery({ images, initialIndex, isOpen, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Function to extract order number from URL
  const getImageOrderNumber = (url: string): number | null => {
    const orderMatch = url.match(/_order(\d+)/);
    if (orderMatch && orderMatch[1]) {
      return parseInt(orderMatch[1], 10);
    }
    return null;
  };
  
  // Reset current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={onClose}>
      <div className="relative w-full h-full flex flex-col">
        {/* Top bar with close button */}
        <div className="flex justify-between items-center py-2 px-4 text-white">
          <span className="text-sm">
            {getImageOrderNumber(images[currentIndex].url) !== null 
              ? `#${getImageOrderNumber(images[currentIndex].url)} - ` 
              : ''}{currentIndex + 1} / {images.length}
          </span>
          <button 
            className="p-2 rounded-full hover:bg-white/10"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Main image display */}
        <div 
          className="flex-1 flex items-center justify-center p-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <img 
            alt={images[currentIndex].name} 
            className="max-h-full max-w-full object-contain" 
            src={images[currentIndex].url.split('?')[0]} 
            onError={(e) => {
              console.error("Failed to load image in gallery:", images[currentIndex].url);
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loops
              
              // Try to load the same image with a cache-busting timestamp
              const originalUrl = images[currentIndex].url.split('?')[0];
              const timestampUrl = `${originalUrl}?t=${Date.now()}`;
              
              // console.log("Trying with cache-busting URL:", timestampUrl);
              target.src = timestampUrl;
              
              // Не используем async/await, а вместо этого устанавливаем src напрямую
              
              // Если это не сработает, установим еще один обработчик ошибок
              target.onerror = () => {
                // Попытка загрузки резервного URL (через /uploads/ если исходный был через API)
                if (images[currentIndex].url.includes('/api/')) {
                  const backupUrl = images[currentIndex].url.replace('/api/', '/uploads/');
                  
                  // console.log("Trying backup URL:", backupUrl);
                  target.src = backupUrl;
                }
              };
            }}
          />
        </div>
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Thumbnails at bottom */}
        {images.length > 1 && (
          <div className="p-2 flex justify-center gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.url}
                className={`w-16 h-16 rounded overflow-hidden relative ${index === currentIndex ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              >
                {getImageOrderNumber(image.url) !== null && (
                  <div className="absolute top-0 left-0 z-10 bg-black/60 text-white text-xs px-1 py-0.5 rounded-br-md">
                    #{getImageOrderNumber(image.url)}
                  </div>
                )}
                <img 
                  alt={image.name} 
                  className="w-full h-full object-cover" 
                  src={image.url.split('?')[0]} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    
                    // Try backup location
                    if (image.url.includes('/uploads/chat_')) {
                      const chatId = image.url.match(/\/chat_(\d+)\//)?.[1];
                      if (chatId) {
                        target.src = image.url.replace(
                          /\/uploads\/chat_\d+\//, 
                          `/uploads/backup_chat_${chatId}/`
                        );
                      }
                    }
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}