import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирует размер файла в читаемый формат (байты, КБ, МБ, ГБ)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Байт';

  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Форматирует дату в читаемый формат (ДД.ММ.ГГГГ)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Проверяем, что дата валидна
  if (isNaN(date.getTime())) {
    return 'Некорректная дата';
  }
  
  // Форматируем дату в формате "ДД.ММ.ГГГГ"
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Кэширует изображение в localStorage для обеспечения персистентности
 * @param imageUrl URL изображения для кэширования
 * @returns Промис с base64-представлением изображения или null в случае ошибки
 */
export async function cacheImageData(imageUrl: string): Promise<string | null> {
  if (typeof window === 'undefined') return null; // SSR check
  
  try {
    // Проверяем, есть ли уже в кэше
    const cacheKey = `image_cache:${imageUrl}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Если нет в кэше, загружаем и кэшируем
    // Сначала пробуем через API прокси
    let fetchUrl = imageUrl;
    if (imageUrl.startsWith('/uploads/')) {
      fetchUrl = `/api${imageUrl}`;
    }
    
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.error(`Не удалось загрузить изображение для кэширования: ${imageUrl}`);
      return null;
    }
    
    const blob = await response.blob();
    
    // Конвертируем blob в base64
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Сохраняем в localStorage с проверкой размера (лимит localStorage ~5MB)
        try {
          if (base64data.length < 4 * 1024 * 1024) { // Лимит ~4MB
            localStorage.setItem(cacheKey, base64data);
          }
          resolve(base64data);
        } catch (e) {
          console.warn('Не удалось кэшировать изображение в localStorage, возможно, из-за ограничений размера');
          resolve(base64data); // Всё равно возвращаем данные, даже если не можем кэшировать
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Ошибка кэширования изображения:', error);
    return null;
  }
}

/**
 * Получает кэшированные данные изображения из localStorage
 * @param imageUrl URL изображения для поиска в кэше
 * @returns Base64-представление изображения или null, если не найдено
 */
export function getCachedImageData(imageUrl: string): string | null {
  if (typeof window === 'undefined') return null; // SSR check
  
  const cacheKey = `image_cache:${imageUrl}`;
  return localStorage.getItem(cacheKey);
}
