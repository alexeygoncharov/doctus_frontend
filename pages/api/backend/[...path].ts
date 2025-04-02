import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.doctus.chat';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the path from the request
  const { path } = req.query;
  
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  // Build the backend path
  const backendPath = path.join('/');
  
  // Append query string if it exists
  const queryString = req.url?.split('?')[1];
  const fullUrl = `${API_URL}/${backendPath}${queryString ? `?${queryString}` : ''}`;
  
  // Log request details for debugging (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Проксирование запроса к: ${fullUrl}`);
    console.log(`Метод запроса: ${req.method}`);
  }
  
  try {
    // Получаем токен из NextAuth
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // Копируем все заголовки
    const headers: Record<string, string> = {};
    
    // Убираем host из заголовков, чтобы избежать конфликтов
    Object.keys(req.headers).forEach(key => {
      if (key !== 'host' && typeof req.headers[key] === 'string') {
        headers[key] = req.headers[key] as string;
      }
    });
    
    // Добавляем заголовок авторизации, если токен существует
    if (token?.access_token) {
      headers['Authorization'] = `Bearer ${token.access_token}`;
    } else if (req.cookies['auth_token']) {
      // Поддержка для старой системы аутентификации
      headers['Authorization'] = `Bearer ${req.cookies['auth_token']}`;
    }
    
    // Отладка заголовков только в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log('Заголовки прокси:', headers);
    }
    
    // Пересылаем запрос с телом, если применимо
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
      if (req.body) {
        if (typeof req.body === 'string') {
          body = req.body;
        } else {
          body = JSON.stringify(req.body);
        }
      }
    }
    
    // Делаем запрос к бэкенду
    const backendRes = await fetch(fullUrl, {
      method: req.method,
      headers,
      body,
    });
    
    // Обрабатываем ошибки API
    if (!backendRes.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Ошибка API бэкенда: ${backendRes.status} ${backendRes.statusText}`);
      }
      
      // Получаем детали ошибки, если доступны
      let errorText = await backendRes.text();
      
      try {
        // Пробуем разобрать как JSON, если возможно
        const errorJson = JSON.parse(errorText);
        return res.status(backendRes.status).json(errorJson);
      } catch {
        // Если не JSON, возвращаем как текст
        return res.status(backendRes.status).send(errorText);
      }
    }
    
    // Пересылаем тип содержимого
    const contentType = backendRes.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Получаем данные ответа
    if (contentType?.includes('application/json')) {
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    } else {
      const buffer = await backendRes.arrayBuffer();
      return res.status(backendRes.status).send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error('Ошибка при проксировании запроса:', error);
    return res.status(500).json({ 
      error: 'Ошибка при проксировании запроса к бэкенду',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      path: backendPath
    });
  }
}