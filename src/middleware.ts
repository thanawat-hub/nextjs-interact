import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public routes - always allow
  if (
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') ||
    path.startsWith('/auth') ||
    path.startsWith('/unauthorized')
  ) {
    return NextResponse.next();
  }

  // Chat route - allow everyone (guest, member, admin)
  // Guest session handled in API route
  if (path.startsWith('/chat')) {
    return NextResponse.next();
  }

  // Admin routes - check for admin role in token
  // Note: Full role check happens in API routes using auth-guard
  if (path.startsWith('/admin')) {
    // We'll implement proper session check after setting up Supabase
    // For now, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Member routes - require authentication
  if (path.startsWith('/profile') || path.startsWith('/history')) {
    // We'll implement proper session check after setting up Supabase
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
