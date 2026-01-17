import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { seedAmbulances } from '@/lib/ambulance-seed';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        await seedAmbulances(db);
        return NextResponse.json({ success: true, message: 'Ambulance data seeded successfully' });
    } catch (error) {
        console.error('Failed to seed ambulances:', error);
        return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
    }
}
