import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST - Register new admin
export async function POST(request: Request) {
    try {
        const { username, password, email, secretKey } = await request.json();

        // Validate secret key (you should set this in environment variables)
        const ADMIN_SECRET_KEY = process.env.ADMIN_REGISTRATION_SECRET || 'kajian-sunnah-2024';

        if (secretKey !== ADMIN_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Kode rahasia tidak valid' },
                { status: 403 }
            );
        }

        if (!username || !password || !email) {
            return NextResponse.json(
                { error: 'Username, password, dan email harus diisi' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existing = await db.execute({
            sql: 'SELECT id FROM admins WHERE username = ?',
            args: [username],
        });

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: 'Username sudah terdaftar' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin
        await db.execute({
            sql: `INSERT INTO admins (username, password, email, createdAt) 
                  VALUES (?, ?, ?, datetime('now'))`,
            args: [username, hashedPassword, email],
        });

        return NextResponse.json({
            message: 'Admin berhasil didaftarkan',
            username,
        });
    } catch (error) {
        console.error('Error registering admin:', error);
        return NextResponse.json(
            { error: 'Gagal mendaftarkan admin' },
            { status: 500 }
        );
    }
}
