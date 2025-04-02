import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    access_token: string;
    refresh_token: string;
    [key: string]: any; // Для дополнительных полей
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      access_token: string;
      userData?: any;
      [key: string]: any;
    }
    access_token: string;
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    access_token?: string;
    refresh_token?: string;
    exp?: number;
    user?: any;
  }
}