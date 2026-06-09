import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createAdmin() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD;
    const role = process.env.ADMIN_ROLE || 'SUPER_ADMIN';
    const fullName = process.env.ADMIN_FULL_NAME || 'Super Admin';
    const email = process.env.ADMIN_EMAIL || 'admin@portalkajian.online';

    if (!password) {
        console.error('Error: ADMIN_PASSWORD environment variable must be set.');
        process.exit(1);
    }

    try {
        // 1. Check if user already exists in DB
        const check = await db.execute({
            sql: "SELECT * FROM admins WHERE username = ?",
            args: [username]
        });

        if (check.rows.length > 0) {
            console.log(`User '${username}' already exists in database with ID: ${check.rows[0].id}`);
            // Optional: Update password if needed, but for now just inform
            return;
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert User
        const result = await db.execute({
            sql: 'INSERT INTO admins (username, password, email, role, fullName) VALUES (?, ?, ?, ?, ?)',
            args: [username, hashedPassword, email, role, fullName],
        });

        console.log(`✅ Admin user created successfully!`);
        console.log(`Username: ${username}`);
        console.log(`Role: ${role}`);

    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdmin();
