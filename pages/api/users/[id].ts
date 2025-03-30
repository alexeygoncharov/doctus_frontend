import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем авторизацию
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  
  // Адрес бэкенда
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  
  if (req.method === 'GET') {
    try {
      // Запрос к бэкенду
      // Добавляем проверку и логирование для отладки
      console.log('Fetching user data from backend:', `${backendUrl}/users/${id}`);
      console.log('Token:', token);
      
      const response = await fetch(`${backendUrl}/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token.accessToken || token.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch user data');
      }
      
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch user data' });
    }
  } 
  else if (req.method === 'PUT') {
    try {
      // Запрос к бэкенду
      console.log('Updating user data on backend:', `${backendUrl}/users/${id}`);
      console.log('Update data:', req.body);
      
      const response = await fetch(`${backendUrl}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.accessToken || token.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update user data');
      }
      
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: error.message || 'Failed to update user data' });
    }
  }
  else {
    // Если метод запроса не поддерживается
    return res.status(405).json({ error: 'Method not allowed' });
  }
}