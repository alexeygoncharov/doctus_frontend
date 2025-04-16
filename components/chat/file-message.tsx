"use client";

import { useState } from "react";
import { FileData } from "../../lib/types";
import { formatFileSize } from "../../lib/utils";
import "file-icon-vectors/dist/file-icon-vivid.min.css";

interface FileMessageProps {
  file: FileData;
}

export function FileMessage({ file }: FileMessageProps) {
  // Get the file extension from the filename
  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  };
  
  const fileExtension = getFileExtension(file.name);
  
  // Create the file icon class based on extension
  // Default to fiv-icon-blank if no extension is matched
  const fileIconClass = `fiv-viv fiv-icon-${fileExtension || 'blank'}`;
  
  // Remove debug logging in production
  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    // console.log("FILE MESSAGE DEBUG:", {
    //   fileName: file.name,
    //   fileSize: file.size,
    //   fileType: file.type,
    //   fileUrl: file.url,
    //   fileExtension
    // });
  }
  
  // Create a persistent URL for the file without cache-busting
  // This ensures the same URL is used across sessions
  const fileUrl = file.url;
  
  return (
    <a 
      href={fileUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors no-underline" 
      download
    >
      <div className="flex-shrink-0 mr-3">
        <span 
          className={fileIconClass}
          style={{ fontSize: "2.5rem" }}
        ></span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>
      <div className="ml-4">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </div>
    </a>
  );
}