"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Message } from "../../lib/types";
import { Input } from "../../components/ui/input";

interface SearchChatProps {
  messages: Message[];
  onResultClick: (messageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchChat({ messages, onResultClick, isOpen, onClose }: SearchChatProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filteredMessages = messages.filter(
      (message) => message.content.toLowerCase().includes(term)
    );
    setSearchResults(filteredMessages);
  }, [searchTerm, messages]);

  const handleMessageClick = (messageId: string) => {
    onResultClick(messageId);
    onClose();
  };

  return (
    <div 
      className={`absolute top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b shadow-md 
                 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="p-2 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Поиск в чате..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto border-t">
          {searchResults.map((message) => (
            <button
              key={message.id}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-start"
              onClick={() => handleMessageClick(message.id)}
            >
              <div className="flex-shrink-0 mr-2 mt-1">
                <div className={`h-2 w-2 rounded-full ${message.role === "user" ? "bg-blue-500" : "bg-green-500"}`} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-gray-500 mb-1">
                  {message.role === "user" ? "Вы" : "Врач"} • {(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm truncate">{message.content}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchTerm && searchResults.length === 0 && (
        <div className="py-4 text-center text-gray-500 border-t">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}