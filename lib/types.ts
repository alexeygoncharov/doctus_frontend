export interface FileData {
  name: string;
  size: number;
  type: string;
  url: string;
  id?: string; // Добавлено поле ID для ссылки на бэкенд
  orderNumber?: number; // Added field to track image order number
  cached_data?: string; // Base64 data or blob URL for persistent storage
}

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    _lastUploadedFiles: FileData[] | null;
  }
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  files?: FileData[]; // Массив файлов
  userAvatar?: string; // User avatar URL
  isStreaming?: boolean; // Флаг для обозначения того, что сообщение находится в процессе стриминга
  processingFiles?: boolean; // Флаг, указывающий на обработку файлов
  processingStatus?: string; // Текущий статус обработки файлов
}

export interface ChatSession {
  doctorId: string;
  messages: Message[];
}

// Типы для пользователя
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: "USER" | "ADMIN";
  created_at: string;
}

// Типы для медицинского профиля
export interface MedicalProfile {
  id: string;
  user_id: string;
  gender: "male" | "female" | "not_specified";
  height?: number;
  weight?: number;
  birth_date?: string;
}

// Расширенная информация о пользователе
export interface UserWithProfile extends User {
  medical_profile?: MedicalProfile;
}

// Параметры для создания пользователя
export interface UserCreateParams {
  email: string;
  password: string;
  name: string;
  medical_profile?: {
    gender: string;
    height?: number;
    weight?: number;
  };
}

// Параметры для обновления пользователя
export interface UserUpdateParams {
  name?: string;
  email?: string;
  medical_profile?: {
    gender?: string;
    height?: number;
    weight?: number;
    birth_date?: string;
  };
}

// Типы для авторизации
export interface LoginParams {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}