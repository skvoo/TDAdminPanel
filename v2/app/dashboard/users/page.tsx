'use client';

import { useEffect, useState, useMemo } from 'react';

type User = { id: string; email: string; role: string; created_at: string };

const cardStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: 12 };
const inputStyle = { width: '100%', maxWidth: 400, padding: '10px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', marginBottom: 16 };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof User | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }, [users, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: keyof User) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  function loadUsers() {
    setError('');
    setLoading(true);
    fetch('/api/users', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 401 ? 'Session expired.' : `Failed to load (${r.status})`);
        return r.json();
      })
      .then(setUsers)
      .catch((e) => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, []);

  if (loading && users.length === 0) return <p style={{ color: '#94a3b8' }}>Loading users…</p>;
  if (error && users.length === 0) return <div style={{ padding: 12, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 960, width: '100%' }}>
      {error && <div style={{ marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8, fontSize: 14 }}>{error}</div>}
      <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>Users</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>All users in the TD database.</p>
      <input type="search" placeholder="Search by email, role, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle} />
      <div style={{ overflowX: 'auto', ...cardStyle }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 320 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14, color: '#f8fafc', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('email')}>Email {sortKey === 'email' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14, color: '#f8fafc', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('role')}>Role {sortKey === 'role' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14, color: '#f8fafc', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('created_at')}>Created {sortKey === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14, color: '#f8fafc', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('id')}>User ID {sortKey === 'id' && (sortDir === 'asc' ? '↑' : '↓')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 16px', fontSize: 14, color: '#f8fafc' }}>{u.email}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: u.role === 'admin' ? 'rgba(250,204,21,0.25)' : '#334155', fontSize: 13, color: u.role === 'admin' ? '#facc15' : '#94a3b8' }}>{u.role}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14, color: '#94a3b8' }}>{new Date(u.created_at).toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', wordBreak: 'break-all' }} title={u.id}>{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
