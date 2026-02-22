import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          borderBottom: '1px solid #27272a',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#18181b',
        }}
      >
        <Link href="/dashboard" style={{ fontWeight: 700, fontSize: 18 }}>
          TD Admin
        </Link>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: '#a1a1aa', fontSize: 14 }}>
            Dashboard
          </Link>
          <Link href="/dashboard/users" style={{ color: '#a1a1aa', fontSize: 14 }}>
            Users
          </Link>
          <Link href="/dashboard/tickets" style={{ color: '#a1a1aa', fontSize: 14 }}>
            Tickets
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
