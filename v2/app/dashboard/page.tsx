import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 14 }}>Manage users and tickets for Ticket Defenders.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link
          href="/dashboard/users"
          className="dashboard-card"
          style={{
            display: 'block',
            padding: 'clamp(16px, 4vw, 20px)',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            minWidth: 180,
            flex: '1 1 200px',
          }}
        >
          <strong style={{ fontSize: 16, color: '#f8fafc' }}>Users</strong>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>View and manage users</p>
        </Link>
        <Link
          href="/dashboard/tickets"
          className="dashboard-card"
          style={{
            display: 'block',
            padding: 'clamp(16px, 4vw, 20px)',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            minWidth: 180,
            flex: '1 1 200px',
          }}
        >
          <strong style={{ fontSize: 16, color: '#f8fafc' }}>Tickets</strong>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>View tickets and upload files</p>
        </Link>
      </div>
    </div>
  );
}
