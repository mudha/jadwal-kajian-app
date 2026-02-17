import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/holiday-periods
 * List all holiday periods
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';

        let sql = 'SELECT * FROM holiday_periods';
        if (activeOnly) {
            sql += ' WHERE isActive = 1';
        }
        sql += ' ORDER BY start_date DESC';

        const result = await db.execute({
            sql,
            args: []
        });

        return NextResponse.json({
            success: true,
            periods: result.rows
        });
    } catch (error: any) {
        console.error('Error fetching holiday periods:', error);
        return NextResponse.json(
            { error: 'Failed to fetch holiday periods', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/holiday-periods
 * Create a new holiday period
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, start_date, end_date, description } = body;

        if (!name || !start_date || !end_date) {
            return NextResponse.json(
                { error: 'Missing required fields: name, start_date, end_date' },
                { status: 400 }
            );
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
            return NextResponse.json(
                { error: 'Invalid date format. Use YYYY-MM-DD' },
                { status: 400 }
            );
        }

        // Validate start_date is before end_date
        if (start_date > end_date) {
            return NextResponse.json(
                { error: 'start_date must be before or equal to end_date' },
                { status: 400 }
            );
        }

        const result = await db.execute({
            sql: `INSERT INTO holiday_periods (name, start_date, end_date, description) 
                  VALUES (?, ?, ?, ?)`,
            args: [name, start_date, end_date, description || null]
        });

        return NextResponse.json({
            success: true,
            message: 'Holiday period created successfully',
            id: result.lastInsertRowid ? Number(result.lastInsertRowid) : null
        });
    } catch (error: any) {
        console.error('Error creating holiday period:', error);
        return NextResponse.json(
            { error: 'Failed to create holiday period', details: error.message },
            { status: 500 }
        );
    }
}
