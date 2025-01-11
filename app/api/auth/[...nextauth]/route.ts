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
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user_type = user.user_type;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user = {
          ...session.user,
          id: token.id,
          user_type: token.user_type
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirection based on user type
      if (url.startsWith(baseUrl)) {
        const token = await fetch(`${baseUrl}/api/auth/session`).then(res => res.json());
        if (token?.user?.user_type === 'regular') {
          return `${baseUrl}/dashboard/coming-soon`;
        }
        return url;
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
