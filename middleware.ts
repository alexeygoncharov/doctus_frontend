import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Защищенные маршруты, требующие авторизации
const protectedRoutes = ['/settings'];

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  // Получаем токен из кук
  const token = request.cookies.get('auth_token')?.value;

  // Если путь защищенный и токен отсутствует, перенаправляем на страницу входа
  if (protectedRoutes.some(route => currentPath.startsWith(route)) && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', currentPath);
    return NextResponse.redirect(url);
  }

  // Если пользователь авторизован и пытается открыть страницу входа или регистрации,
  // перенаправляем на главную страницу
  if (token && (
    currentPath.startsWith('/auth/login') ||
    currentPath.startsWith('/auth/register')
  )) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Настройка на какие пути будет применяться middleware
export const config = {
  matcher: [
    '/settings/:path*',
    '/auth/login',
    '/auth/register'
  ],
};