import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/api/auth',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

// Check if path is public
function isPublicPath(pathname: string): boolean {
  // Allow exact match or API auth routes
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return true;
  }
  // Allow root path
  if (pathname === '/') {
    return true;
  }
  return false;
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const sessionToken = request.cookies.get('session')?.value;
  if (!sessionToken) {
    return false;
  }
  
  const session = await verifySessionToken(sessionToken);
  return !!session;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if path is public
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const authenticated = await isAuthenticated(request);

  // If not authenticated and trying to access protected route, redirect to home
  if (!authenticated) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // For page routes, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
