"use client";

import { useRef, useEffect } from 'react';
import { FileData } from '@/lib/types';
import lightGallery from 'lightgallery';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// Import plugins if needed
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';

interface ImageGalleryProps {
  images: FileData[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryInstance = useRef<any>(null);

  useEffect(() => {
    // Fire an event when images are loaded so chat scrolling can be triggered
    const notifyImagesLoaded = () => {
      // Create and dispatch a custom event when all images are loaded
      const event = new CustomEvent('chatImagesLoaded');
      document.dispatchEvent(event);
      
      // Also try to find and trigger scroll container
      try {
        const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport instanceof HTMLElement) {
          viewport.scrollTop = viewport.scrollHeight + 1000;
        }
      } catch (error) {
        console.error('Error scrolling after image load:', error);
      }
    };
    
    // Only initialize if we have images to display
    if (galleryRef.current && images.length > 0) {
      let loadedImages = 0;
      const totalImages = images.length;
      
      // Track loading of all visible images
      const trackImageLoad = () => {
        loadedImages++;
        if (loadedImages >= totalImages) {
          // All images loaded
          setTimeout(notifyImagesLoaded, 50);
        }
      };
      
      // Find all images and add load listeners
      const imageElements = galleryRef.current.querySelectorAll('img');
      imageElements.forEach(img => {
        if (img.complete) {
          trackImageLoad();
        } else {
          img.addEventListener('load', trackImageLoad);
        }
      });
      
      try {
        galleryInstance.current = lightGallery(galleryRef.current, {
          plugins: [lgZoom, lgThumbnail],
          speed: 500,
          download: true,
          counter: true,
          selector: 'a',
          strings: {
            download: 'Скачать',
            closeGallery: 'Закрыть',
            share: 'Поделиться',
            zoomIn: 'Увеличить',
            zoomOut: 'Уменьшить',
            next: 'Следующее',
            previous: 'Предыдущее',
          },
        });
      } catch (error) {
        console.error('Error initializing lightGallery:', error);
      }
    }

    return () => {
      try {
        // Clean up image listeners
        if (galleryRef.current) {
          const imageElements = galleryRef.current.querySelectorAll('img');
          imageElements.forEach(img => {
            img.removeEventListener('load', () => {});
          });
        }
        
        if (galleryInstance.current) {
          galleryInstance.current.destroy();
          galleryInstance.current = null;
        }
      } catch (error) {
        console.error('Error destroying lightGallery:', error);
      }
    };
  }, [images.length]);

  // Function to layout images based on count
  const getGridClassNames = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2 grid-rows-2';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-3 grid-rows-2';
    }
  };

  // Function to get specific image size classes
  const getImageClassNames = (index: number, total: number) => {
    if (total === 1) {
      return 'rounded-lg max-h-80 w-auto object-contain';
    }
    
    if (total === 2) {
      return 'h-48 w-full object-cover rounded-lg';
    }
    
    if (total === 3) {
      if (index === 0) {
        return 'col-span-1 row-span-2 h-full w-full object-cover rounded-lg';
      } else {
        return 'h-36 w-full object-cover rounded-lg';
      }
    }
    
    if (total === 4) {
      return 'h-36 w-full object-cover rounded-lg';
    }
    
    // 5 or more images
    if (index < 4) {
      return 'h-28 w-full object-cover rounded-lg';
    } else {
      return 'hidden'; // Hide additional images but they're still in the gallery
    }
  };

  const getGridItemClassNames = (index: number, total: number) => {
    if (total === 3 && index === 0) {
      return 'col-span-1 row-span-2';
    }
    return '';
  };

  // Show a max of 4 images in grid with a +X overlay for additional images
  const visibleImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{ maxWidth: '400px' }}
    >
      <div 
        ref={galleryRef} 
        className={`grid gap-1 ${getGridClassNames(images.length)}`}
      >
        {images.map((image, index) => (
          <div 
            key={image.url} 
            className={`relative overflow-hidden ${getGridItemClassNames(index, images.length)}`}
          >
            <a 
              href={image.url}
              data-sub-html={`<h4>${image.name}</h4>`}
            >
              <img 
                src={image.url} 
                alt={image.name}
                className={getImageClassNames(index, images.length)}
              />
              
              {/* Show +X overlay on the last visible image if there are more */}
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{remainingCount}</span>
                </div>
              )}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}