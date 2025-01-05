import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Function to decode JWT token
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.group('NextAuth Authorize');
        console.log('Received Credentials:', {
          username: credentials?.username,
          hasPassword: !!credentials?.password
        });

        // Validate input
        if (!credentials?.username || !credentials?.password) {
          console.error('Missing credentials');
          console.groupEnd();
          throw new Error('Please provide both username and password');
        }

        try {
          // Verify credentials with Django backend
          const backendUrl = 'http://localhost:8000/users/signin/';
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password
            }),
          });

          const data = await response.json();

          console.log('Backend Verification Response:', {
            status: response.status,
            ok: response.ok,
            data
          });

          if (!response.ok) {
            console.error('Backend verification failed:', data);
            console.groupEnd();
            throw new Error(data.message || 'Invalid credentials');
          }

          // Decode the access token to get user information
          const decodedToken = decodeJwt(data.access);
          console.log('Decoded token:', decodedToken);

          if (!decodedToken?.user_id) {
            console.error('Missing user ID in token');
            console.groupEnd();
            throw new Error('Invalid token format');
          }

          // Return the user object
          const user = {
            id: decodedToken.user_id.toString(),
            name: credentials.username,
            email: credentials.username,
            accessToken: data.access,
            refreshToken: data.refresh
          };

          console.log('Authentication successful, returning user:', user);
          console.groupEnd();
          return user;
        } catch (error) {
          console.error('Authorization error:', error);
          console.groupEnd();
          throw error;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Remove duplicate locale prefixes
      const cleanUrl = url.replace(/\/[a-z]{2}\/[a-z]{2}\//, '/$1/');
      
      // Handle relative URLs
      if (cleanUrl.startsWith('/')) {
        return new URL(cleanUrl, baseUrl).toString();
      }

      // Handle absolute URLs from the same origin
      if (new URL(cleanUrl).origin === baseUrl) {
        return cleanUrl;
      }

      return baseUrl;
    }
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
