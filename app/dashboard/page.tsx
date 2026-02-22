import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#71717a', marginBottom: 32 }}>
        Manage users and tickets for Ticket Defender.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link
          href="/dashboard/users"
          style={{
            display: 'block',
            padding: 20,
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 12,
            minWidth: 200,
          }}
        >
          <strong style={{ fontSize: 16 }}>Users</strong>
          <p style={{ color: '#71717a', fontSize: 14, marginTop: 4 }}>
            View and manage users
          </p>
        </Link>
        <Link
          href="/dashboard/tickets"
          style={{
            display: 'block',
            padding: 20,
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 12,
            minWidth: 200,
          }}
        >
          <strong style={{ fontSize: 16 }}>Tickets</strong>
          <p style={{ color: '#71717a', fontSize: 14, marginTop: 4 }}>
            View tickets and upload files
          </p>
        </Link>
      </div>
    </div>
  );
}
