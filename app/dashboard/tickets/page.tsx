'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Ticket = {
  id: string;
  user_id: string;
  file_url: string;
  created_at: string;
  user_email: string;
};

type User = { id: string; email: string; role: string };

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/tickets', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/users', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([t, u]) => {
        if (Array.isArray(t)) setTickets(t);
        else setError('Failed to load tickets');
        if (Array.isArray(u)) {
          setUsers(u);
          if (u.length && !selectedUser) setSelectedUser(u[0].id);
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedUser) {
      setUploadError('Select a user and a file.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setUploadError(uploadData.error || 'Upload failed');
        return;
      }
      const createRes = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser,
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
    } catch {
      setUploadError('Network error');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p style={{ color: '#71717a' }}>Loading…</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tickets</h1>
      <p style={{ color: '#71717a', marginBottom: 24 }}>
        View tickets and upload files to MinIO (stored in bucket <code style={{ background: '#27272a', padding: '2px 6px', borderRadius: 4 }}>td-tickets</code>).
      </p>

      <div
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Upload file (MinIO)</h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
          {uploadError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: 10, borderRadius: 8, fontSize: 14 }}>
              {uploadError}
            </div>
          )}
          <label>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a1a1aa' }}>User</span>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #3f3f46',
                background: '#27272a',
                color: '#fff',
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </label>
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
            disabled={uploading || !file}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#7c3aed',
              color: '#fff',
              fontWeight: 600,
              opacity: uploading || !file ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading…' : 'Upload and create ticket'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ color: '#fca5a5', marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ overflowX: 'auto', background: '#18181b', border: '1px solid #27272a', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #27272a' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>File URL</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.user_email}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                  <a href={t.file_url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                    {t.file_url}
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
