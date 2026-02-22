'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        background: 'transparent',
        border: '1px solid #3f3f46',
        color: '#a1a1aa',
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 14,
      }}
    >
      Log out
    </button>
  );
}
