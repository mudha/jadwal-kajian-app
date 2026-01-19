import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

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
                { error: 'Password minimal 6 karakter' },
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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now

        // Insert to contributor_applications table with verification fields
        await db.execute({
            sql: `INSERT INTO contributor_applications 
                  (username, email, password, fullName, region, city, phoneNumber, motivation, 
                   email_verified, verification_token, token_expires_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                username,
                email,
                hashedPassword,
                fullName,
                region,
                city || null,
                phoneNumber || null,
                motivation || null,
                0, // email_verified = false
                verificationToken,
                tokenExpiresAt
            ]
        });

        // Send verification email
        const emailResult = await sendVerificationEmail({
            to: email,
            fullName,
            verificationToken
        });

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // Don't fail registration, just log the error
        }

        return NextResponse.json({
            message: 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.',
            status: 'pending_verification',
            email
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
