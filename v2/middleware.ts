import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'td_admin_session';
function getSecret(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  return s ? new TextEncoder().encode(s) : null;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith('/api/auth/login')) return NextResponse.next();
  const secret = getSecret();
  if (path.startsWith('/login')) {
    if (secret) {
      const token = req.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        try {
          await jwtVerify(token, secret);
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } catch { }
      }
    }
    return NextResponse.next();
  }
  if (path.startsWith('/dashboard') || path.startsWith('/api')) {
    if (!secret) {
      if (path.startsWith('/api')) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 503 });
      return NextResponse.next();
    }
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      if (path.startsWith('/api')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', req.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      if ((payload as { role?: string }).role !== 'admin') {
        if (path.startsWith('/api')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return NextResponse.next();
    } catch {
      if (path.startsWith('/api')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/api/:path*', '/login'] };
