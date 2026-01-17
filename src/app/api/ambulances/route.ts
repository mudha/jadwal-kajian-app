import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all ambulances with optional region filter
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('region');

        let query = 'SELECT * FROM ambulances ORDER BY region, city, name';
        const args: any[] = [];

        if (region) {
            query = 'SELECT * FROM ambulances WHERE region = ? ORDER BY city, name';
            args.push(region);
        }

        const result = await db.execute({ sql: query, args });

        // Parse contacts JSON for each ambulance
        const ambulances = result.rows.map((row: any) => ({
            ...row,
            contacts: JSON.parse(row.contacts || '[]')
        }));

        return NextResponse.json(ambulances);
    } catch (error) {
        console.error('Failed to fetch ambulances:', error);
        return NextResponse.json({ error: 'Failed to fetch ambulances' }, { status: 500 });
    }
}

// POST create new ambulance
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, region, city, address, contacts, notes } = body;

        if (!name || !region || !contacts || contacts.length === 0) {
            return NextResponse.json(
                { error: 'Name, region, and at least one contact are required' },
                { status: 400 }
            );
        }

        const result = await db.execute({
            sql: `INSERT INTO ambulances (name, region, city, address, contacts, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            args: [name, region, city || null, address || null, JSON.stringify(contacts), notes || null]
        });

        return NextResponse.json({
            success: true,
            id: result.lastInsertRowid,
            message: 'Ambulance service added successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create ambulance:', error);
        return NextResponse.json({ error: 'Failed to create ambulance service' }, { status: 500 });
    }
}
