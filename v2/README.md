# TD Admin Panel v2

Same functionality as the main admin panel, styled like [Ticket Defenders](https://ticket-defenders.vercel.app/): dark blue background, white text, **yellow accent** (#facc15). Logo in header and login.

## Run

```bash
cd v2
npm install
cp .env.example .env
# Edit .env (DATABASE_URL, S3_*, JWT_SECRET)
npm run dev
```

Opens at http://localhost:3001 (main app uses 3000).

## Deploy

Deploy the `v2` folder as a separate Vercel project (root directory: `v2`) or from repo root with root set to `v2`. Same env vars as main panel.
