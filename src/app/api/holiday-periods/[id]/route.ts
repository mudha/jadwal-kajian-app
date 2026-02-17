import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/holiday-periods/[id]
 * Update a holiday period
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { name, start_date, end_date, description, isActive } = body;

        const updates: string[] = [];
        const args: any[] = [];

        if (name !== undefined) {
            updates.push('name = ?');
            args.push(name);
        }

        if (start_date !== undefined) {
            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(start_date)) {
                return NextResponse.json(
                    { error: 'Invalid start_date format. Use YYYY-MM-DD' },
                    { status: 400 }
                );
            }
            updates.push('start_date = ?');
            args.push(start_date);
        }

        if (end_date !== undefined) {
            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(end_date)) {
                return NextResponse.json(
                    { error: 'Invalid end_date format. Use YYYY-MM-DD' },
                    { status: 400 }
                );
            }
            updates.push('end_date = ?');
            args.push(end_date);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            args.push(description);
        }

        if (isActive !== undefined) {
            updates.push('isActive = ?');
            args.push(isActive ? 1 : 0);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        args.push(id);

        const sql = `UPDATE holiday_periods SET ${updates.join(', ')} WHERE id = ?`;
        await db.execute({ sql, args });

        return NextResponse.json({
            success: true,
            message: 'Holiday period updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating holiday period:', error);
        return NextResponse.json(
            { error: 'Failed to update holiday period', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/holiday-periods/[id]
 * Delete a holiday period
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        await db.execute({
            sql: 'DELETE FROM holiday_periods WHERE id = ?',
            args: [id]
        });

        return NextResponse.json({
            success: true,
            message: 'Holiday period deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting holiday period:', error);
        return NextResponse.json(
            { error: 'Failed to delete holiday period', details: error.message },
            { status: 500 }
        );
    }
}
