/**
 * One-off script: create an admin user in td.users.
 * Run: node scripts/create-admin.js <email> <password>
 * Requires DATABASE_URL in .env (not committed).
 */
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;
if (!pool) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO public.users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [email.trim().toLowerCase(), hash]
  );
  console.log('Admin user created/updated:', email.trim().toLowerCase());
  await pool.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
