import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'production'
    ? './kajian.db'
    : path.join(process.cwd(), 'kajian.db');

const db = new Database(dbPath);

console.log('Running migrations for recurring kajian...\n');

// Migration 1: Create recurring_kajian table
console.log('1. Creating recurring_kajian table...');
const migration1 = fs.readFileSync(
    path.join(process.cwd(), 'migrations', '001_create_recurring_kajian.sql'),
    'utf8'
);
db.exec(migration1);
console.log('✓ recurring_kajian table created\n');

// Migration 2: Add recurring fields to kajian table
console.log('2. Adding recurring fields to kajian table...');
const migration2 = fs.readFileSync(
    path.join(process.cwd(), 'migrations', '002_add_recurring_fields_to_kajian.sql'),
    'utf8'
);
db.exec(migration2);
console.log('✓ Recurring fields added to kajian table\n');

console.log('✅ All migrations completed successfully!');
db.close();
