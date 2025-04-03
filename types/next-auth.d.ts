import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    avatar?: string | null;
    accessToken?: string;
    [key: string]: any; // For additional fields
  }

  /**
   * The shape of the session object returned by `useSession`, `getSession` or received 
   * as a prop by `SessionProvider`'s children.
   */
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      avatar?: string | null; // Avatar field (not image)
      role?: string | null;
      [key: string]: any;
    }
    accessToken?: string; // Match the field name in auth-context.tsx
    error?: string;
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * The shape of the JWT token stored in the session cookie
   */
  interface JWT {
    sub?: string; // Used as id
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user?: {
      id?: string;
      email?: string;
      name?: string | null;
      avatar?: string | null;
      role?: string | null;
      [key: string]: any;
    };
    [key: string]: any;
  }
}