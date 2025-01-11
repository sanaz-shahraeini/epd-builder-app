import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing, locales, defaultLocale } from './i18n/navigation';
import { getToken } from 'next-auth/jwt';

const LOCALES = locales;
const DEFAULT_LOCALE = defaultLocale;

// List of public routes that don't require authentication
const publicRoutes = [
  '/signin', 
  '/signup', 
  '/forgot-password',
  '/auth',
  '/api'
];

// List of protected routes that require authentication
const protectedRoutes = [
  '/dashboard'
];

// Utility function to check if a route matches
function matchRoute(pathname: string, routes: string[]) {
  return routes.some(route => 
    pathname === route || 
    pathname.startsWith(route + '/') || 
    pathname.includes(route)
  );
}

// Create intl middleware
const intlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  pathnames: routing.pathnames,
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for auth API routes and static files
  if (
    pathname.startsWith('/api/auth') || 
    pathname.match(/\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Get the token and check if it's valid
  const token = await getToken({ req: request });
  const isProtectedRoute = matchRoute(pathname, protectedRoutes);

  // If accessing a protected route without a valid token, redirect to signin
  if (isProtectedRoute && !token) {
    const signInUrl = new URL(`/${DEFAULT_LOCALE}/signin`, request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle regular user access
  if (token?.user_type === 'regular') {
    // Allow access to coming-soon page
    if (pathname.includes('/dashboard/coming-soon')) {
      return intlMiddleware(request);
    }
    // Redirect to coming-soon page from all other dashboard routes
    if (pathname.includes('/dashboard')) {
      console.log('Redirecting regular user to coming-soon page');
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/dashboard/coming-soon`, request.url));
    }
  }

  // Check for duplicate locales
  const segments = pathname.split('/').filter(Boolean);
  const localesInPath = segments.filter(segment => LOCALES.includes(segment));
  
  // If more than one locale in path, redirect to the last locale
  if (localesInPath.length > 1) {
    const lastLocale = localesInPath[localesInPath.length - 1];
    const cleanPathSegments = segments.filter(segment => !LOCALES.includes(segment));
    const newPath = `/${lastLocale}/${cleanPathSegments.join('/')}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Handle root path
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/signin`, request.url));
  }

  // Handle authenticated users trying to access auth pages
  if (token && matchRoute(pathname, publicRoutes)) {
    if (token.user_type === 'regular') {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/dashboard/coming-soon`, request.url));
    }
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/dashboard/profile`, request.url));
  }

  // Apply intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api/auth|_next|.*\\..*).*)']
};