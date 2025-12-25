import { NextResponse } from 'next/server';
import db from '@/lib/db';

// PUT - Update masjid data across all kajian
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { name, city, address, gmapsUrl, lat, lng } = await request.json();
        const { id } = await context.params;
        const oldName = decodeURIComponent(id);

        if (!name || !city) {
            return NextResponse.json({ error: 'Name and city are required' }, { status: 400 });
        }

        // Update all kajian with this masjid name
        await db.execute({
            sql: 'UPDATE kajian SET masjid = ?, city = ?, address = ?, gmapsUrl = ?, lat = ?, lng = ? WHERE masjid = ?',
            args: [name, city, address || '', gmapsUrl || '', lat || null, lng || null, oldName],
        });

        return NextResponse.json({ message: 'Masjid updated successfully' });
    } catch (error) {
        console.error('Error updating masjid:', error);
        return NextResponse.json({ error: 'Failed to update masjid' }, { status: 500 });
    }
}

// DELETE - Remove masjid (delete all kajian at this masjid)
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const masjidName = decodeURIComponent(id);

        // Delete all kajian at this masjid
        await db.execute({
            sql: 'DELETE FROM kajian WHERE masjid = ?',
            args: [masjidName],
        });

        return NextResponse.json({ message: 'Masjid deleted successfully' });
    } catch (error) {
        console.error('Error deleting masjid:', error);
        return NextResponse.json({ error: 'Failed to delete masjid' }, { status: 500 });
    }
}
