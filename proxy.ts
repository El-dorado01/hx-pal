import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/auth';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];
// Routes for unauthenticated users (auth pages)
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isAuthRoute = authRoutes.includes(path);

  const cookie = request.cookies.get('session')?.value;
  let session = null;

  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch (e) {
      console.error('Failed to decrypt session', e);
    }
  }

  // 1. Redirect root / to /login (or /dashboard if authenticated)
  if (path === '/') {
    return NextResponse.redirect(
      new URL(session ? '/dashboard' : '/login', request.nextUrl),
    );
  }

  // 2. Redirect to /login if the user is not authenticated and tries to access a protected route
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 3. Redirect to /dashboard if the user is authenticated and tries to access auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
