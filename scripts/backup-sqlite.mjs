import { DatabaseSync } from 'node:sqlite';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { config } from '../api/config.mjs';

const target = resolve(process.argv[2] || `./backups/pakdasht-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`);
await mkdir(dirname(target), { recursive: true });
const db = new DatabaseSync(config.dbFile, { readOnly: true });
db.exec(`VACUUM INTO '${target.replaceAll("'", "''")}'`);
db.close();
console.log(`SQLite backup created: ${target}`);
