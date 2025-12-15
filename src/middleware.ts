
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session'); // Adjust based on your auth implementation (e.g., token)
  
  // Basic protection: If accessing protected routes without session, redirect to login
  // Note: Since we are using client-side Firebase Auth, this server-side check is limited.
  // Ideally, you'd verify a session cookie or JWT here.
  // For now, we'll assume if there is NO cookie/token mechanism that indicates logged-in state, we might redirect.
  // But with Firebase Client SDK, often middleware is used just for path matching or if using firebase-admin to verify cookies.
  
  // Since the user asked for middleware specifically for route protection:
  // We'll define protected paths.
  
  const protectedPaths = ['/dashboard', '/projects', '/inventory', '/settings'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // If you strictly rely on client-side auth state (zustand/firebase sdk), middleware might not know auth state
  // UNLESS you implementing session cookies.
  // For this task, we will scaffold the middleware.
  
  // Example logic (commented out until session strategy is confirmed):
  /*
  if (isProtectedPath && !session) {
      return NextResponse.redirect(new URL('/login', request.url));
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};
