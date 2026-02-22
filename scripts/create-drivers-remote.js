/**
 * Generate SQL to insert 5 driver users (role=user).
 * Run: node scripts/create-drivers-remote.js
 */
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const drivers = [
  { email: 'driver1@td.local', password: 'Driver001' },
  { email: 'driver2@td.local', password: 'Driver002' },
  { email: 'driver3@td.local', password: 'Driver003' },
  { email: 'driver4@td.local', password: 'Driver004' },
  { email: 'driver5@td.local', password: 'Driver005' },
];

async function main() {
  const statements = [];
  for (const d of drivers) {
    const hash = await bcrypt.hash(d.password, 10);
    statements.push(
      `INSERT INTO public.users (email, password_hash, role) VALUES ('${d.email}', '${hash}', 'user') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'user';`
    );
  }
  const sql = statements.join('\n');
  const sqlFile = path.join(__dirname, '.create-drivers.sql');
  fs.writeFileSync(sqlFile, sql, 'utf8');
  console.log('SQL written to:', sqlFile);
  drivers.forEach((d) => console.log('  ', d.email, '/', d.password));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
