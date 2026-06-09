import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { seedAmbulances } from '@/lib/ambulance-seed';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await seedAmbulances(db);
        return NextResponse.json({ success: true, message: 'Ambulance data seeded successfully' });
    } catch (error) {
        console.error('Failed to seed ambulances:', error);
        return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
    }
}
