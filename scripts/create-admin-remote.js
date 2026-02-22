/**
 * Generate bcrypt hash and SQL file for creating admin user on the server.
 * Run: node scripts/create-admin-remote.js [email] [password]
 * Then run: .\scripts\create-admin-via-ssh.ps1 (or follow printed instructions).
 */
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const email = process.argv[2] || 'admin@td.local';
const password = process.argv[3] || 'TdAdminPanel1';

async function main() {
  const hash = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO public.users (email, password_hash, role)
VALUES ('${email.trim().toLowerCase()}', '${hash}', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin';
`;

  const sqlFile = path.join(__dirname, '.create-admin.sql');
  fs.writeFileSync(sqlFile, sql, 'utf8');

  console.log('SQL written to: ' + sqlFile);
  console.log('');
  console.log('Run (PowerShell, SSH key for st@104.223.25.234):');
  console.log('  .\\scripts\\create-admin-via-ssh.ps1');
  console.log('');
  console.log('Login: ' + email.trim().toLowerCase() + ' / ' + password);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
