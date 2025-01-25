// Extend the built-in User type
declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    user_type?: string;
    accessTokenExpires?: number;
  }
}

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
        type: { label: "Auth Type", type: "text" },
        access: { label: "Access Token", type: "text" },
        refresh: { label: "Refresh Token", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
          let loginUrl: string;
          let body: any;

          // Handle different authentication types
          if (credentials.type === 'token') {
            // Token-based authentication (for email verification)
            if (!credentials.access || !credentials.refresh || !credentials.email) {
              throw new Error('Missing required token credentials');
            }

            // For token-based auth, we already have the tokens from email verification
            return {
              id: 'email_verified',
              email: credentials.email,
              accessToken: credentials.access,
              refreshToken: credentials.refresh
            };
          } else if (credentials.type === 'password') {
            // Username/password authentication
            if (!credentials.username || !credentials.password) {
              throw new Error('Please provide both username and password');
            }
            loginUrl = `${baseUrl}/users/signin/`;
            body = {
              username: credentials.username,
              password: credentials.password,
            };

            console.log('Attempting login at:', loginUrl);

            const response = await fetch(loginUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
              credentials: 'include',
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('Login failed:', response.status, errorData);
              if (response.status === 401) {
                throw new Error('Invalid credentials');
              }
              throw new Error(errorData.detail || errorData.message || 'Authentication failed');
            }

            const data = await response.json();
            console.log('Login successful, received data:', data);

            if (data && data.access) {
              return {
                id: data.user?.id?.toString(),
                name: data.user?.username,
                email: data.user?.email,
                accessToken: data.access,
                refreshToken: data.refresh,
                user_type: data.user?.user_type
              };
            }

            console.error('Invalid response data:', data);
            throw new Error('Invalid response format');
          } else if (credentials.type === 'email') {
            // Email-based authentication
            loginUrl = `${baseUrl}/users/signin/`;
            body = {
              email: credentials.email,
              verified: true,
              code: credentials.code // Include verification code for verification
            };

            // Make the request
            const response = await fetch(loginUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(body),
            });

            console.log('Sign-in response status:', response.status);
            const data = await response.json();
            console.log('Sign-in response data:', data);

            if (!response.ok) {
              console.error('Sign-in error:', data);
              throw new Error(data.error || 'Failed to sign in');
            }

            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.username,
              accessToken: data.access,
              refreshToken: data.refresh,
              user_type: data.user.user_type,
            };
          } else {
            throw new Error('Unsupported authentication type');
          }
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // Initial sign in
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user_type = user.user_type;
        token.accessTokenExpires = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token expired, try to refresh it
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: token.refreshToken,
          }),
        });

        if (!response.ok) {
          console.error('Token refresh failed:', response.status);
          return { ...token, error: 'RefreshAccessTokenError' };
        }

        const data = await response.json();
        console.log('Token refreshed successfully');
        
        return {
          ...token,
          accessToken: data.access,
          accessTokenExpires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
          error: undefined, // Clear any previous errors
        };
      } catch (error) {
        console.error('Error refreshing access token:', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.error = token.error;
        session.user = {
          ...session.user,
          id: token.id,
          user_type: token.user_type
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects
      if (url.startsWith(baseUrl)) {
        return url;
      } else if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
}

const handler = NextAuth(nextAuthOptions);
export { handler as GET, handler as POST };
