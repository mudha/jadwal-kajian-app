import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import db from '@/lib/db';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTRIBUTOR';

export interface AdminSession {
    isLoggedIn: true;
    id: number;
    username: string;
    role: AdminRole;
    fullName?: string | null;
}

export const ADMIN_SESSION_COOKIE = 'admin_session';

function getSessionSecret() {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_REGISTRATION_SECRET;

    if (secret) return secret;
    if (process.env.NODE_ENV !== 'production') return 'local-dev-session-secret';

    throw new Error('ADMIN_SESSION_SECRET is required in production');
}

function base64url(input: string) {
    return Buffer.from(input).toString('base64url');
}

function fromBase64url(input: string) {
    return Buffer.from(input, 'base64url').toString('utf8');
}

function signPayload(payload: string) {
    return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function verifySignature(payload: string, signature: string) {
    const expected = signPayload(payload);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (actualBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function serializeAdminSession(session: AdminSession) {
    const payload = base64url(JSON.stringify(session));
    const signature = signPayload(payload);
    return `${payload}.${signature}`;
}

function parseSignedSession(value: string): AdminSession | null {
    const [payload, signature] = value.split('.');
    if (!payload || !signature || !verifySignature(payload, signature)) return null;

    try {
        const parsed = JSON.parse(fromBase64url(payload));
        if (!parsed?.isLoggedIn || !parsed?.id || !parsed?.username) return null;
        return parsed as AdminSession;
    } catch {
        return null;
    }
}

async function hydrateSession(session: AdminSession): Promise<AdminSession | null> {
    const result = await db.execute({
        sql: 'SELECT id, username, role, fullName FROM admins WHERE id = ? AND username = ? LIMIT 1',
        args: [session.id, session.username],
    });

    const admin = result.rows[0];
    if (!admin) return null;

    return {
        isLoggedIn: true,
        id: Number(admin.id),
        username: String(admin.username),
        role: (admin.role as AdminRole) || 'ADMIN',
        fullName: (admin.fullName as string | null) || null,
    };
}

export async function getAdminSession(): Promise<AdminSession | null> {
    const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE);
    if (!sessionCookie?.value) return null;

    const parsed = parseSignedSession(sessionCookie.value);
    if (!parsed) return null;

    return hydrateSession(parsed);
}

export async function requireAdminSession(allowedRoles?: AdminRole[]) {
    const session = await getAdminSession();
    if (!session) return null;

    if (allowedRoles && !allowedRoles.includes(session.role)) {
        return null;
    }

    return session;
}
