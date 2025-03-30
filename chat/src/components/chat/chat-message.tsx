"use client";

import { FileData, Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Doctor } from "@/lib/doctors";
import { User } from "lucide-react";
import { FileMessage } from "./file-message";
import { ImageMessage } from "./image-message";

interface ChatMessageProps {
  doctor: Doctor | null;
  message: Message;
}

export function ChatMessage({ message, doctor }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  // Check if we have image files
  const hasImageFiles = () => {
    if (message.files && message.files.length > 0) {
      return message.files.some(file => file.type.startsWith('image/'));
    }
    if (message.file && message.file.type.startsWith('image/')) {
      return true;
    }
    return false;
  };
  
  // Check if we have non-image files
  const hasNonImageFiles = () => {
    if (message.files && message.files.length > 0) {
      return message.files.some(file => !file.type.startsWith('image/'));
    }
    if (message.file && !message.file.type.startsWith('image/')) {
      return true;
    }
    return false;
  };
  
  // Get all files (combine single file and files array if needed)
  const getAllFiles = (): FileData[] => {
    const files: FileData[] = [];
    if (message.file) {
      files.push(message.file);
    }
    if (message.files) {
      files.push(...message.files);
    }
    return files;
  };
  
  // Get non-image files
  const getNonImageFiles = (): FileData[] => {
    return getAllFiles().filter(file => !file.type.startsWith('image/'));
  };
  
  // Get image files
  const getImageFiles = (): FileData[] => {
    return getAllFiles().filter(file => file.type.startsWith('image/'));
  };
  
  // Determine if we have text content or only files
  const hasTextContent = message.content && message.content !== "Sent a file" && message.content !== "Sent files" && 
    message.content !== "Отправлен файл" && message.content !== "Отправлено несколько файлов";
  
  return (
    <div className={`flex items-start gap-2 sm:gap-3 py-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && doctor && typeof doctor === 'object' && (
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-blue-100">
          <AvatarImage alt={doctor.name} src={doctor.avatar} />
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
            {/* Images gallery */}
            {hasImageFiles() && (
              <ImageMessage 
              images={getImageFiles()} 
              onLoad={() => {
                // After images load, dispatch DOM event to trigger chat scrolling
                try {
                  // Try to find and scroll the viewport
                  const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
                  if (viewport instanceof HTMLElement) {
                    viewport.scrollTop = viewport.scrollHeight + 1000;
                  }
                  
                  // Create and dispatch a custom event to notify the chat window
                  const event = new CustomEvent('chatImagesLoaded');
                  document.dispatchEvent(event);
                } catch (error) {
                  console.error('Error in image load handler:', error);
                }
              }}
            />
            )}
            
            {/* Non-image files */}
            {hasNonImageFiles() && getNonImageFiles().map(file => (
              <div className="mb-1" key={file.url}>
                <FileMessage file={file} />
              </div>
            ))}
            
            {/* Text content if any */}
            {hasTextContent && (
              <div className={`px-3 py-2 mt-2 ${isUser 
                ? "rounded-[9.6px] border border-[#E2E8F0] bg-[#3B82F6] text-white" 
                : "rounded-[9.6px] border border-[#E2E8F0] bg-white"
              }`}>
                <p className={`break-words ${
                  isUser 
                    ? "text-sm sm:text-base" 
                    : "text-sm sm:text-base text-[#334155] font-normal leading-[22.75px] tracking-[0.35px] font-inter"
                }`}>{message.content}</p>
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
            <p className={`break-words ${
              isUser 
                ? "text-sm sm:text-base" 
                : "text-sm sm:text-base text-[#334155] font-normal leading-[22.75px] tracking-[0.35px] font-inter"
            }`}>{message.content}</p>
            
            <div className={`text-[10px] sm:text-xs mt-1 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </>
        )}
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-blue-500">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}