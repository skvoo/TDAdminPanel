import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  if (isAdmin(session)) redirect('/dashboard');
  redirect('/login');
}
