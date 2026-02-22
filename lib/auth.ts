import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getSecret(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  return s ? new TextEncoder().encode(s) : null;
}
const COOKIE_NAME = 'td_admin_session';

export type SessionPayload = {
  id: string;
  email: string;
  role: string;
  exp: number;
};

const DEFAULT_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function createSession(
  id: string,
  email: string,
  role: string,
  maxAge: number = DEFAULT_MAX_AGE
): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error('JWT_SECRET is not set');
  const token = await new SignJWT({ id, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .setIssuedAt()
    .sign(secret);
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const secret = getSecret();
  if (!secret) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === 'admin';
}
