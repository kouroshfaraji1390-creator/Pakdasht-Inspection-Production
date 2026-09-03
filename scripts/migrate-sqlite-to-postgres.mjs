/* Requires: npm install pg
 * Usage: DATABASE_URL='postgresql://...' node scripts/migrate-sqlite-to-postgres.mjs
 * This script is intentionally opt-in and never runs during normal app startup.
 */
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { config } from '../api/config.mjs';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
let pg;
try { pg = await import('pg'); } catch { throw new Error('PostgreSQL driver is not installed. Run: npm install pg'); }
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false } });
await client.connect();
await client.query(await readFile(join(config.root,'database/postgresql-schema.sql'),'utf8'));
const db = new DatabaseSync(config.dbFile, { readOnly: true });
const tables = ['organizations','users','shops','missions','track_points','inspections','warnings','mission_events','audit_logs','sync_queue','sessions','invites'];
for (const table of tables) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(x=>x.name);
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  if (!rows.length) continue;
  const quotedCols = cols.map(c => `"${c.replaceAll('"','""')}"`).join(',');
  for (const row of rows) {
    const values = cols.map(c=>row[c]);
    const placeholders = values.map((_,i)=>`$${i+1}`).join(',');
    await client.query(`INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
  }
  console.log(`Migrated ${table}: ${rows.length}`);
}
db.close(); await client.end(); console.log('Migration complete. Verify counts and run a restore drill before production use.');
