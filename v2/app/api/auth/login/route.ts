import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession, getCookieName } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!pool) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  const { rows } = await pool.query<{ id: string; email: string; password_hash: string; role: string }>(
    'SELECT id, email, password_hash, role FROM public.users WHERE email = $1', [email.trim().toLowerCase()]
  );
  const user = rows[0];
  if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  const token = await createSession(user.id, user.email, user.role);
  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(getCookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24, path: '/' });
  return res;
}
