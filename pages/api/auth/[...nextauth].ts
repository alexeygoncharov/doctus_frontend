import NextAuth, { type NextAuthOptions, type User as NextAuthUser, type Session } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
// import { UserProfile } from '@/lib/api'; // Remove UserProfile import for now

// Ensure backend URL is set
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.doctus.chat';
if (!backendUrl) {
  throw new Error('Environment variable NEXT_PUBLIC_API_URL or NEXT_AUTH_BACKEND_URL must be set');
}

// User data structure from backend /auth/me
interface BackendUser {
  id: number | string;
  email: string;
  full_name?: string | null;
  name?: string | null;
  avatar?: string | null;
  role?: string;
  created_at?: string;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // --- REFRESH TOKEN LOGIC --- 
    // This part needs to be implemented based on your backend's refresh mechanism.
    // If your backend DOES NOT support refresh tokens, remove this logic
    // or return the token with an error immediately.

    /* --- Example Refresh Logic (Adapt to your API) ---
    console.log("Attempting to refresh access token");
    if (!token.refreshToken) {
        console.error("No refresh token available");
        throw new Error("MissingRefreshToken");
    }

    const response = await fetch(`${backendUrl}/auth/refresh-token`, { // Adjust endpoint if needed
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });

    if (!response.ok) {
      console.error("Refresh token request failed:", response.status);
       // Check if the refresh token itself is invalid/expired
      if (response.status === 401 || response.status === 403) {
           // Potentially trigger a full sign-out here
           // eraseCookie('auth_token'); // If using cookies
           // localStorage.removeItem('auth_token');
           // localStorage.removeItem('user_data');
           throw new Error("InvalidRefreshToken"); // Signal that re-authentication is needed
       }
      throw new Error('Failed to refresh access token');
    }

    const refreshedTokens = await response.json();

    // Update token with new values
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 3600) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Keep old if new one isn't provided
      error: undefined, // Clear error on successful refresh
    };
    */

    // --- Placeholder if refresh logic is not implemented --- 
    console.warn('Refresh token logic not implemented in [...nextauth].ts. Returning token with error.');
    return {
      ...token,
      error: 'RefreshAccessTokenNotImplemented', // Indicate refresh is needed but not implemented
    };

  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
       // If refresh failed (e.g., invalid refresh token), set error and potentially clear tokens
       // accessToken: undefined, // Clear expired access token
      error: error instanceof Error && error.message === 'InvalidRefreshToken'
        ? 'InvalidRefreshToken' // Specific error for frontend handling
        : 'RefreshAccessTokenError', // Generic error
        // Consider clearing refreshToken here if it's invalid
        // refreshToken: undefined,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('Authorize: Missing credentials');
          return null;
        }

        console.log(`Authorize: Attempting login for ${credentials.email}`);
        try {
          // 1. Get Access Token from /auth/token
          const tokenResponse = await fetch(`${backendUrl}/auth/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              username: credentials.email,
              password: credentials.password,
            }),
          });

          if (!tokenResponse.ok) {
            const status = tokenResponse.status;
            let errorMsg = `Login failed (status ${status})`;
            try {
              const errorData = await tokenResponse.json();
              errorMsg = errorData.detail || errorMsg;
            } catch (e) { /* Ignore if response is not JSON */ }
            console.error(`Authorize: Token request failed for ${credentials.email}. Status: ${status}, Message: ${errorMsg}`);
            throw new Error(errorMsg); // Throw error with backend message if available
          }

          const tokenData = await tokenResponse.json();
          if (!tokenData.access_token) {
            console.error(`Authorize: access_token missing from /auth/token response for ${credentials.email}`);
            throw new Error('Authentication failed: No access token received.');
          }
          console.log(`Authorize: Token received for ${credentials.email}`);

          // 2. Get User Details from /auth/me
          console.log(`Authorize: Fetching user details from ${backendUrl}/auth/me`);
          const userResponse = await fetch(`${backendUrl}/auth/me`, {
             headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          if (!userResponse.ok) {
            const status = userResponse.status;
            const errorText = await userResponse.text();
            console.error(`Authorize: Fetching user failed for ${credentials.email}. Status: ${status}, Response: ${errorText}`);
            throw new Error(`Failed to fetch user details after login (status ${status})`);
          }

          const backendUserData: BackendUser = await userResponse.json();
          console.log(`Authorize: User details received for ${credentials.email}`, backendUserData);

          if (!backendUserData.id) {
            console.error(`Authorize: User ID missing from /auth/me response for ${credentials.email}`);
            throw new Error('User identification failed after login.');
          }

          // 3. Construct the User object for NextAuth
          const authorizeUser = {
             id: backendUserData.id.toString(),
             email: backendUserData.email,
             name: backendUserData.name || backendUserData.full_name || undefined,
             accessToken: tokenData.access_token,
             accessTokenExpires: (Date.now() + (tokenData.expires_in || 3600) * 1000),
             backendUser: backendUserData,
           };
           console.log(`Authorize: Success for ${credentials.email}. User ID: ${authorizeUser.id}`);
           return authorizeUser as any;

        } catch (error) {
          console.error(`Authorize: Error during authorization process for ${credentials.email}:`, error);
          // Ensure the error message passed to the frontend is useful
          throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred during login.');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // maxAge: 30 * 24 * 60 * 60, // Example: 30 days session
  },
  callbacks: {
    async jwt({ token, user, account }): Promise<JWT> {
       // **Initial sign in**
       if (account && user) {
         const authorizeUser = user as any; // Use `as any` here
         token.accessToken = authorizeUser.accessToken;
         token.accessTokenExpires = authorizeUser.accessTokenExpires;
         token.sub = authorizeUser.id;
         token.iat = Math.floor(Date.now() / 1000);
         token.exp = Math.floor(authorizeUser.accessTokenExpires / 1000);
         token.user = { // Populate user details in token
              id: authorizeUser.id,
              email: authorizeUser.backendUser?.email,
              name: authorizeUser.backendUser?.name || authorizeUser.backendUser?.full_name || null,
              avatar: authorizeUser.backendUser?.avatar, // Add avatar here
              role: authorizeUser.backendUser?.role,
          } as any; // Use `as any` for the custom user object
          return token;
       }

      // **Subsequent calls: Check expiry**
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token; // Token still valid
      }

      // **Refresh token logic (if implemented)**
      // return refreshAccessToken(token);
      console.warn("JWT Callback: Token expired or invalid, refresh logic not implemented.");
      return { ...token, error: "RefreshAccessTokenError" } as JWT; // Cast return
    },

    async session({ session, token }): Promise<Session> {
      // Copy required fields from token to session using type assertions
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;

      // Construct session.user based on token data
      const tokenUser = token.user as any; // Use `as any`
      session.user = {
          ...(session.user), // Keep default fields like expires
          id: token.sub || '',
          email: tokenUser?.email || '', 
          name: tokenUser?.name,
          avatar: tokenUser?.avatar,
          role: tokenUser?.role,
          // Cast the final object to Session['user'] to satisfy the type
      } as Session['user'];

      // Clean up potentially added backendUser from session.user if necessary
      if (session.user && 'backendUser' in session.user) {
        delete (session.user as any).backendUser;
      }
      if (session.user && 'accessToken' in session.user) {
        delete (session.user as any).accessToken;
      }
       if (session.user && 'accessTokenExpires' in session.user) {
        delete (session.user as any).accessTokenExpires;
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/login',     // Your custom login page path
    error: '/auth/login', // Redirect to login on auth errors (CredentialsSignin). Customize if needed.
    // signOut: '/auth/logout', // Optional: Custom signout confirmation page
    // verifyRequest: '/auth/verify-request', // Optional: Used for email provider verification
    // newUser: null, // If you handle registration separately
  },
  // Enable debug messages in development for more logs
  debug: process.env.NODE_ENV === 'development',

  secret: process.env.NEXTAUTH_SECRET, // REQUIRED: Secret for JWT signing/encryption
};

export default NextAuth(authOptions);
