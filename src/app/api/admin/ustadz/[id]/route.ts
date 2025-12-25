import { NextResponse } from 'next/server';
import db from '@/lib/db';

// PUT - Update ustadz name across all kajian
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { name } = await request.json();
        const { id } = await context.params;
        const oldName = decodeURIComponent(id);

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Update all kajian with this ustadz name
        await db.execute({
            sql: 'UPDATE kajian SET pemateri = ? WHERE pemateri = ?',
            args: [name, oldName],
        });

        return NextResponse.json({ message: 'Ustadz updated successfully' });
    } catch (error) {
        console.error('Error updating ustadz:', error);
        return NextResponse.json({ error: 'Failed to update ustadz' }, { status: 500 });
    }
}

// DELETE - Remove ustadz (set to empty in kajian)
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const ustadzName = decodeURIComponent(id);

        // Delete all kajian by this ustadz
        await db.execute({
            sql: 'DELETE FROM kajian WHERE pemateri = ?',
            args: [ustadzName],
        });

        return NextResponse.json({ message: 'Ustadz deleted successfully' });
    } catch (error) {
        console.error('Error deleting ustadz:', error);
        return NextResponse.json({ error: 'Failed to delete ustadz' }, { status: 500 });
    }
}
