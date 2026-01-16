
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function testRegister() {
    const username = 'testuser_' + Date.now();
    const email = 'test' + Date.now() + '@example.com';
    const password = 'password123';
    const fullName = 'Test User';
    const region = 'Jakarta';
    const city = 'Jakarta Selatan';
    const phoneNumber = '08123456789';
    const motivation = 'Motivation text';

    try {
        console.log('Testing registration for:', username);

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed');

        await db.execute({
            sql: `INSERT INTO contributor_applications 
                  (username, email, password, fullName, region, city, phoneNumber, motivation) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [username, email, hashedPassword, fullName, region, city, phoneNumber, motivation]
        });

        console.log('Insert successful!');

        // Cleanup
        await db.execute({
            sql: 'DELETE FROM contributor_applications WHERE username = ?',
            args: [username]
        });
        console.log('Cleanup successful!');

    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

testRegister().catch(console.error);
