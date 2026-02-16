import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/auth';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];
// Routes for unauthenticated users
const publicRoutes = ['/login', '/signup', '/'];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = request.cookies.get('session')?.value;
  let session = null;

  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch (e) {
      console.error('Failed to decrypt session', e);
    }
  }

  // Redirect to /login if the user is not authenticated and tries to access a protected route
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Redirect to /dashboard if the user is authenticated and tries to access login/signup
  if (isPublicRoute && session && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
