/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['backend.doctus.chat', 'localhost', 'wownice.org'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'wownice.org',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'backend.doctus.chat',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'backend.doctus.chat',
        pathname: '/avatars/**',
      },
    ],
  },
  async rewrites() {
    // Получаем URL API из переменной окружения
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend.doctus.chat';
    console.log(`Using API URL for rewrites: ${apiUrl}`);
    
    return [
      // Перенаправление запросов к бэкенду через прокси
      {
        source: '/api/backend/:path*',
        destination: `${apiUrl}/:path*`,
      },
      // Все запросы NextAuth API обрабатываются локально
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      }
    ];
  },
};

module.exports = nextConfig;