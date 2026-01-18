import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/recurring-kajian/[id] - Get single recurring kajian
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await db.execute({
            sql: 'SELECT * FROM recurring_kajian WHERE id = ?',
            args: [id]
        });

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Recurring kajian not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error fetching recurring kajian:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recurring kajian', details: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/recurring-kajian/[id] - Update recurring kajian
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        // Build dynamic update query
        const updates: string[] = [];
        const args: any[] = [];

        if (data.masjid !== undefined) { updates.push('masjid = ?'); args.push(data.masjid); }
        if (data.address !== undefined) { updates.push('address = ?'); args.push(data.address); }
        if (data.city !== undefined) { updates.push('city = ?'); args.push(data.city); }
        if (data.pemateri !== undefined) { updates.push('pemateri = ?'); args.push(data.pemateri); }
        if (data.pemateri2 !== undefined) { updates.push('pemateri2 = ?'); args.push(data.pemateri2); }
        if (data.pemateri3 !== undefined) { updates.push('pemateri3 = ?'); args.push(data.pemateri3); }
        if (data.tema !== undefined) { updates.push('tema = ?'); args.push(data.tema); }
        if (data.pattern !== undefined) { updates.push('pattern = ?'); args.push(data.pattern); }
        if (data.day_of_week !== undefined) { updates.push('day_of_week = ?'); args.push(data.day_of_week); }
        if (data.week_of_month !== undefined) { updates.push('week_of_month = ?'); args.push(data.week_of_month); }
        if (data.waktu_mulai !== undefined) { updates.push('waktu_mulai = ?'); args.push(data.waktu_mulai); }
        if (data.waktu_selesai !== undefined) { updates.push('waktu_selesai = ?'); args.push(data.waktu_selesai); }
        if (data.cp !== undefined) { updates.push('cp = ?'); args.push(data.cp); }
        if (data.cp2 !== undefined) { updates.push('cp2 = ?'); args.push(data.cp2); }
        if (data.cp3 !== undefined) { updates.push('cp3 = ?'); args.push(data.cp3); }
        if (data.gmapsUrl !== undefined) { updates.push('gmapsUrl = ?'); args.push(data.gmapsUrl); }
        if (data.lat !== undefined) { updates.push('lat = ?'); args.push(data.lat); }
        if (data.lng !== undefined) { updates.push('lng = ?'); args.push(data.lng); }
        if (data.imageUrl !== undefined) { updates.push('imageUrl = ?'); args.push(data.imageUrl); }
        if (data.catatan !== undefined) { updates.push('catatan = ?'); args.push(data.catatan); }
        if (data.linkInfo !== undefined) { updates.push('linkInfo = ?'); args.push(data.linkInfo); }
        if (data.khususAkhwat !== undefined) { updates.push('khususAkhwat = ?'); args.push(data.khususAkhwat ? 1 : 0); }
        if (data.isOnline !== undefined) { updates.push('isOnline = ?'); args.push(data.isOnline ? 1 : 0); }
        if (data.isKidsFriendly !== undefined) { updates.push('isKidsFriendly = ?'); args.push(data.isKidsFriendly ? 1 : 0); }
        if (data.isActive !== undefined) { updates.push('isActive = ?'); args.push(data.isActive ? 1 : 0); }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        args.push(id);

        const sql = `UPDATE recurring_kajian SET ${updates.join(', ')} WHERE id = ?`;
        await db.execute({ sql, args });

        return NextResponse.json({
            success: true,
            message: 'Recurring kajian updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating recurring kajian:', error);
        return NextResponse.json(
            { error: 'Failed to update recurring kajian', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/recurring-kajian/[id] - Soft delete (deactivate)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Soft delete by setting isActive = 0
        await db.execute({
            sql: 'UPDATE recurring_kajian SET isActive = 0 WHERE id = ?',
            args: [id]
        });

        return NextResponse.json({
            success: true,
            message: 'Recurring kajian deactivated successfully'
        });
    } catch (error: any) {
        console.error('Error deleting recurring kajian:', error);
        return NextResponse.json(
            { error: 'Failed to delete recurring kajian', details: error.message },
            { status: 500 }
        );
    }
}
