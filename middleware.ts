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

  // Get authentication status
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Get locale from the pathname
  const hasLocale = LOCALES.includes(segments[0]);
  const currentLocale = hasLocale ? segments[0] : DEFAULT_LOCALE;
  
  // Get clean pathname without locale
  const pathnameWithoutLocale = '/' + segments.slice(hasLocale ? 1 : 0).join('/');

  // Handle root path
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL(`/${currentLocale}/signin`, request.url));
  }

  // Handle authentication redirects
  if (!isAuthenticated && matchRoute(pathnameWithoutLocale, protectedRoutes)) {
    const signInUrl = new URL(`/${currentLocale}/signin`, request.url);
    signInUrl.searchParams.set('callbackUrl', `/${currentLocale}/dashboard/profile`);
    return NextResponse.redirect(signInUrl);
  }

  // Handle authenticated users trying to access auth pages
  if (isAuthenticated && matchRoute(pathnameWithoutLocale, publicRoutes)) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard/profile`, request.url));
  }

  // Apply intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api/auth|_next|.*\\..*).*)']
};