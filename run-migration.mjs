import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'local.db');
const db = new Database(dbPath);

console.log('Running contributor applications migration...');

try {
    const migrationSQL = fs.readFileSync(
        join(__dirname, 'migrations', 'add_contributor_applications.sql'),
        'utf-8'
    );

    db.exec(migrationSQL);

    console.log('Migration completed successfully!');

    const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='contributor_applications'"
    ).all();

    if (tables.length > 0) {
        console.log('contributor_applications table created');
    }

    const adminSchema = db.prepare("PRAGMA table_info(admins)").all();
    const hasAssignedRegion = adminSchema.some(col => col.name === 'assignedRegion');
    const hasFullName = adminSchema.some(col => col.name === 'fullName');

    if (hasAssignedRegion) console.log('assignedRegion column added to admins');
    if (hasFullName) console.log('fullName column added to admins');

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
