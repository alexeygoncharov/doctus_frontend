import { Message } from "./types";
import { Doctor } from "./doctors";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// User interfaces
export interface MedicalProfile {
  gender?: string;
  birth_date?: string | null;
  height?: number | null;
  weight?: number | null;
  allergies?: string | null;
  chronic_diseases?: string | null;
  medications?: string | null;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  created_at: string;
  is_active: boolean;
  medical_profile?: MedicalProfile;
  subscription?: SubscriptionResponse;
}

export interface UserUpdate {
  name?: string;
  avatar?: string;
  medical_profile?: MedicalProfile;
}

// API URLs
const API_URL = 'https://backend.doctus.chat';

// Use direct backend URL for browser requests
// WARNING: Requires backend CORS configuration
const BROWSER_API_URL = API_URL; // <- Always use direct URL

// For direct server assets like images
const SERVER_URL = API_URL;

// Helper to get full URL for backend resources
export const getBackendUrl = (path: string) => {
  if (path?.startsWith('http')) return path;
  
  // For other API requests, use the backend URL directly
  if (path?.startsWith('/')) {
    return `${SERVER_URL}${path}`;
  } else {
    return `${SERVER_URL}/${path}`;
  }
};

// Класс для работы с API
export class ApiClient {
  static async get(url: string, options: RequestInit = {}) {
    return this.request(url, {
      method: 'GET',
      ...options,
    });
  }

  static async post(url: string, data: any, options: RequestInit = {}) {
    return this.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
  }

  static async put(url: string, data: any, options: RequestInit = {}) {
    return this.request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
  }

  static async delete(url: string, options: RequestInit = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...options,
    });
  }

  static async request(url: string, options: RequestInit = {}) {
    // Формируем заголовки для запроса
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Получаем токен из localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    // Если это FormData, не устанавливаем content-type, чтобы браузер сам добавил boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    // Проверяем, не является ли URL полным путем
    const isFullUrl = url.startsWith('http://') || url.startsWith('https://');
    
    // Используем прямой URL к бэкенду для клиентских запросов
    // или прямой URL если он полный
    const apiUrlToUse = isFullUrl ? url : `${BROWSER_API_URL}${url}`;
    
    try {
      console.log(`Making API request to: ${apiUrlToUse}`);
      
      // Выполняем запрос напрямую к API
      const response = await fetch(apiUrlToUse, {
        ...options,
        headers,
        mode: 'cors', // Явно указываем режим CORS для прямых запросов к бэкенду
      });

      // Обрабатываем ошибки
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Произошла ошибка' }));
        console.error('API Error:', error);
        
        // Форматируем детали ошибки для лучшего отображения
        let errorMessage = 'Произошла ошибка при запросе к API';
        
        if (error.detail) {
          if (Array.isArray(error.detail)) {
            // Если ошибка - массив сообщений, объединяем их
            errorMessage = error.detail.map((err: unknown) => {
              if (typeof err === 'object') {
                return JSON.stringify(err);
              }
              return err;
            }).join(', ');
          } else {
            // Иначе используем строку
            errorMessage = error.detail;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Возвращаем результат
      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Не удалось соединиться с сервером. Пожалуйста, проверьте подключение к интернету или обратитесь к администратору.');
      }
      throw error;
    }
  }
}

// User-related functions
export async function getUserProfile(userId: number): Promise<UserProfile> {
  // Прямой запрос к бэкенду без промежуточного API роута
  console.log(`Fetching user profile from ${API_URL}/users/${userId}`);
  return ApiClient.get(`/users/${userId}`);
}

export async function updateUserProfile(userId: number, userData: UserUpdate): Promise<UserProfile> {
  // Прямой запрос к бэкенду без промежуточного API роута
  console.log(`Updating user profile at ${API_URL}/users/${userId} with data:`, userData);
  return ApiClient.put(`/users/${userId}`, userData);
}

export async function uploadFile(file: File, folder: string = ''): Promise<{url: string}> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }
  // Используем относительный путь, ApiClient добавит API_URL
  return ApiClient.request('/api/upload', {
    method: 'POST',
    body: formData
  });
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export async function changePassword(passwordData: PasswordChangeData): Promise<{message: string}> {
  console.log('Changing password with data:', { ...passwordData, current_password: '***', new_password: '***' });
  return ApiClient.post('/auth/change-password', passwordData);
}

// Subscription interfaces
export interface PlanResponse {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
  doctors_limit: number;
  is_recommended: boolean;
  trial_days: number;
}

// Strapi Plan interfaces
export interface StrapiPlan {
  id: number;
  documentId: string;
  name: string;
  price: number;
  valid_days: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  benefits: string;
  price_3m: number | null;
  price_6m: number | null;
  price_12m: number | null;
}

export interface StrapiPlansResponse {
  data: StrapiPlan[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

export interface SubscriptionResponse {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  plan: PlanResponse;
}

export interface SubscriptionCreate {
  plan_id: number;
}

// Subscription functions
export async function getPlans(): Promise<PlanResponse[]> {
  try {
    // Используем прямой URL к бэкенду через ApiClient
    console.log(`Fetching plans from: ${API_URL}/public/plans`);
    return await ApiClient.get('/public/plans');
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

// Get plans from our backend API
export async function getStrapiPlans(): Promise<StrapiPlansResponse> {
  try {
    // Use our backend API instead of Strapi
    const plans = await ApiClient.get('/public/plans');
    
    // Transform PlanResponse to StrapiPlan format for frontend compatibility
    const transformedPlans = plans.map((plan: any) => ({
      id: plan.id,
      documentId: plan.id.toString(),
      name: plan.name,
      price: plan.price,
      valid_days: plan.valid_days,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      benefits: plan.benefits,
      price_3m: plan.price_3m,
      price_6m: plan.price_6m,
      price_12m: plan.price_12m
    }));
    
    // Return in the same format as Strapi API response
    return {
      data: transformedPlans,
      meta: {
        pagination: {
          page: 1,
          pageSize: transformedPlans.length,
          pageCount: 1,
          total: transformedPlans.length
        }
      }
    };
  } catch (error) {
    console.error('Error fetching plans from backend:', error);
    throw new Error(`Error fetching plans: ${error}`);
  }
}

export async function getCurrentSubscription(): Promise<SubscriptionResponse> {
  return ApiClient.get('/subscriptions/current');
}

export async function subscribeToPlan(
  planId: number,
  strapiPlanId?: number,
  periodMonths: string = '1m'
): Promise<SubscriptionResponse> {
  // Преобразуем период из строки в число
  const periodMap: Record<string, number> = {
    '1m': 1,
    '3m': 3,
    '6m': 6,
    '12m': 12
  };
  
  const period_months = periodMap[periodMonths] || 1;
  
  return ApiClient.post('/plans/subscribe', { 
    plan_id: planId,
    // Здесь strapi_plan_id становится нашим planId, поскольку мы больше не используем Strapi
    // но сохраняем для совместимости с существующим кодом
    strapi_plan_id: planId,
    period_months
  });
}

export async function cancelSubscription(): Promise<SubscriptionResponse> {
  return ApiClient.delete('/subscriptions/cancel');
}

// Реальная имплементация отправки сообщений докторам
export async function sendMessage(doctorId: string | number, message: string, files: any[] = [], chatId?: number | null): Promise<Message> {
  try {
    console.log("Sending message to doctor, files:", files);
    
    // Создаем формат сообщения для отправки на сервер
    const messageData = {
      role: "user",
      content: message,
      files: files && Array.isArray(files) ? files.map(file => file?.id || file) : [] // Отправляем только ID файлов с проверкой на существование и тип
    };
    
    // Дополнительная проверка файлов для отладки
    if (files && files.length > 0) {
      console.log("Files being sent with message:", 
        files.map(file => ({
          id: file?.id || file,
          type: typeof file,
          details: file
        }))
      );
    }

    // Если chatId не передан, проверяем существует ли уже чат с этим доктором
    if (!chatId) {
      try {
        // Получаем список чатов
        const chats = await ApiClient.get('/chats');
        // Ищем чат с нужным доктором
        const existingChat = chats.find((chat: any) => chat.doctor_id.toString() === doctorId.toString());
        if (existingChat) {
          chatId = existingChat.id;
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        // Продолжаем выполнение, используя прямой эндпоинт к доктору
      }
    }

    // Используем StreamingResponse для получения потокового ответа
    let streamUrl: string;
    
    if (chatId) {
      // Если нашли существующий чат или передали chatId, используем его ID
      streamUrl = `${API_URL}/chats/${chatId}/messages/stream`;
    } else {
      // Иначе используем прямой эндпоинт к доктору
      streamUrl = `${API_URL}/chats/doctor/${doctorId}/messages/stream`;
    }
    
    // Создаем ID для нового сообщения (для фронтенда)
    const messageId = crypto.randomUUID();
    
    // Специальное исключение для доктора "Расшифровка" (ID 20)
    const isDecodeDoctor = doctorId.toString() === '20';
    
    // Настраиваем заголовки в зависимости от доктора
    // Для доктора "Расшифровка" не требуем авторизации
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Получаем токен авторизации из localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Добавляем токен авторизации, если он есть
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    } else if (!isDecodeDoctor) {
      // Для всех докторов кроме "Расшифровка" требуется авторизация
      throw new Error("Требуется авторизация для отправки сообщений");
    }

    // Отправляем запрос и обрабатываем настоящий StreamingResponse
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server response error: ${response.status}`, errorText);
      throw new Error(`Error sending message: ${response.status}`);
    }

    // Создаем объект сообщения, который будем обновлять по мере получения данных
    const streamingMessage: Message = {
      id: messageId,
      role: "assistant",
      content: "", // Начинаем с пустого содержимого, которое будем постепенно заполнять
      timestamp: new Date(),
      isStreaming: true, // Специальный флаг для обозначения, что сообщение в процессе стриминга
    };

    // Создаем читатель для обработки потокового ответа
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Не удалось создать reader для потокового ответа");
    }

    // Запускаем отдельный процесс для чтения потока
    // Но сразу возвращаем объект сообщения, чтобы UI мог его отобразить
    (async () => {
      try {
        const decoder = new TextDecoder();
        let done = false;
        let fullResponse = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            
            // Разделяем входящий текст целыми предложениями или частями
            fullResponse += chunk;
            
            // Отправляем событие с обновленным текстом
            const updateEvent = new CustomEvent('chat-message-update', {
              detail: {
                id: messageId,
                content: fullResponse
              }
            });
            window.dispatchEvent(updateEvent);
            
            // Короткая задержка для более естественного эффекта 
            await new Promise(resolve => setTimeout(resolve, 30));
          }
        }

        // Когда стриминг закончен, отправляем финальное событие
        const finalEvent = new CustomEvent('chat-message-complete', {
          detail: {
            id: messageId,
            content: fullResponse,
            isStreaming: false
          }
        });
        window.dispatchEvent(finalEvent);

      } catch (error) {
        console.error("Error processing stream:", error);
        
        // Отправляем событие об ошибке
        const errorEvent = new CustomEvent('chat-message-error', {
          detail: {
            id: messageId,
            error: error instanceof Error ? error.message : 'Ошибка при получении ответа'
          }
        });
        window.dispatchEvent(errorEvent);
      }
    })();

    return streamingMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    
    // В случае ошибки возвращаем сообщение об ошибке
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Произошла ошибка при отправке сообщения: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

// Функция для получения списка докторов из API
export async function getDoctors() {
  try {
    // Используем прямой URL к бэкенду через ApiClient
    console.log(`Fetching doctors from: ${API_URL}/public/doctors`);
    const data = await ApiClient.get('/public/doctors');
    
    console.log('Doctors data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - check if the backend server is running and accessible');
    }
    // Возвращаем пустой массив в случае ошибки, чтобы избежать краша UI
    return [];
  }
}

export async function getDoctorBySlug(slug: string) {
  try {
    // Используем прямой URL к бэкенду через ApiClient
    console.log(`Fetching doctor by slug from: ${API_URL}/doctors/public/by-slug/${slug}`);
    return await ApiClient.get(`/doctors/public/by-slug/${slug}`);
  } catch (error) {
    console.error('Error fetching doctor by slug:', error);
    throw error;
  }
}

// Загрузка чатов пользователя
export async function getUserChats() {
  try {
    // Проверяем наличие токена перед запросом
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!storedToken) {
      console.warn('Auth token not found, unable to fetch chats');
      return [];
    }
    
    return await ApiClient.get('/chats');
  } catch (error) {
    console.error('Error fetching user chats:', error);
    // Возвращаем пустой массив вместо ошибки, чтобы не прерывать цепочку выполнения
    return [];
  }
}

// Загрузка сообщений для конкретного чата
export async function getChatMessages(chatId: number, skip: number = 0, limit: number = 100) {
  try {
    // Проверяем наличие токена перед запросом
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!storedToken) {
      console.warn('Auth token not found, unable to fetch chat messages');
      return [];
    }
    
    return await ApiClient.get(`/chats/${chatId}/messages?skip=${skip}&limit=${limit}`);
  } catch (error) {
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    // Возвращаем пустой массив вместо ошибки, чтобы не прерывать цепочку выполнения
    return [];
  }
}

// Создание нового чата с доктором
export async function createChat(doctorId: number) {
  try {
    console.log(`Creating chat with doctor ID ${doctorId}`);
    
    // Специальное исключение для доктора "Расшифровка" (ID 20)
    const isDecodeDoctor = doctorId === 20;
    
    // Получаем токен авторизации из localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Для неавторизованной работы с доктором Расшифровка
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Добавляем токен авторизации, если он есть
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    } else if (!isDecodeDoctor) {
      // Для всех докторов кроме "Расшифровка" требуется авторизация
      throw new Error("Требуется авторизация для создания чата");
    }
    
    // Прямой запрос без использования ApiClient для обхода проверки авторизации
    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ doctor_id: doctorId }),
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server response error: ${response.status}`, errorText);
      throw new Error(`Error creating chat: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`Chat created successfully: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`Error creating chat with doctor ${doctorId}:`, error);
    throw error;
  }
}

// Загрузка файлов для чата
export async function uploadChatFiles(chatId: number, files: File[], fileType: 'image' | 'document' = 'image') {
  try {
    console.log("DEBUG: Uploading files to chat", {
      chatId,
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      fileTypes: files.map(f => f.type),
      fileExtensions: files.map(f => f.name.split('.').pop()?.toLowerCase()),
      fileType: fileType,
      fileSizes: files.map(f => f.size)
    });
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('file_type', fileType);
    
    // Add a timestamp to prevent caching
    formData.append('_t', Date.now().toString());
    
    // Для неавторизованной работы с файлами
    const headers: Record<string, string> = {
      // Не добавляем Content-Type, чтобы браузер сам сформировал с boundary
    };
    
    // Получаем токен авторизации из localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Добавляем токен авторизации, если он есть
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    
    // Прямой запрос без использования ApiClient для обхода проверки авторизации
    const response = await fetch(`${API_URL}/chats/${chatId}/files`, {
      method: 'POST',
      headers,
      body: formData,
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server response error: ${response.status}`, errorText);
      throw new Error(`Error uploading files: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("DEBUG: Files uploaded successfully", result);
    return result;
  } catch (error) {
    console.error(`Error uploading files to chat ${chatId}:`, error);
    throw error;
  }
}

// Анализ файла с извлечением текста и векторным представлением
export async function analyzeFile(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log("DEBUG: Analyzing file:", {
      fileName: file.name,
      fileType: file.type,
      fileExtension: file.name.split('.').pop()?.toLowerCase(),
      fileSize: file.size
    });
    
    // Для неавторизованной работы с файлами
    const headers: Record<string, string> = {
      // Не добавляем Content-Type, чтобы браузер сам сформировал с boundary
    };
    
    // Получаем токен авторизации из localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Добавляем токен авторизации, если он есть
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    
    // Прямой запрос без использования ApiClient для обхода проверки авторизации
    const response = await fetch(`${API_URL}/files/analyze`, {
      method: 'POST',
      headers,
      body: formData,
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server response error: ${response.status}`, errorText);
      throw new Error(`Error analyzing file: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("DEBUG: File analyzed successfully:", result);
    return result;
  } catch (error) {
    console.error(`Error analyzing file:`, error);
    throw error;
  }
}

// Анализ нескольких файлов
export async function analyzeMultipleFiles(files: File[]) {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    console.log("DEBUG: Analyzing files:", {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      fileTypes: files.map(f => f.type),
      fileExtensions: files.map(f => f.name.split('.').pop()?.toLowerCase()),
      fileSizes: files.map(f => f.size)
    });
    
    // Специальное исключение для доктора "Расшифровка" (ID 20)
    // Для неавторизованной работы с файлами
    const headers: Record<string, string> = {
      // Не добавляем Content-Type, чтобы браузер сам сформировал с boundary
    };
    
    // Получаем токен авторизации из localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Добавляем токен авторизации, если он есть
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    
    // Прямой запрос без использования ApiClient для обхода проверки авторизации
    const response = await fetch(`${API_URL}/files/bulk-analyze`, {
      method: 'POST',
      headers,
      body: formData,
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server response error: ${response.status}`, errorText);
      throw new Error(`Error analyzing files: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("DEBUG: Files analyzed successfully:", result);
    return result;
  } catch (error) {
    console.error(`Error analyzing multiple files:`, error);
    throw error;
  }
}

// Очистка истории чата
export async function clearChatHistory(chatId: number) {
  try {
    return await ApiClient.delete(`/chats/${chatId}`);
  } catch (error) {
    console.error(`Error clearing chat history:`, error);
    throw error;
  }
}

// Экспорт чата в PDF
export async function exportChatToPDF(chatContainer: HTMLElement, doctorName: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      html2canvas(chatContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add more pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Add metadata
        pdf.setProperties({
          title: `Чат с ${doctorName}`,
          subject: 'Медицинская консультация',
          creator: 'ВопросДоктору',
          author: 'ВопросДоктору'
        });
        
        // Save the PDF
        pdf.save(`Чат с ${doctorName}.pdf`);
        resolve();
      });
    } catch (error) {
      console.error('Error exporting chat to PDF:', error);
      reject(error);
    }
  });
}

// Семантический поиск по файлам
export async function searchFiles(query: string, limit: number = 5) {
  try {
    return await ApiClient.get(`/files/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  } catch (error) {
    console.error(`Error searching files:`, error);
    throw error;
  }
}

// Семантический поиск в векторной БД
export async function searchVectorDB(query: string, limit: number = 5) {
  try {
    return await ApiClient.get(`/files/vector-search?query=${encodeURIComponent(query)}&limit=${limit}`);
  } catch (error) {
    console.error(`Error searching vector DB:`, error);
    throw error;
  }
}

export interface PaymentCreate {
  plan_id: number;
  period_months: number;
}

export interface PaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  confirmation_url: string;
  created_at: string;
  db_payment_id: number;
}

export async function createPayment(planId: number, periodMonths: number): Promise<PaymentResponse> {
  return ApiClient.post('/payments/create', { 
    plan_id: planId,
    period_months: periodMonths
  });
}