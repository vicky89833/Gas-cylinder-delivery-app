// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (request.nextUrl.pathname.startsWith('/staff') && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}