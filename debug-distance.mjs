import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'local.db');
const db = new Database(dbPath);

console.log('Checking kajian coordinates...\n');

const results = db.prepare(`
  SELECT id, masjid, city, lat, lng, gmapsUrl 
  FROM kajian 
  WHERE city LIKE '%Surabaya%' OR masjid LIKE '%Ensiklopedia%' OR masjid LIKE '%Sirah%'
  LIMIT 10
`).all();

console.log(JSON.stringify(results, null, 2));

db.close();
