import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession, isAdmin } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!pool) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }
  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.user_id, t.file_url, t.created_at, u.email AS user_email
       FROM public.tickets t
       JOIN public.users u ON u.id = t.user_id
       ORDER BY t.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!pool) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }
  let body: { user_id?: string; file_url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
  const { user_id, file_url } = body;
  if (!user_id || !file_url || typeof file_url !== 'string') {
    return NextResponse.json(
      { error: 'user_id and file_url are required' },
      { status: 400 }
    );
  }
  if (file_url.length > 1024) {
    return NextResponse.json(
      { error: 'file_url too long' },
      { status: 400 }
    );
  }
  try {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO public.tickets (user_id, file_url) VALUES ($1, $2) RETURNING id`,
      [user_id, file_url]
    );
    return NextResponse.json({ id: rows[0].id, ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
