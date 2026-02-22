'use client';

import { useEffect, useState, useMemo } from 'react';

type Ticket = {
  id: string;
  user_id: string;
  file_url: string;
  created_at: string;
  user_email: string;
};

type User = { id: string; email: string; role: string };

function fileViewUrl(fileUrl: string): string {
  if (fileUrl.startsWith('/api/file')) return fileUrl;
  return `/api/file?url=${encodeURIComponent(fileUrl)}`;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadErrorDetail, setUploadErrorDetail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sortKey, setSortKey] = useState<keyof Ticket | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const sortedTickets = useMemo(() => {
    if (!sortKey) return tickets;
    return [...tickets].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [tickets, sortKey, sortDir]);

  function toggleSort(key: keyof Ticket) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  function loadData() {
    setError('');
    setErrorDetail('');
    setLoading(true);
    Promise.all([
      fetch('/api/tickets', { credentials: 'include' }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Tickets API: ${r.status} ${r.statusText}${text ? ` — ${text.slice(0, 80)}` : ''}`);
        }
        return r.json();
      }),
      fetch('/api/users', { credentials: 'include' }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Users API: ${r.status} ${r.statusText}${text ? ` — ${text.slice(0, 80)}` : ''}`);
        }
        return r.json();
      }),
    ])
      .then(([t, u]) => {
        if (Array.isArray(t)) setTickets(t);
        else setError('Failed to load tickets');
        if (Array.isArray(u)) {
          setUsers(u);
          if (u.length && !selectedUser) setSelectedUser(u[0]);
        }
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        setErrorDetail(msg);
        if (msg.startsWith('Tickets API:') || msg.startsWith('Users API:')) {
          setError(msg);
        } else if (msg.includes('fetch') || msg.includes('Network')) {
          setError('Network request failed. Check connection, VPN, or try again.');
        } else if (msg.includes('JSON') || msg.includes('Unexpected token')) {
          setError('Server returned non-JSON (possibly 502/503). Try again or check Vercel.');
        } else {
          setError(msg || 'Unknown error. Check console (F12) for details.');
        }
        console.error('[Tickets loadData]', e);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedUser) {
      setUploadError('Select a user and a file.');
      return;
    }
    const maxFileSize = 4 * 1024 * 1024; // 4 MB
    if (file.size > maxFileSize) {
      setUploadError(`File too large. Max size ${Math.round(maxFileSize / 1024 / 1024)} MB.`);
      return;
    }
    setUploadError('');
    setUploadErrorDetail('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const text = await uploadRes.text();
      let uploadData: { fileUrl?: string; error?: string } = {};
      try {
        if (text) uploadData = JSON.parse(text);
      } catch {
        if (uploadRes.status === 413) {
          setUploadError('File too large. Max size 4 MB.');
          setUploadErrorDetail('413 Request Entity Too Large');
          return;
        }
        setUploadError(uploadRes.status >= 500 ? 'Server error. Try again later.' : 'Upload failed.');
        setUploadErrorDetail(text.slice(0, 100) || uploadRes.statusText);
        return;
      }
      if (!uploadRes.ok) {
        setUploadError(uploadData.error || 'Upload failed');
        return;
      }
      const createRes = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          file_url: uploadData.fileUrl,
        }),
        credentials: 'include',
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        setUploadError(err.error || 'Failed to create ticket');
        return;
      }
      const list = await fetch('/api/tickets', { credentials: 'include' }).then((r) => r.json());
      if (Array.isArray(list)) setTickets(list);
      setFile(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setUploadErrorDetail(msg);
      if (msg.includes('fetch') || msg.includes('Network')) {
        setUploadError('Network request failed. Check connection and try again.');
      } else if (msg.includes('JSON') || msg.includes('Unexpected')) {
        setUploadError('File may be too large (max 4 MB) or server error. Try a smaller file.');
      } else {
        setUploadError(msg || 'Upload failed. Check console (F12).');
      }
      console.error('[Tickets upload]', e);
    } finally {
      setUploading(false);
    }
  }

  if (loading && tickets.length === 0 && users.length === 0) {
    return <p style={{ color: '#71717a' }}>Loading…</p>;
  }

  return (
    <div style={{ maxWidth: 960, width: '100%' }}>
      <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, marginBottom: 8 }}>Tickets</h1>
      <p style={{ color: '#71717a', marginBottom: 24, fontSize: 14 }}>
        Files are visible only in the admin panel. Upload stores in MinIO (bucket <code style={{ background: '#27272a', padding: '2px 6px', borderRadius: 4 }}>td-tickets</code>).
      </p>
      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: 8, fontSize: 14 }}>
          <div style={{ marginBottom: errorDetail ? 6 : 0 }}>{error}</div>
          {errorDetail && (
            <div style={{ fontSize: 12, color: '#f87171', wordBreak: 'break-all' }} title={errorDetail}>
              Source: {errorDetail}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 12,
          padding: 'clamp(16px, 4vw, 24px)',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Upload file</h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {uploadError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: 10, borderRadius: 8, fontSize: 14 }}>
              <div>{uploadError}</div>
              {uploadErrorDetail && (
                <div style={{ fontSize: 12, color: '#f87171', wordBreak: 'break-all', marginTop: 6 }} title={uploadErrorDetail}>
                  Source: {uploadErrorDetail}
                </div>
              )}
            </div>
          )}

          <div>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a1a1aa' }}>User (search and select)</span>
            <input
              type="search"
              placeholder="Search by email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #3f3f46',
                background: '#27272a',
                color: '#fff',
                marginBottom: 8,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
              {filteredUsers.length === 0 ? (
                <span style={{ fontSize: 14, color: '#71717a' }}>No users match</span>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setSelectedUser(u); setUserSearch(u.email); }}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: selectedUser?.id === u.id ? '2px solid #7c3aed' : '1px solid #3f3f46',
                      background: selectedUser?.id === u.id ? '#7c3aed22' : '#27272a',
                      color: '#fff',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'block' }}>{u.email}</span>
                    <span style={{ fontSize: 12, color: '#71717a', fontFamily: 'monospace', wordBreak: 'break-all' }}>ID: {u.id}</span>
                    {u.role === 'admin' && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: '#a78bfa' }}>admin</span>
                    )}
                  </button>
                ))
              )}
            </div>
            {selectedUser && (
              <p style={{ marginTop: 8, fontSize: 13, color: '#a1a1aa' }}>
                Selected: <strong style={{ color: '#e4e4e7' }}>{selectedUser.email}</strong>
                <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>(ID: {selectedUser.id})</span>
              </p>
            )}
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a1a1aa' }}>File</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 8,
                border: '1px solid #3f3f46',
                background: '#27272a',
                color: '#fff',
              }}
            />
          </label>
          <button
            type="submit"
            disabled={uploading || !file || !selectedUser}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#7c3aed',
              color: '#fff',
              fontWeight: 600,
              opacity: uploading || !file || !selectedUser ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading…' : 'Upload and create ticket'}
          </button>
        </form>
      </div>

      <div className="tickets-table-wrap" style={{ overflowX: 'auto', background: '#18181b', border: '1px solid #27272a', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 320 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #27272a' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('user_email')}>User {sortKey === 'user_email' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('user_id')}>User ID {sortKey === 'user_id' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>File</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('created_at')}>Created {sortKey === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #27272a' }} className="ticket-row">
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.user_email}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#71717a', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: 280 }}>{t.user_id}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                  <a
                    href={fileViewUrl(t.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ wordBreak: 'break-all', color: '#a78bfa' }}
                  >
                    View file
                  </a>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14, color: '#a1a1aa' }}>
                  {new Date(t.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
