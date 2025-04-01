/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
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
    ],
  },
  async rewrites() {
    // Получаем URL API из переменной окружения
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log(`Using API URL for rewrites: ${apiUrl}`);
    
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;