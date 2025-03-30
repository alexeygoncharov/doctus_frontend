export interface FileData {
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  file?: FileData;
  files?: FileData[]; // Added support for multiple files
}

export interface ChatSession {
  doctorId: string;
  messages: Message[];
}