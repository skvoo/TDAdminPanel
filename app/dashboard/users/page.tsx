'use client';

import { useEffect, useState, useMemo } from 'react';

type User = { id: string; email: string; role: string; created_at: string };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [users, search]);

  useEffect(() => {
    fetch('/api/users', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load users');
        return r.json();
      })
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: '#71717a' }}>Loading users…</p>;
  }
  if (error) {
    return <div style={{ color: '#fca5a5' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, marginBottom: 8 }}>Users</h1>
      <p style={{ color: '#71717a', marginBottom: 24, fontSize: 14 }}>
        All users in the TD database.
      </p>
      <input
        type="search"
        placeholder="Search by email, role, or ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #3f3f46',
          background: '#27272a',
          color: '#fff',
          marginBottom: 16,
        }}
      />
      <div
        style={{
          overflowX: 'auto',
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 12,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 320 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #27272a' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Created</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{u.email}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: u.role === 'admin' ? '#7c3aed33' : '#3f3f46',
                      fontSize: 13,
                    }}
                  >
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14, color: '#a1a1aa' }}>
                  {new Date(u.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#71717a', fontFamily: 'monospace' }}>
                  {u.id.slice(0, 8)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
