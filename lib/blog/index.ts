export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  author_id?: number;
}

export interface BlogResponse {
  data: BlogPost[];
}

export async function getBlogPosts(): Promise<BlogResponse> {
  const response = await fetch('/api/blog', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching blog posts: ${response.statusText}`);
  }
  
  const posts = await response.json();
  return { data: posts };
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`/api/blog/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching blog post: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Русские названия месяцев
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

// Helper function to get image URL with fallback
export function getImageUrl(post: BlogPost): string {
  if (!post.image_url) {
    return '/images/post-placeholder.jpg'; // Default fallback image
  }
  
  // Handle backend URLs using our proxy to prevent 404s
  if (post.image_url.startsWith('/uploads/')) {
    return `/api${post.image_url}`;
  }
  
  return post.image_url;
}

// Функция для получения URL изображения с параметрами размера
export function getResponsiveImageUrl(post: BlogPost, width?: number, height?: number, quality?: number): string {
  const baseUrl = getImageUrl(post);
  
  // Если параметры не указаны или URL не содержит /uploads/, возвращаем базовый URL
  if ((!width && !height) || !baseUrl.includes('/uploads/')) {
    return baseUrl;
  }
  
  // Добавляем параметры к URL
  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  if (quality) params.append('quality', quality.toString());
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${params.toString()}`;
}

// Helper function to get post content as plain text
export function getPostContent(post: BlogPost): string {
  return post.content;
}

// Helper function to get a short excerpt from the post content
export function getPostExcerpt(post: BlogPost, maxLength = 120): string {
  if (post.summary) {
    return post.summary;
  }
  
  const content = getPostContent(post);
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
}