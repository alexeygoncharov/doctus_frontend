import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log(`Fetching blog posts from: ${apiUrl}/blog/`);
    
    const response = await fetch(`${apiUrl}/blog/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Добавляем таймаут для запроса
      signal: AbortSignal.timeout(10000), // 10 секунд таймаут
    }).catch(error => {
      console.error(`Fetch error: ${error.message}`);
      throw new Error(`Не удалось подключиться к серверу: ${error.message}`);
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Не удалось получить текст ошибки');
      console.error(`API error: ${response.status} ${response.statusText}, Body: ${errorText}`);
      throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json().catch(error => {
      console.error(`JSON parse error: ${error.message}`);
      throw new Error('Не удалось обработать ответ сервера');
    });
    
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error in /api/blog:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
      error: String(error) 
    });
  }
} 