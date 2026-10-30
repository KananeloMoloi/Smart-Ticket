import 'dotenv/config';
import { db } from './lib/db.js';
const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error('Usage: node src/promote-admin.js registered@example.com'); process.exitCode = 1; }
else {
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } });
    if (!user) { console.error(`No registered user found for ${email}. Register first, and confirm api/.env DATABASE_URL points to the same database.`); process.exitCode = 1; }
    else { const updated = await db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' }, select: { email: true, role: true } }); console.log('Administrator enabled:', updated.email, updated.role); }
  } catch (err) { console.error('Database error:', err.message); process.exitCode = 1; }
  finally { await db.$disconnect(); }
}
