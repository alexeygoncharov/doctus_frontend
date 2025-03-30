"use client";

import { FileData } from "@/lib/types";
import { Download } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
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
  
  return (
    <div className="flex items-center" style={{ 
      background: '#FFF',
      border: '1px solid #E2E8F0',
      borderRadius: '9.6px',
      boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.04)',
      maxWidth: '300px'
    }}>
      <div className="mr-3 flex-shrink-0 ml-3">
        <span 
          className={fileIconClass}
          style={{ fontSize: "2.5rem" }}
        ></span>
      </div>
      <div className="flex-grow overflow-hidden py-3">
        <div className="font-medium text-sm truncate text-black">{file.name}</div>
        <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
      </div>
      <a 
        className="ml-3 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex-shrink-0 mr-2" 
        download={file.name}
        href={file.url}
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="text-gray-600" size={16} />
      </a>
    </div>
  );
}