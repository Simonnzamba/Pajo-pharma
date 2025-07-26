import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;

    // Allow access to specific login pages and API routes
    if (path.startsWith('/login-admin') || path.startsWith('/login-seller') || path.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // If no token, redirect to appropriate login page
    if (!token) {
      if (path.startsWith('/admin-dashboard') || path.startsWith('/medications') || path.startsWith('/sales') || path.startsWith('/users')) {
        return NextResponse.redirect(new URL('/login-admin', req.url));
      }
      if (path.startsWith('/seller-dashboard') || path.startsWith('/sell')) {
        return NextResponse.redirect(new URL('/login-seller', req.url));
      }
      // Fallback for other protected routes if any, or if the matcher is broader
      return NextResponse.redirect(new URL('/login-common', req.url)); // Assuming /login-common is a generic login
    }

    // Admin access control
    if (path.startsWith('/admin-dashboard') || path.startsWith('/medications') || path.startsWith('/sales') || path.startsWith('/users')) {
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/login-admin', req.url)); // Redirect to admin login if not admin
      }
    }

    // Seller access control
    if (path.startsWith('/seller-dashboard') || path.startsWith('/sell')) {
      if (token.role !== 'seller') {
        return NextResponse.redirect(new URL('/login-seller', req.url)); // Redirect to seller login if not seller
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/seller-dashboard/:path*',
    '/medications/:path*',
    '/sales/:path*',
    '/users/:path*',
    '/sell/:path*',
  ],
};