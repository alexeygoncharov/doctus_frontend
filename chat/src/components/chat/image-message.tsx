"use client";

import { useEffect } from "react";
import { FileData } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { ImageGallery } from "./image-gallery";

interface ImageMessageProps {
  images: FileData[];
  onLoad?: () => void; // Callback when images are loaded
}

export function ImageMessage({ images, onLoad }: ImageMessageProps) {
  // Handle single image vs gallery
  const isImageType = (file: FileData) => file.type.startsWith('image/');
  const imageFiles = images.filter(isImageType);
  
  // Setup effect to run onLoad callback when component mounts
  useEffect(() => {
    if (imageFiles.length > 0 && onLoad) {
      // Try to detect if images are already loaded
      let allLoaded = true;
      const imageElements = document.querySelectorAll(`img[src^="${imageFiles[0].url}"]`);
      
      if (imageElements.length > 0) {
        // Check if all found images are loaded
        imageElements.forEach(img => {
          if (!(img as HTMLImageElement).complete) {
            allLoaded = false;
          }
        });
        
        if (allLoaded) {
          // All images are already loaded
          onLoad();
        } else {
          // Wait for images to load
          const loadHandler = () => {
            onLoad();
          };
          
          // Setup one-time load handler per image
          imageElements.forEach(img => {
            if (!(img as HTMLImageElement).complete) {
              img.addEventListener('load', loadHandler, { once: true });
            }
          });
        }
      } else {
        // No image elements found yet, set a delayed callback
        setTimeout(onLoad, 500);
      }
    }
  }, [imageFiles, onLoad]);
  
  if (imageFiles.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-1">
      <ImageGallery images={imageFiles} />
      
      {/* Show file info for single image */}
      {imageFiles.length === 1 && (
        <div className="mt-1 text-xs text-gray-500">
          {imageFiles[0].name} ({formatFileSize(imageFiles[0].size)})
        </div>
      )}
      
      {/* Show summary for multiple images */}
      {imageFiles.length > 1 && (
        <div className="mt-1 text-xs text-gray-500">
          {imageFiles.length} изображени{imageFiles.length > 4 ? 'й' : imageFiles.length === 1 ? 'е' : 'я'} ({formatFileSize(imageFiles.reduce((total, file) => total + file.size, 0))})
        </div>
      )}
    </div>
  );
}