import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession, isAdmin } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!pool) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  try {
    const { rows } = await pool.query('SELECT id, email, role, created_at FROM public.users ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
