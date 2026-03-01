import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/telegram/verify';

// Routes that don't require authentication
const publicPaths = [
  '/api/auth/telegram',
  '/api/bot',
  '/api/upload',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get('session')?.value;

  // For API routes that require auth
  if (pathname.startsWith('/api/')) {
    // Auth endpoint is handled separately
    if (pathname.includes('/api/auth/')) {
      return NextResponse.next();
    }

    // Bot webhook and upload can be public (they have their own auth)
    if (pathname === '/api/bot' || pathname === '/api/upload') {
      return NextResponse.next();
    }

    // All other API routes require auth
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // For page routes, redirect to home if not authenticated
  // Note: This is a basic implementation. In production, you'd want to
  // check if the user is actually logged in
  if (!sessionToken && pathname !== '/') {
    // Allow static files and Next.js internals
    if (!pathname.startsWith('/_next') && !pathname.includes('.')) {
      // Allow access but the page will handle auth state
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
