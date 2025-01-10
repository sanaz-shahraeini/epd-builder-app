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
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please provide both username and password');
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
          const loginUrl = `${baseUrl}/users/signin/`;
          console.log('Attempting login at:', loginUrl);

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
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
          console.log('Login successful, received tokens:', data);

          if (data && data.access) {
            console.log('Access Token:', data.access); // Log the access token
            return {
              id: data.user?.id?.toString(),
              name: data.user?.username,
              email: data.user?.email,
              accessToken: data.access,
              refreshToken: data.refresh
            };
          }

          console.error('Invalid response data:', data);
          throw new Error('Invalid response from server');
        } catch (error) {
          console.error('Auth error:', error);
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
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(nextAuthOptions);
export { handler as GET, handler as POST }
