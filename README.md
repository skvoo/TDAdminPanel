# TD Admin Panel

English admin panel for the **Ticket Defender (TD)** project. It connects to the TD PostgreSQL database on Pigsty and uses **MinIO (S3)** for file uploads. Designed to be deployed on **Vercel**.

## Features

- **Login** — Only users with `role = 'admin'` in the `td.users` table can sign in.
- **Dashboard** — Overview and links to Users and Tickets.
- **Users** — List all users (email, role, created_at).
- **Tickets** — List all tickets with file URLs; **upload files to MinIO** and create a new ticket for a selected user.

## Tech stack

- **Next.js 14** (App Router), React, TypeScript
- **PostgreSQL** via `pg` (TD database on Pigsty, PgBouncer port 6432)
- **MinIO** via `@aws-sdk/client-s3` (bucket `td-tickets`)
- **Auth** — JWT in HTTP-only cookie; password check with `bcryptjs`

## Environment variables

Set these in **Vercel** (Project → Settings → Environment Variables) and optionally in `.env` locally. Do **not** commit `.env` or secrets.

| Variable        | Description |
|----------------|-------------|
| `DATABASE_URL` | `postgresql://tdadmin:PASSWORD@104.223.25.234:6432/td` |
| `S3_ENDPOINT`  | `http://104.223.25.234:9000` |
| `S3_BUCKET`    | `td-tickets` |
| `S3_ACCESS_KEY`| MinIO user (e.g. `s3user_td`) |
| `S3_SECRET_KEY`| MinIO secret (from Pigsty config) |
| `S3_PUBLIC_URL`| `http://104.223.25.234:9000/td-tickets` |
| `JWT_SECRET`   | Random string (e.g. 32+ chars) for signing sessions |

See `.env.example` for a template. Documentation: [pigsty/docs/VERCEL-TD-INTEGRATION.md](c:\Users\sk\.cursor\projects\pigsty\docs\VERCEL-TD-INTEGRATION.md) and [TD-MINIO-DEPLOY-AND-FRONTEND.md](c:\Users\sk\.cursor\projects\pigsty\docs\TD-MINIO-DEPLOY-AND-FRONTEND.md).

## Run locally

```bash
npm install
cp .env.example .env
# Edit .env with real DATABASE_URL, S3_*, JWT_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`. Sign in with an admin user from the `td.users` table (password must be bcrypt-hashed).

## First login / Create admin user

Only users with `role = 'admin'` in `td.users` can sign in.

**Option A — from your machine (if it can reach the DB):**  
With `.env` containing `DATABASE_URL`:

```bash
node scripts/create-admin.js your@email.com YourPassword
```

**Option B — via SSH to server (login `st`, key-based):**  
Generates SQL with bcrypt hash, then copies it to the server and runs `psql` there:

```powershell
node scripts/create-admin-remote.js admin@td.local TdAdminPanel1
.\scripts\create-admin-via-ssh.ps1
```

Default credentials: **admin@td.local** / **TdAdminPanel1**. Then sign in at the app login page.

## Deploy on Vercel

1. Push the project to GitHub (or connect another Git provider).
2. In [Vercel](https://vercel.com): **Add New Project** → Import this repo.
3. **Environment variables**: copy `.env.vercel.example` to a local `.env`, fill in real values, then in Vercel go to **Project → Settings → Environment Variables → Import** and upload your `.env` (or add each variable manually). Do not commit `.env`.
4. Deploy. After deployment, redeploy if you change env vars so serverless functions get the new values.

No extra build settings are required; `vercel.json` is optional. Vercel detects Next.js automatically.

## Security

- Only `role = 'admin'` can access `/dashboard` and `/api` (except `/api/auth/login`).
- File upload is done server-side; MinIO credentials are never exposed to the client.
- Use a strong `JWT_SECRET` in production.

## Before pushing to GitHub

- **No real secrets in the repo.** Commit only `.env.example` (it has placeholders: `YOUR_PASSWORD`, `YOUR_MINIO_SECRET`, `your-random-secret-at-least-32-chars`). Never commit `.env` or any file with real `DATABASE_URL`, `S3_SECRET_KEY`, or `JWT_SECRET`.
- **No hardcoded fallback secret.** `JWT_SECRET` is read only from the environment; if it is missing, login and protected routes will not work until you set it (e.g. in Vercel).
- Ensure `.gitignore` includes `.env`, `.env.local`, and other env variants so they are never committed.
