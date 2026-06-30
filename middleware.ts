import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'panel_auth';
const SESSION_SECRET = process.env.PANEL_SESSION_SECRET || 'trade-news-admin-panel-2024';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get(AUTH_COOKIE)?.value === SESSION_SECRET;

  if (pathname.startsWith('/login')) {
    if (isAuthenticated) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!isAuthenticated) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/).*)'],
};
