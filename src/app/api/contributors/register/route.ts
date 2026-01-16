import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, email, password, fullName, region, city, phoneNumber, motivation } = await request.json();

        // Validation
        if (!username || !email || !password || !fullName || !region) {
            return NextResponse.json(
                { error: 'Fields required: username, email, password, fullName, region' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password minimal  6 karakter' },
                { status: 400 }
            );
        }

        // Check if username or email already exists
        const existing = await db.execute({
            sql: 'SELECT id FROM contributor_applications WHERE username = ? OR email = ?',
            args: [username, email]
        });

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: 'Username atau email sudah terdaftar' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert to contributor_applications table
        await db.execute({
            sql: `INSERT INTO contributor_applications 
                  (username, email, password, fullName, region, city, phoneNumber, motivation) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [username, email, hashedPassword, fullName, region, city || null, phoneNumber || null, motivation || null]
        });

        return NextResponse.json({
            message: 'Pendaftaran berhasil! Silakan tunggu persetujuan admin (maks 24 jam).',
            status: 'pending'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration error details:', error);
        return NextResponse.json(
            {
                error: 'Terjadi kesalahan sistem saat mendaftar',
                details: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
