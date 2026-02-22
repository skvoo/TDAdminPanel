import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from './LogoutButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      <header
        style={{
          borderBottom: '1px solid #334155',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: '#1e293b',
        }}
      >
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/logo.png" alt="Ticket Defenders" width={120} height={44} style={{ objectFit: 'contain' }} />
          <span style={{ color: '#94a3b8', fontSize: 14 }}>Admin</span>
        </Link>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: '#94a3b8', fontSize: 14 }}>Dashboard</Link>
          <Link href="/dashboard/users" style={{ color: '#94a3b8', fontSize: 14 }}>Users</Link>
          <Link href="/dashboard/tickets" style={{ color: '#94a3b8', fontSize: 14 }}>Tickets</Link>
          <LogoutButton />
        </nav>
      </header>
      <main style={{ flex: 1, padding: 16, maxWidth: '100%', overflowX: 'hidden' }}>{children}</main>
    </div>
  );
}
