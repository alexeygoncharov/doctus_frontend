import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// Define paths that require authentication
const protectedPaths = ['/settings', '/analysis', '/plans']; // Add other paths as needed

// Define paths that should redirect authenticated users away
const authPaths = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Создаем новый URL для перенаправления, чтобы избежать проблем в Vercel
  const url = request.nextUrl.clone();

  // Get the NextAuth token
  const token = await getToken({ req: request, secret: secret });
  const isAuthenticated = !!token;

  // Log current path and auth status
  console.log(`Middleware executing for path: ${pathname}, isAuthenticated: ${isAuthenticated}`);

  // Check if the current path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Check if the current path is an authentication page (login/register)
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Redirect unauthenticated users trying to access protected paths
  if (isProtectedPath && !isAuthenticated) {
    console.log(`Middleware: Unauthenticated access to ${pathname}, redirecting to login.`);
    url.pathname = '/auth/login';
    url.search = `?returnUrl=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users trying to access login/register pages
  if (isAuthPath && isAuthenticated) {
    // Извлекаем returnUrl из запроса
    const returnUrl = request.nextUrl.searchParams.get('returnUrl');
    
    console.log(`Middleware: Authenticated access to ${pathname}, returnUrl=${returnUrl}`);
    
    // Если есть returnUrl и он начинается с /, перенаправляем на него
    if (returnUrl && returnUrl.startsWith('/')) {
      console.log(`Middleware: Redirecting to returnUrl: ${returnUrl}`);
      url.pathname = returnUrl;
      url.search = '';
      return NextResponse.redirect(url);
    }
    
    // Иначе перенаправляем на домашнюю страницу
    console.log(`Middleware: Redirecting to home page`);
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Allow the request to proceed if none of the above conditions are met
  console.log(`Middleware: Allowing request to proceed to ${pathname}`);
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply middleware to all protected paths and auth paths
    '/settings/:path*',
    '/analysis/:path*',
    '/plans/:path*',
    '/auth/login',
    '/auth/register',
    // Add root ('/') if you want to redirect logged-in users from the landing page
    // '/,'
  ],
};
