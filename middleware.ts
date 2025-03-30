import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Защищенные маршруты, требующие авторизации
const protectedRoutes = ['/settings'];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-for-dev',
  });

  // Если путь защищенный и токен отсутствует, перенаправляем на страницу входа
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route)) && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Если пользователь авторизован и пытается открыть страницу входа или регистрации,
  // перенаправляем на главную страницу
  if (token && (
    request.nextUrl.pathname.startsWith('/auth/login') || 
    request.nextUrl.pathname.startsWith('/auth/register')
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