// middleware.js
import { NextResponse } from 'next/server';
import { getSession } from './lib/session';

export async function middleware(req) {
  const session = await getSession(req);
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/product/new')) {
    if (!session?.isAdmin) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/product/new'],
};
