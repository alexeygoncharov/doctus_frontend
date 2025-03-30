import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Деактивируем парсинг body от Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Убедимся, что директория существует
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating upload directory:', error);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем авторизацию
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Подготавливаем опции для formidable
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        const uniqueId = uuidv4();
        return `${uniqueId}${ext}`;
      },
    });

    // Парсим форму
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Получаем информацию о загруженном файле
    const file = files.file?.[0] || null;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Формируем URL для клиента
    const fileUrl = `/uploads/${path.basename(file.filepath)}`;

    // Отправляем URL клиенту
    res.status(200).json({ url: fileUrl });

    // Здесь в реальном приложении вы бы отправили запрос к основному API
    // для сохранения информации о файле в базе данных
    // Например:
    // await fetch('http://localhost:8000/upload/file', { ... });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}