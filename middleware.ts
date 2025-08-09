export { default } from 'next-auth/middleware';

// The matcher ensures the middleware applies to all routes
// except for the API, Next.js, and authentication routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - auth (nuestras rutas de autenticación)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
