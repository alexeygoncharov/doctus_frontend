"use client";

import { useEffect, useState, useRef } from "react";
import { FileData } from "../../lib/types";
import { formatFileSize } from "../../lib/utils";
import { ImageGallery } from "./image-gallery";
import Image from 'next/image';
import { Spinner } from '../ui/spinner';

interface ImageMessageProps {
  images: FileData[];
  processingStatus?: {
    isProcessing: boolean;
    status?: string;
  };
}

export function ImageMessage({ images, processingStatus }: ImageMessageProps) {
  // Add a custom event for image loading complete
  const dispatchImagesLoaded = () => {
    window.dispatchEvent(new CustomEvent('chat-images-loaded'));
  };
  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Log when processing status changes
  if (processingStatus) {
    // console.log('ImageMessage processing status:', processingStatus);
  }
  
  // Statuses to cycle through during processing
  const processingStatuses = [
    "Загрузка изображения...",
    "Распознавание содержимого...",
    "Анализ изображения...",
    "Обработка данных..."
  ];
  const [statusIndex, setStatusIndex] = useState(0);
  
  // Cycle through statuses during processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (processingStatus?.isProcessing) {
      interval = setInterval(() => {
        setStatusIndex(prev => (prev + 1) % processingStatuses.length);
      }, 2000); // Change status every 2 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingStatus?.isProcessing]);
  
  useEffect(() => {
    // Reset loaded count when images change
    setImagesLoaded(0);
    imageRefs.current = imageRefs.current.slice(0, images.length);
    
    // Check if images are already cached/loaded
    images.forEach((_, index) => {
      if (imageRefs.current[index]?.complete) {
        setImagesLoaded(prevCount => prevCount + 1);
      }
    });
  }, [images]);
  
  // Trigger the custom event when all images are loaded
  useEffect(() => {
    if (imagesLoaded === images.length && images.length > 0) {
      dispatchImagesLoaded();
    }
  }, [imagesLoaded, images.length]);
  
  if (!images.length) return null;
  
  const handleImageLoad = () => {
    setImagesLoaded(prevCount => prevCount + 1);
  };
  
  const handleClick = (index: number) => {
    setInitialIndex(index);
    setOpen(true);
  };

  // Function to extract order number from URL
  const getImageOrderNumber = (url: string): number | null => {
    const orderMatch = url.match(/_order(\d+)/);
    if (orderMatch && orderMatch[1]) {
      return parseInt(orderMatch[1], 10);
    }
    return null;
  };
  
  return (
    <div className="relative inline-block">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <Spinner size="md" variant="primary" />
        </div>
      )}
      {error ? (
        <div className="flex items-center justify-center h-48 w-48 bg-gray-100 rounded-lg">
          <span className="text-gray-500">Ошибка загрузки изображения</span>
        </div>
      ) : (
        <div className="mb-1">
          <div className="rounded-lg overflow-hidden flex flex-wrap gap-1">
            {images.length === 1 ? (
              // Single image display
              <div 
                className="relative cursor-pointer w-full" 
                onClick={() => handleClick(0)}
              >
                <Image
                  src={images[0].cached_data || images[0].url}
                  alt={images[0].name || "Изображение из чата"}
                  width={200}
                  height={200}
                  className={`w-full h-auto rounded-lg object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => {
                    handleImageLoad();
                    setIsLoading(false);
                  }}
                  onError={() => {
                    setError(true);
                    setIsLoading(false);
                  }}
                />
                {/* Processing overlay */}
                {processingStatus?.isProcessing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="animate-spin h-10 w-10 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </div>
                    <div className="text-white text-center px-3 py-1 rounded bg-black/60">
                      {processingStatus.status || processingStatuses[statusIndex]}
                    </div>
                  </div>
                )}
                {/* Display the image order number badge if available */}
                {getImageOrderNumber(images[0].url) !== null && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                    #{getImageOrderNumber(images[0].url)}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  {formatFileSize(images[0].size)}
                </div>
              </div>
            ) : (
              // Multiple images display (grid)
              <div className="grid grid-cols-2 w-full gap-1">
                {images.slice(0, 4).map((image, index) => (
                  <div 
                    key={image.url} 
                    className="relative cursor-pointer aspect-square" 
                    onClick={() => handleClick(index)}
                  >
                    <Image
                      src={image.cached_data || image.url}
                      alt={image.name || "Изображение из чата"}
                      width={200}
                      height={200}
                      className={`w-full h-full rounded-lg object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={() => {
                        handleImageLoad();
                        setIsLoading(false);
                      }}
                      onError={() => {
                        setError(true);
                        setIsLoading(false);
                      }}
                    />
                    {/* Processing overlay for each image */}
                    {processingStatus?.isProcessing && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="animate-spin h-8 w-8 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Display the image order number badge if available */}
                    {getImageOrderNumber(image.url) !== null && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                        #{getImageOrderNumber(image.url)}
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                      {formatFileSize(image.size)}
                    </div>
                    
                    {/* Show "+X more" badge on the last visible image if there are more than 4 images */}
                    {index === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">+{images.length - 4} ещё</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Image Gallery for fullscreen view */}
          <ImageGallery 
            images={images} 
            initialIndex={initialIndex}
            isOpen={open} 
            onClose={() => setOpen(false)} 
          />
          
          {/* Processing status bar */}
          {processingStatus?.isProcessing && (
            <div className="mt-2 bg-blue-50 dark:bg-slate-800 rounded-lg p-2">
              <div className="flex items-center">
                <div className="mr-2 animate-spin h-4 w-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
                <div className="text-sm font-medium">
                  {processingStatus.status || processingStatuses[statusIndex]}
                </div>
              </div>
              <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}