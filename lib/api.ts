import { Message } from "./types";
import { Doctor } from "./doctors";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getSession } from 'next-auth/react'; // Import getSession

// User interfaces (keep as is)
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
  id: number | string; // Can be number or string
  name?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role?: string;
  created_at?: string;
  is_active?: boolean;
  medical_profile?: MedicalProfile;
  subscription?: SubscriptionResponse;
}

export interface UserUpdate {
  name?: string;
  avatar?: string;
  medical_profile?: MedicalProfile;
}

// API URLs
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.doctus.chat';

// Use direct backend URL for browser requests
const BROWSER_API_URL = API_URL;

// For direct server assets like images
const SERVER_URL = API_URL;

// Helper to get full URL for backend resources
export const getBackendUrl = (path: string | null | undefined): string => {
  console.log('==== ОТЛАДКА getBackendUrl ====');
  console.log('Input path:', path);
  console.log('SERVER_URL:', SERVER_URL);
  
  if (!path) {
    console.log('Path is null or undefined, returning empty string');
    console.log('==== КОНЕЦ ОТЛАДКИ getBackendUrl ====');
    return ''; 
  }
  
  if (path.startsWith('http')) {
    console.log('Path already starts with http, returning as is');
    console.log('==== КОНЕЦ ОТЛАДКИ getBackendUrl ====');
    return path;
  }

  // Ensure path starts with a slash if it's relative
  const correctedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Add debug log to see what is happening with the URL construction
  const fullUrl = `${SERVER_URL}${correctedPath}`;
  console.log('Corrected path:', correctedPath);
  console.log('Full URL constructed:', fullUrl);
  console.log('==== КОНЕЦ ОТЛАДКИ getBackendUrl ====');
  
  return fullUrl;
};


// Класс для работы с API
export class ApiClient {

  // Helper function to get the current session's access token
  public static async getAuthToken(): Promise<string | null> {
    const session = await getSession();
    // Use type assertion if you extended the Session type
    return (session as any)?.accessToken || null;
  }

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

  // Central request method
  static async request(url: string, options: RequestInit = {}) {
    // Get token using NextAuth's getSession
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Set default Content-Type if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
       headers['Content-Type'] = 'application/json';
    }

    // Remove Content-Type if it's FormData (browser sets it with boundary)
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const isFullUrl = url.startsWith('http://') || url.startsWith('https://');
    const apiUrlToUse = isFullUrl ? url : `${BROWSER_API_URL}${url}`;

    try {
      console.log(`Making API request to: ${apiUrlToUse}`);
      // console.log("With headers:", headers); // Optional: Log headers for debugging

      const response = await fetch(apiUrlToUse, {
        ...options,
        headers,
        mode: 'cors', // Ensure CORS is enabled
      });

      if (!response.ok) {
         let errorBody: any = null;
         try {
             errorBody = await response.json();
             console.error('API Error Body:', errorBody);
         } catch (e) {
             // If response is not JSON, read as text
             const errorText = await response.text();
             console.error('API Error Text:', errorText);
             errorBody = { detail: errorText || `Request failed with status ${response.status}` };
         }

        // Extract detailed error message
        let errorMessage = 'API Request Failed';
        if (errorBody && errorBody.detail) {
          if (Array.isArray(errorBody.detail)) {
            errorMessage = errorBody.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
          } else {
            errorMessage = errorBody.detail;
          }
        } else {
            errorMessage = `HTTP error ${response.status}`;
        }

        // Special handling for 401 Unauthorized
        if (response.status === 401) {
            console.warn("API request unauthorized (401). Token might be invalid or expired.");
            errorMessage = "Not authenticated"; // Consistent error message
            // Optionally trigger sign-out or refresh token logic here if needed globally
            // import { signOut } from 'next-auth/react';
            // signOut();
        }

        throw new Error(errorMessage);
      }

      // Handle responses with no content (like 204 No Content)
      if (response.status === 204) {
        return null; // Or return an empty object/success indicator
      }

      // Assuming successful responses are JSON
      return response.json();

    } catch (error) {
      console.error('API Request Error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Не удалось соединиться с сервером. Проверьте подключение.');
      }
      // Re-throw the processed error or the original error
      throw error;
    }
  }
}

// --- User Functions (using updated ApiClient) ---

export async function getMyProfile(): Promise<UserProfile> {
  console.log(`Fetching current user profile from ${API_URL}/auth/me`);
  // Assuming /auth/me returns the UserProfile structure
  return ApiClient.get('/auth/me');
}

// Keep this if you need to get profile by specific ID (e.g., admin functionality)
export async function getUserProfile(userId: string | number): Promise<UserProfile> {
  console.log(`Fetching user profile for ID ${userId} from ${API_URL}/users/${userId}`);
  return ApiClient.get(`/users/${userId}`);
}


export async function updateUserProfile(userId: string | number, userData: UserUpdate): Promise<UserProfile> {
  console.log(`Updating user profile for ID ${userId} at ${API_URL}/users/${userId}`);
  return ApiClient.put(`/users/${userId}`, userData);
}

// --- File Upload (No auth token needed based on previous logic? Double-check backend requirements) ---
// Assuming /api/upload is a NEXTJS api route, not direct backend
// If it's direct backend, ApiClient.request will now add token if available.
// If it SHOULDN'T have a token, adjust ApiClient.request or call fetch directly.
export async function uploadFile(file: File, folder: string = ''): Promise<{url: string}> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }
  // This now uses ApiClient.request, which includes the token
  // Check if /files/upload requires authentication on your backend
  return ApiClient.request('/files/upload', { // Changed endpoint based on your backend structure
    method: 'POST',
    body: formData
  });
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export async function changePassword(passwordData: PasswordChangeData): Promise<{message: string}> {
  console.log('Changing password...');
  // This uses ApiClient.post, which includes the token
  return ApiClient.post('/auth/change-password', passwordData);
}

// --- Subscription Interfaces (keep as is) ---
export interface PlanResponse { id: number; name: string; description: string; type: string; price: number; doctors_limit: number; is_recommended: boolean; trial_days: number; benefits: string; price_3m: number | null; price_6m: number | null; price_12m: number | null; valid_days: number | null; }
export interface StrapiPlan { id: number; documentId: string; name: string; price: number; valid_days: number | null; createdAt: string; updatedAt: string; publishedAt: string; benefits: string; price_3m: number | null; price_6m: number | null; price_12m: number | null; }
export interface StrapiPlansResponse { data: StrapiPlan[]; meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number; } } }
export interface SubscriptionResponse { id: number; user_id: number; plan_id: number; start_date: string; end_date: string; is_active: boolean; plan: PlanResponse; }
export interface SubscriptionCreate { plan_id: number; }

// --- Subscription Functions (using updated ApiClient) ---

// Public plans endpoint - Should not require authentication
export async function getPlans(): Promise<PlanResponse[]> {
  try {
    console.log(`Fetching plans from: ${API_URL}/public/plans`);
    // Use fetch directly to avoid sending auth token for public endpoint
    const response = await fetch(`${API_URL}/public/plans`);
    if (!response.ok) {
        throw new Error(`Failed to fetch public plans: ${response.status}`);
    }
    return response.json();
    // If ApiClient should handle public/private automatically, refactor needed
    // return await ApiClient.get('/public/plans'); // This would send token if logged in
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

// Keep this transformation logic if frontend relies on StrapiPlan structure
export async function getStrapiPlans(): Promise<StrapiPlansResponse> {
  try {
    const plans = await getPlans(); // Use the updated getPlans
    const transformedPlans = plans.map((plan: PlanResponse): StrapiPlan => ({
      id: plan.id,
      documentId: plan.id.toString(),
      name: plan.name,
      price: plan.price,
      valid_days: plan.valid_days ?? null,
      createdAt: new Date().toISOString(), // Placeholder date
      updatedAt: new Date().toISOString(), // Placeholder date
      publishedAt: new Date().toISOString(), // Placeholder date
      benefits: plan.benefits ?? '',
      price_3m: plan.price_3m ?? null,
      price_6m: plan.price_6m ?? null,
      price_12m: plan.price_12m ?? null,
    }));
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
    console.error('Error fetching/transforming plans:', error);
    throw new Error(`Error fetching plans: ${error}`);
  }
}

// Authenticated endpoint
export async function getCurrentSubscription(): Promise<SubscriptionResponse | null> { // Allow null return
  try {
      return await ApiClient.get('/subscriptions/current');
  } catch (error) {
      if (error instanceof Error && error.message === 'Not authenticated') {
          console.log('No active session or subscription not found (401).');
          return null; // Return null instead of throwing for 401
      }
      if (error instanceof Error && error.message.includes('404')) { // Handle 404 if backend returns that for no subscription
          console.log('No active subscription found (404).');
          return null;
      }
      console.error('Error fetching current subscription:', error);
      throw error; // Re-throw other errors
  }
}

// Authenticated endpoint
export async function subscribeToPlan(
  planId: number,
  strapiPlanId?: number, // Keep for compatibility if needed
  periodMonths: string = '1m'
): Promise<SubscriptionResponse> {
  const periodMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
  const period_months = periodMap[periodMonths] || 1;

  return ApiClient.post('/plans/subscribe', {
    plan_id: planId,
    strapi_plan_id: strapiPlanId || planId, // Use planId as fallback
    period_months
  });
}

// Authenticated endpoint
export async function cancelSubscription(): Promise<SubscriptionResponse> {
  return ApiClient.delete('/subscriptions/cancel');
}

// --- Chat Functions (using updated ApiClient where appropriate) ---

// Needs careful review based on authentication requirements for doctor 20
export async function sendMessage(doctorId: string | number, message: string, files: any[] = [], chatId?: number | null): Promise<Message> {
  try {
    const messageData = {
      role: "user" as const,
      content: message,
      files: files?.map(file => file?.id || file).filter(id => id) ?? [] // Ensure only valid IDs
    };

    let effectiveChatId = chatId;
    if (!effectiveChatId) {
      try {
        const chats = await ApiClient.get('/chats'); // Requires auth
        const existingChat = chats.find((chat: any) => chat.doctor_id.toString() === doctorId.toString());
        if (existingChat) {
          effectiveChatId = existingChat.id;
        }
      } catch (error) {
        console.error("Error fetching chats (might be expected if not logged in):", error);
        // Proceed without chatId if fetching fails (e.g., for doctor 20)
      }
    }

    const streamUrl = effectiveChatId
      ? `${API_URL}/chats/${effectiveChatId}/messages/stream`
      : `${API_URL}/chats/doctor/${doctorId}/messages/stream`;

    const messageId = crypto.randomUUID();
    const isDecodeDoctor = doctorId.toString() === '20';
    const token = await ApiClient.getAuthToken(); // Get token using the helper

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream' // Important for SSE
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (!isDecodeDoctor) {
      throw new Error("Требуется авторизация для отправки сообщений этому доктору.");
    }

    // Use fetch directly for streaming response handling
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(messageData),
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error sending message: ${response.status} - ${errorText}`);
    }

    const streamingMessage: Message = {
      id: messageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Не удалось получить reader для потока.");

    // Process stream in background, return initial message object immediately
    (async () => {
        const decoder = new TextDecoder();
        let done = false;
        let fullResponse = "";
        try {
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    fullResponse += chunk;
                    // Dispatch update event
                    window.dispatchEvent(new CustomEvent('chat-message-update', {
                        detail: { id: messageId, content: fullResponse }
                    }));
                    await new Promise(resolve => setTimeout(resolve, 30)); // Small delay
                }
            }
            // Dispatch final event
            window.dispatchEvent(new CustomEvent('chat-message-complete', {
                detail: { id: messageId, content: fullResponse, isStreaming: false }
            }));
        } catch (error) {
             console.error("Error processing stream:", error);
             window.dispatchEvent(new CustomEvent('chat-message-error', {
                 detail: { id: messageId, error: error instanceof Error ? error.message : 'Ошибка обработки потока' }
             }));
        }
    })();

    return streamingMessage;

  } catch (error) {
    console.error("Error in sendMessage:", error);
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Ошибка: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

// Public endpoint - Should not require authentication
export async function getDoctors() {
  try {
    console.log(`Fetching doctors from: ${API_URL}/public/doctors`);
    // Use fetch directly
    const response = await fetch(`${API_URL}/public/doctors`);
     if (!response.ok) {
        throw new Error(`Failed to fetch public doctors: ${response.status}`);
    }
    const data = await response.json();
    console.log('Doctors data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return []; // Return empty array on error
  }
}

// Public endpoint - Should not require authentication
export async function getDoctorBySlug(slug: string) {
  try {
    console.log(`Fetching doctor by slug from: ${API_URL}/doctors/public/by-slug/${slug}`);
    // Use fetch directly
    const response = await fetch(`${API_URL}/doctors/public/by-slug/${slug}`);
     if (!response.ok) {
        throw new Error(`Failed to fetch doctor by slug ${slug}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching doctor by slug:', error);
    throw error;
  }
}

// Authenticated endpoint
export async function getUserChats() {
  try {
    return await ApiClient.get('/chats');
  } catch (error) {
     if (error instanceof Error && error.message === 'Not authenticated') {
          console.log('Cannot fetch chats: User not authenticated.');
          return []; // Return empty array if not authenticated
      }
    console.error('Error fetching user chats:', error);
    return []; // Return empty array on other errors too
  }
}

// Authenticated endpoint
export async function getChatMessages(chatId: number, skip: number = 0, limit: number = 100) {
  try {
    return await ApiClient.get(`/chats/${chatId}/messages?skip=${skip}&limit=${limit}`);
  } catch (error) {
       if (error instanceof Error && error.message === 'Not authenticated') {
          console.log(`Cannot fetch messages for chat ${chatId}: User not authenticated.`);
          return []; // Return empty array if not authenticated
      }
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    return [];
  }
}

// Authenticated endpoint (except potentially for doctor 20)
export async function createChat(doctorId: number) {
  try {
    console.log(`Creating chat with doctor ID ${doctorId}`);
    const isDecodeDoctor = doctorId === 20;
    const token = await ApiClient.getAuthToken();

    if (!token && !isDecodeDoctor) {
        throw new Error("Требуется авторизация для создания этого чата.");
    }
    // Use ApiClient which will handle the token correctly
    return await ApiClient.post('/chats', { doctor_id: doctorId });

  } catch (error) {
    console.error(`Error creating chat with doctor ${doctorId}:`, error);
    throw error;
  }
}

// Authenticated endpoint
export async function uploadChatFiles(chatId: number, files: File[], fileType: 'image' | 'document' = 'image') {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('file_type', fileType);
    formData.append('_t', Date.now().toString());

    // Use ApiClient.request which handles token and FormData
    return await ApiClient.request(`/chats/${chatId}/files`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error(`Error uploading files to chat ${chatId}:`, error);
    throw error;
  }
}

// Analyze file (check if authentication is needed)
// Assuming /files/analyze requires authentication based on your backend
export async function analyzeFile(file: File): Promise<{ file_id: number; text_content: string; [key: string]: any }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    console.log("DEBUG: Analyzing file:", { fileName: file.name, fileSize: file.size });

    // Use ApiClient.request which handles token and FormData
    return await ApiClient.request('/files/analyze', {
        method: 'POST',
        body: formData
    });
  } catch (error) {
    console.error(`Error analyzing file:`, error);
    throw error;
  }
}

// Analyze multiple files (check if authentication is needed)
// Assuming /files/bulk-analyze requires authentication
export async function analyzeMultipleFiles(files: File[]): Promise<any[]> {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    console.log("DEBUG: Analyzing multiple files:", { fileCount: files.length });

    // Use ApiClient.request which handles token and FormData
    return await ApiClient.request('/files/bulk-analyze', {
        method: 'POST',
        body: formData
    });
  } catch (error) {
    console.error(`Error analyzing multiple files:`, error);
    throw error;
  }
}

// Authenticated endpoint
export async function clearChatHistory(chatId: number) {
  try {
    return await ApiClient.delete(`/chats/${chatId}`);
  } catch (error) {
    console.error(`Error clearing chat history for chat ${chatId}:`, error);
    throw error;
  }
}

// PDF Export (client-side, no API call needed)
export async function exportChatToPDF(chatContainer: HTMLElement, doctorName: string): Promise<void> {
   // Keep the existing implementation
   return new Promise<void>((resolve, reject) => {
     try {
       html2canvas(chatContainer, {
         scale: 1,
         useCORS: true,
         allowTaint: true,
         scrollY: -window.scrollY
       }).then(canvas => {
         const imgData = canvas.toDataURL('image/png');
         const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
         const imgWidth = 210; const pageHeight = 295;
         const imgHeight = (canvas.height * imgWidth) / canvas.width;
         let heightLeft = imgHeight; let position = 0;
         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
         heightLeft -= pageHeight;
         while (heightLeft > 0) {
           position = heightLeft - imgHeight;
           pdf.addPage();
           pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
           heightLeft -= pageHeight;
         }
         pdf.setProperties({ title: `Чат с ${doctorName}`, subject: 'Медицинская консультация', creator: 'Doctus', author: 'Doctus' });
         pdf.save(`Чат с ${doctorName}.pdf`);
         resolve();
       }).catch(reject); // Catch html2canvas errors
     } catch (error) {
       console.error('Error exporting chat to PDF:', error);
       reject(error);
     }
   });
}


// Authenticated endpoint
export async function searchFiles(query: string, limit: number = 5) {
  try {
    return await ApiClient.get(`/files/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  } catch (error) {
    console.error(`Error searching files:`, error);
    throw error;
  }
}

// Authenticated endpoint
export async function searchVectorDB(query: string, limit: number = 5) {
  try {
    return await ApiClient.get(`/files/vector-search?query=${encodeURIComponent(query)}&limit=${limit}`);
  } catch (error) {
    console.error(`Error searching vector DB:`, error);
    throw error;
  }
}

// --- Payment Interfaces (keep as is) ---
export interface PaymentCreate { plan_id: number; period_months: number; }
export interface PaymentResponse { id: string; status: string; amount: number; currency: string; description: string; confirmation_url: string; created_at: string; db_payment_id: number; }

// --- Payment Functions (using updated ApiClient) ---

// Authenticated endpoint
export async function createPayment(planId: number, periodMonths: number): Promise<PaymentResponse> {
  return ApiClient.post('/payments/create', {
    plan_id: planId,
    period_months: periodMonths
  });
}
