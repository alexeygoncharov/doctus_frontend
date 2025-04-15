import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { openDB, type IDBPDatabase } from 'idb'

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
 * Конвертирует HEIC изображение в JPEG
 */
async function convertHeicToJpeg(blob: Blob): Promise<Blob> {
  // Динамический импорт heic2any
  const heic2any = (await import('heic2any')).default;
  try {
    const convertedBlob = await heic2any({
      blob,
      toType: "image/jpeg",
      quality: 0.8
    });
    return convertedBlob as Blob;
  } catch (error) {
    console.error('Ошибка конвертации HEIC в JPEG:', error);
    throw error;
  }
}

/**
 * Сохраняет данные в IndexedDB (используя idb)
 */
export async function saveToIndexedDB(storeName: string, key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return; // SSR check
  
  // Используем УНИФИЦИРОВАННОЕ имя базы данных 'imageCache'
  const db = await openDB('imageCache', 1, {
    upgrade(db: IDBPDatabase) {
      // Создаем хранилище, только если оно еще не существует
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    },
  });

  await db.put(storeName, value, key);
}

/**
 * Получает кэшированные данные изображения из IndexedDB (переписано с использованием idb)
 */
export async function getCachedImageData(imageUrl: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    // Используем УНИФИЦИРОВАННОЕ имя базы данных 'imageCache' и то же имя хранилища 'images'
    const db = await openDB('imageCache', 1, {
      upgrade(db: IDBPDatabase) {
        // Убедимся, что хранилище создается при необходимости
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images');
        }
      },
    });

    // Получаем данные из хранилища 'images'
    const cachedData = await db.get('images', imageUrl); // Используем imageUrl как ключ
    
    return cachedData || null;

  } catch (error) {
    console.error('Ошибка при получении данных из IndexedDB:', error);
    return null;
  }
}

/**
 * Кэширует изображение в IndexedDB (используя idb)
 */
export async function cacheImageData(url: string, blob: Blob): Promise<string> {
  if (typeof window === 'undefined') return URL.createObjectURL(blob); // SSR guard
  
  try {
    // Используем ArrayBuffer для более надежного хранения
    const buffer = await blob.arrayBuffer();
    
    const db = await openDB('imageCache', 1, {
      upgrade(db: IDBPDatabase) {
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images');
        }
      },
    });
    
    // Сохраняем ArrayBuffer в хранилище 'images'
    await db.put('images', buffer, url); // Используем url как ключ
    
    // Создаем Object URL из оригинального blob для немедленного использования
    const objectURL = URL.createObjectURL(blob); 
    return objectURL;

  } catch (error) {
    console.error('Ошибка при кэшировании изображения в IndexedDB:', error);
    // Возвращаем прямой URL даже если кэширование не удалось
    return URL.createObjectURL(blob); 
  }
}
