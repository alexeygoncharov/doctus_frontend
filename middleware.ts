import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// Define paths that require authentication
const protectedPaths = ['/settings', '/analysis', '/plans']; // Add other paths as needed

// Define paths that should redirect authenticated users away
const authPaths = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Get the NextAuth token
  const token = await getToken({ req: request, secret: secret });
  const isAuthenticated = !!token;

  // Check if the current path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Check if the current path is an authentication page (login/register)
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Redirect unauthenticated users trying to access protected paths
  if (isProtectedPath && !isAuthenticated) {
    console.log(`Middleware: Unauthenticated access to ${pathname}, redirecting to login.`);
    const url = new URL('/auth/login', origin);
    url.searchParams.set('callbackUrl', pathname); // Pass the original path for redirection after login
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users trying to access login/register pages
  if (isAuthPath && isAuthenticated) {
    // Извлекаем callbackUrl из запроса, если он есть
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    
    console.log(`Middleware: Authenticated access to ${pathname}, callbackUrl=${callbackUrl}`);
    
    // Если есть callbackUrl и он начинается с /, перенаправляем на него
    // (только внутренние URL-ы начинающиеся с / для безопасности)
    if (callbackUrl && callbackUrl.startsWith('/')) {
      console.log(`Middleware: Redirecting to callbackUrl: ${callbackUrl}`);
      return NextResponse.redirect(new URL(callbackUrl, origin));
    }
    
    // Иначе перенаправляем на домашнюю страницу
    console.log(`Middleware: Redirecting to home page`);
    return NextResponse.redirect(new URL('/', origin));
  }

  // Allow the request to proceed if none of the above conditions are met
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
