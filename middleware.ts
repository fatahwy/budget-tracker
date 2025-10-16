import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Allow Next.js internals and API auth routes to proceed without blocking
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  if (isPublic) {
    return NextResponse.next();
  }

  // Check for authentication token using NextAuth JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: true });

  if (token) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login page
  const loginUrl = new URL('/login', req.nextUrl.origin);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: [
  '/api/:path*',
  '/login',
  '/signup',
  '/dashboard/:path*',
  '/transactions/:path*',
  '/accounts/:path*',
  '/users/:path*'
] }