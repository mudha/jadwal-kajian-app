import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/verify-email
 * 
 * Verifies email using token from registration email
 */
export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Find user with this token
        const result = await db.execute({
            sql: `SELECT id, email, fullName, verification_token, token_expires_at, email_verified 
                  FROM contributor_applications 
                  WHERE verification_token = ?`,
            args: [token]
        });

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Token tidak valid atau sudah expired' },
                { status: 400 }
            );
        }

        const user = result.rows[0];

        // Check if already verified
        if (user.email_verified === 1) {
            return NextResponse.json(
                { message: 'Email sudah diverifikasi sebelumnya', alreadyVerified: true },
                { status: 200 }
            );
        }

        // Check token expiration
        const now = Date.now();
        if (user.token_expires_at && now > Number(user.token_expires_at)) {
            return NextResponse.json(
                { error: 'Token sudah expired. Silakan daftar ulang.' },
                { status: 400 }
            );
        }

        // Verify the email
        await db.execute({
            sql: `UPDATE contributor_applications 
                  SET email_verified = 1, 
                      verification_token = NULL, 
                      token_expires_at = NULL 
                  WHERE id = ?`,
            args: [user.id]
        });

        return NextResponse.json({
            success: true,
            message: 'Email berhasil diverifikasi! Akun Anda akan segera diaktifkan oleh admin.',
            email: user.email
        }, { status: 200 });

    } catch (error: any) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan sistem', details: error.message },
            { status: 500 }
        );
    }
}
