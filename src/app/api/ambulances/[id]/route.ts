import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT update ambulance
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const params = await context.params;
        const id = params.id;
        const body = await request.json();
        const { name, region, city, address, contacts, notes } = body;

        if (!name || !region || !contacts || contacts.length === 0) {
            return NextResponse.json(
                { error: 'Name, region, and at least one contact are required' },
                { status: 400 }
            );
        }

        await db.execute({
            sql: `UPDATE ambulances 
            SET name = ?, region = ?, city = ?, address = ?, contacts = ?, notes = ?, updated_at = datetime('now')
            WHERE id = ?`,
            args: [name, region, city || null, address || null, JSON.stringify(contacts), notes || null, id]
        });

        return NextResponse.json({
            success: true,
            message: 'Ambulance service updated successfully'
        });
    } catch (error) {
        console.error('Failed to update ambulance:', error);
        return NextResponse.json({ error: 'Failed to update ambulance service' }, { status: 500 });
    }
}

// DELETE ambulance
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const params = await context.params;
        const id = params.id;

        await db.execute({
            sql: 'DELETE FROM ambulances WHERE id = ?',
            args: [id]
        });

        return NextResponse.json({
            success: true,
            message: 'Ambulance service deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete ambulance:', error);
        return NextResponse.json({ error: 'Failed to delete ambulance service' }, { status: 500 });
    }
}
