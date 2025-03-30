import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import VKProvider from "next-auth/providers/vk";
import YandexProvider from "next-auth/providers/yandex";
import CredentialsProvider from "next-auth/providers/credentials";

// API endpoints
const API_URL = 'http://localhost:8000';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    VKProvider({
      clientId: process.env.VK_CLIENT_ID || "",
      clientSecret: process.env.VK_CLIENT_SECRET || "",
    }),
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID || "",
      clientSecret: process.env.YANDEX_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Формируем FormData как требует FastAPI
          const formData = new URLSearchParams();
          formData.append('username', credentials.email);
          formData.append('password', credentials.password);

          const response = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Неверный email или пароль');
          }

          const data = await response.json();
          
          // Получаем данные пользователя
          const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`
            }
          });
          
          if (!userResponse.ok) {
            throw new Error('Не удалось получить данные пользователя');
          }
          
          const userData = await userResponse.json();
          
          // Add debug log for userData
          console.log('User data from API:', JSON.stringify(userData, null, 2));
          
          return {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name,
            image: userData.avatar || null, // Use 'avatar' instead of 'avatar_url'
            access_token: data.access_token
          };
        } catch (error) {
          console.error('Ошибка авторизации:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 часа
  },
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      if (trigger === "update" && session?.user) {
        // Обновляем токен при обновлении сессии (например, при обновлении аватара)
        token.picture = session.user.image;
      }
      if (user) {
        // При первоначальном логине
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.access_token = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        // @ts-ignore - добавляем токен в сессию
        session.access_token = token.access_token as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-for-dev',
});