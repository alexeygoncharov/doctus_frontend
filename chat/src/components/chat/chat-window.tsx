"use client";

import React, { useState, useRef, useEffect } from "react";
import { Doctor } from "@/lib/doctors";
import { Message, FileData } from "@/lib/types";
import { sendMessage } from "@/lib/api";
import { ChatMessage } from "./chat-message";
import { Input } from "@/components/ui/input";
import { SendIcon, Clock, ShieldCheck, Brain, User, Stethoscope } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlusBadge } from "@/components/doctors/plus-badge";
import { CameraModal } from "./camera-modal";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatWindowProps {
  doctor: Doctor | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function ChatWindow({ doctor, messages, setMessages }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // This effect ensures the input always stays focused
  useEffect(() => {
    // Focus input on initial load
    inputRef.current?.focus();
    
    // Create a function to always maintain focus on the input
    const keepFocused = () => {
      // Only refocus if the document.activeElement is not our input
      // This prevents stealing focus when user intentionally focuses elsewhere
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    
    // Listen for form submissions and refocus after they complete
    const formElement = document.querySelector('form');
    formElement?.addEventListener('submit', () => {
      // Use setTimeout to ensure this runs after the default form handling
      setTimeout(keepFocused, 0);
    });
    
    // Create a mutation observer to watch for changes in the DOM
    // This helps catch focus loss caused by DOM updates
    const observer = new MutationObserver(() => {
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    });
    
    // Start observing the chat container for changes
    const chatContainer = document.querySelector('.flex-col.h-full');
    if (chatContainer) {
      observer.observe(chatContainer, { 
        attributes: false, 
        characterData: false,
        childList: true,
        subtree: true
      });
    }
    
    return () => {
      // Clean up the event listeners and observer
      formElement?.removeEventListener('submit', keepFocused);
      observer.disconnect();
    };
  }, []);

  // Function to scroll only the chat container (not the whole page)
  // Create a ref for the ScrollArea component
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const scrollChatToBottom = () => {
    try {
      // Get all messages
      const messages = document.querySelectorAll('#chat-scroll-container .space-y-4 > div');
      // Get last message if available 
      const lastMessage = messages.length ? messages[messages.length - 1] : null;
      
      // First priority: if there's a last message, scroll to it directly
      if (lastMessage instanceof HTMLElement) {
        lastMessage.scrollIntoView({ behavior: "auto", block: "end" });
      }
      
      // Second priority: use our refs 
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      }
      
      // Always attempt direct viewport manipulation
      const viewports = document.querySelectorAll('[data-radix-scroll-area-viewport]');
      for (let i = 0; i < viewports.length; i++) {
        const viewport = viewports[i];
        if (viewport instanceof HTMLElement) {
          // Force explicit scroll position - try to set it to maximum possible
          viewport.scrollTop = viewport.scrollHeight * 2;
          
          // Brute force approach - artificially increase scroll range then restore
          if (i === viewports.length - 1) {
            const originalHeight = viewport.style.height;
            // Temporarily make the viewport much taller to allow scrolling further
            viewport.style.height = "10000px";
            viewport.scrollTop = 99999;
            // Restore original height
            setTimeout(() => {
              viewport.style.height = originalHeight;
              viewport.scrollTop = viewport.scrollHeight * 2;
            }, 10);
          }
        }
      }
    } catch (error) {
      console.error("Failed to scroll chat to bottom:", error);
    }
  };
  
  // Scroll to bottom when messages change
  // This effect scrolls the chat to bottom both on initial render and when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Create a MutationObserver to watch for changes to the message list
      const messagesContainer = document.querySelector('#chat-scroll-container .space-y-4');
      
      if (messagesContainer) {
        const observer = new MutationObserver((mutations) => {
          // When DOM changes in the messages container, scroll to bottom
          scrollChatToBottom();
          
          // Delay additional scroll attempts to ensure everything is rendered
          setTimeout(scrollChatToBottom, 100);
          setTimeout(scrollChatToBottom, 300);
        });
        
        // Start observing with these configuration parameters
        observer.observe(messagesContainer, {
          childList: true,   // Watch for changes to the direct children
          subtree: true,     // Watch for changes to descendants
          characterData: true // Watch for changes to text content
        });
        
        // Immediately try to scroll
        scrollChatToBottom();
        
        // Multiple delayed attempts with aggressive scrolling
        const scrollAttempts = [
          10, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000
        ];
        
        const timers = scrollAttempts.map(delay => 
          setTimeout(scrollChatToBottom, delay)
        );
        
        return () => {
          observer.disconnect();
          timers.forEach(timer => clearTimeout(timer));
        };
      } else {
        // Fallback if container not found
        scrollChatToBottom();
        
        const timers = [100, 500, 1000, 2000].map(delay => 
          setTimeout(scrollChatToBottom, delay)
        );
        
        return () => {
          timers.forEach(timer => clearTimeout(timer));
        };
      }
    }
  }, [messages]);
  
  // Special effect for handling image loading which can affect scroll position
  useEffect(() => {
    if (messages.length === 0) return;
    
    // We need to observe when new message elements are added to the DOM
    // This is critical for when reactions, images, or any async content loads
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, scroll to bottom
        setTimeout(scrollChatToBottom, 100);
      }
    };
    
    // Listen for images loading in the chat
    const handleImageLoad = () => {
      // When any image loads, make sure we're still scrolled to bottom
      scrollChatToBottom();
    };
    
    // Add event listeners to any images in the chat
    const images = document.querySelectorAll('#chat-scroll-container img');
    images.forEach(img => {
      img.addEventListener('load', handleImageLoad);
    });
    
    // Listen for custom event from ImageGallery component
    const handleChatImagesLoaded = () => {
      console.log('Chat images loaded event received');
      // Aggressive scrolling when images are loaded
      scrollChatToBottom();
      setTimeout(scrollChatToBottom, 50);
      setTimeout(scrollChatToBottom, 150);
      setTimeout(scrollChatToBottom, 300);
    };
    
    // Listen for visibility changes (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('chatImagesLoaded', handleChatImagesLoaded);
    
    // Add resize listener to handle window size changes
    window.addEventListener('resize', scrollChatToBottom);
    
    // Watch for click events that might expand content
    document.addEventListener('click', () => {
      setTimeout(scrollChatToBottom, 50); 
    });
    
    // Global mutation observer that watches for any DOM changes in the chat
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          // DOM changed, try to scroll
          scrollChatToBottom();
        }
      });
    });
    
    // Start observing the chat area
    const chatContainer = document.querySelector('#chat-scroll-container');
    if (chatContainer) {
      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
    }
    
    // Try to scroll right now
    scrollChatToBottom();
    
    return () => {
      // Clean up all event listeners
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('chatImagesLoaded', handleChatImagesLoaded);
      window.removeEventListener('resize', scrollChatToBottom);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!input.trim() && !fileInputRef.current?.files?.length) || !doctor) return;
    
    const userMessage: Message = {
      content: input || (fileInputRef.current?.files?.length && fileInputRef.current.files.length > 1 ? "Отправлено несколько файлов" : "Отправлен файл"),
      id: crypto.randomUUID(),
      role: "user",
      timestamp: new Date(),
    };
    
    // Check if there are files to upload
    if (fileInputRef.current?.files?.length) {
      const files = Array.from(fileInputRef.current.files);
      
      // Handle multiple files
      if (files.length > 1) {
        // Create FileData array for multiple files
        const filesData = files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        }));
        
        userMessage.files = filesData;
      } else {
        // Single file (keep backward compatibility)
        const file = files[0];
        const fileUrl = URL.createObjectURL(file);
        
        userMessage.file = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl
        };
      }
    }
    
    // Clear input and update messages
    setInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Focus the input right after state updates
    // Focus input and scroll to bottom
    requestAnimationFrame(() => {
      scrollChatToBottom();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
    
    // If there's no text content, just show the file message without waiting for a response
    if (!input.trim()) {
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send the message with a safe doctor object
      const safeDoctor = typeof doctor === 'object' ? doctor : null;
      const response = await sendMessage(safeDoctor, [...messages, userMessage]);
      setMessages((prev) => [...prev, response]);
      
      // Force scroll on receiving response with multiple attempts
      setTimeout(scrollChatToBottom, 0);
      setTimeout(scrollChatToBottom, 50);
      setTimeout(scrollChatToBottom, 100);
      setTimeout(scrollChatToBottom, 300);
    } catch (error) {
      console.error("Failed to send message", error);
      // Optionally restore the input if sending fails
      // setInput(currentInput);
    } finally {
      setIsLoading(false);
      
      // Make absolutely sure the input is focused after everything is done
      requestAnimationFrame(() => {
        scrollChatToBottom();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleCameraCapture = (capturedImages: FileData[]) => {
    if (capturedImages.length > 0 && doctor && typeof doctor === 'object') {
      const userMessage: Message = {
        content: capturedImages.length > 1 ? "Отправлено несколько фото" : "Отправлено фото",
        files: capturedImages,
        id: crypto.randomUUID(),
        role: "user",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, userMessage]);
      // Force immediate scroll attempt after adding user message
      setTimeout(scrollChatToBottom, 0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {doctor ? (
        <>
          {/* Desktop header - hidden on mobile */}
          <div className="hidden md:block p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 shrink-0 relative bg-blue-100">
                  <AvatarImage alt={typeof doctor === 'object' ? doctor.name : ''} src={typeof doctor === 'object' ? doctor.avatar : ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{typeof doctor === 'object' ? doctor.name : ''}</h2>
                  {typeof doctor === 'object' && doctor.isPremium && <PlusBadge />}
                </div>
                <p className="text-sm text-gray-500">{typeof doctor === 'object' ? `${doctor.specialty} - ${doctor.description}` : ''}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            <ScrollArea className="h-full w-full" id="chat-scroll-container" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 mb-4 relative bg-blue-100">
                      <AvatarImage alt={typeof doctor === 'object' ? doctor.name : ''} src={typeof doctor === 'object' ? doctor.avatar : ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-4 right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white online-indicator" />
                  </div>
                  <h3 className="text-lg font-medium">{typeof doctor === 'object' ? `${doctor.name}` : ''}</h3>
                  <p className="text-sm text-gray-500 mb-6">{typeof doctor === 'object' ? doctor.description : ''}</p>
                  
                  <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 mt-6 text-gray-700">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      <span className="text-sm">Прикрепляйте файлы</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span className="text-sm">Делайте фото</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="text-sm">Задавайте вопросы</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="space-y-4 w-full">
                    {messages.map((message) => (
                      <ChatMessage 
                        doctor={typeof doctor === 'object' ? doctor : null} 
                        key={message.id} 
                        message={message} 
                      />
                    ))}
                    {/* This spacer ensures the last message is not hidden behind the input bar */}
                    <div style={{ height: "200px" }} className="mt-8" />
                    <div 
                      ref={messagesEndRef} 
                      className="h-10 w-full mt-4" 
                      id="messages-end-marker"
                      style={{ marginBottom: "100px" }}
                    />
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
          
          <div className="p-4 border-t w-full sticky bottom-0 bg-white z-10" id="chat-input-container">
            <form
              className="flex items-center space-x-2 w-full"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSendMessage();
                }
                // Ensure focus returns to input after form submission
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
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
                onChange={() => {
                  if (fileInputRef.current?.files?.length) {
                    handleSendMessage();
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
                <svg className="h-5 w-5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="ml-1 text-sm hidden sm:inline">Фото</span>
              </button>
              
              <Input
                autoFocus={true}
                className="flex-1"
                disabled={isLoading}
                onBlur={(e) => {
                  // Prevent the input from losing focus unless user explicitly
                  // focused on another interactive element
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!relatedTarget || !['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA'].includes(relatedTarget.tagName)) {
                    // If not focusing on another form element, refocus this input
                    e.target.focus();
                  }
                }}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      handleSendMessage();
                    }
                  }
                }}
                placeholder="Введите сообщение или добавьте файлы..."
                ref={inputRef}
                value={input}
              />
              <button 
                className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white disabled:opacity-50" 
                disabled={isLoading || !input.trim()}
                onClick={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                  // Make sure to keep focus after clicking send button
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
                type="button"
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <Stethoscope className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium">Выберите врача</h3>
          <p className="text-gray-500 mt-2 mb-6">Выберите нужного специалиста из списка слева</p>
          
          {/* Benefits shown on the main screen - no background fill */}
          <div className="flex flex-col sm:flex-row sm:space-x-12 space-y-6 sm:space-y-0 mt-6 text-gray-700">
            <div className="flex flex-col items-center">
              <Clock className="h-7 w-7 mb-2 text-blue-500" />
              <span className="text-sm font-medium">Доступно 24/7</span>
              <span className="text-xs text-gray-500 mt-1">Получите консультацию в любое время</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-7 w-7 mb-2 text-blue-500" />
              <span className="text-sm font-medium">Конфиденциально</span>
              <span className="text-xs text-gray-500 mt-1">Ваши данные надежно защищены</span>
            </div>
            <div className="flex flex-col items-center">
              <Brain className="h-7 w-7 mb-2 text-blue-500" />
              <span className="text-sm font-medium">ИИ технологии</span>
              <span className="text-xs text-gray-500 mt-1">Современные медицинские знания</span>
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