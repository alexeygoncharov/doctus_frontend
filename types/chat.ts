export interface FileData {
  name: string;
  url?: string;
  type?: string;
  size?: number;
}

export interface MessageType {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  userAvatar?: string;
  files?: FileData[];
  isProcessing?: boolean;
} 