import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/recurring-kajian - List all recurring kajian
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') !== 'false'; // Default: only active
        const city = searchParams.get('city');

        let sql = 'SELECT * FROM recurring_kajian WHERE 1=1';
        const params: any[] = [];

        if (activeOnly) {
            sql += ' AND isActive = 1';
        }

        if (city) {
            sql += ' AND city = ?';
            params.push(city);
        }

        sql += ' ORDER BY city, masjid, day_of_week';

        const result = await db.execute({ sql, args: params });

        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching recurring kajian:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recurring kajian', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/recurring-kajian - Create new recurring kajian
export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await requireAdminSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = session.username;

        const data = await request.json();

        // Validate required fields
        if (!data.masjid || !data.city || !data.pemateri || !data.pattern ||
            data.day_of_week === undefined || !data.waktu_mulai) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate pattern
        const validPatterns = ['weekly', 'biweekly', 'monthly', 'monthly_odd', 'monthly_even', 'custom'];
        if (!validPatterns.includes(data.pattern)) {
            return NextResponse.json(
                { error: 'Invalid recurring pattern' },
                { status: 400 }
            );
        }

        // Validate day_of_week
        if (data.day_of_week < 0 || data.day_of_week > 6) {
            return NextResponse.json(
                { error: 'Invalid day_of_week (must be 0-6)' },
                { status: 400 }
            );
        }

        // For monthly patterns, validate week_of_month
        if (data.pattern === 'monthly' && (!data.week_of_month || data.week_of_month < 1 || data.week_of_month > 4)) {
            return NextResponse.json(
                { error: 'week_of_month is required for monthly pattern (1-4)' },
                { status: 400 }
            );
        }

        // Custom pattern requires week_of_month (should be a bitmask > 0)
        if (data.pattern === 'custom' && (!data.week_of_month || data.week_of_month < 1)) {
            return NextResponse.json(
                { error: 'week_of_month is required for custom pattern (bitmask)' },
                { status: 400 }
            );
        }

        const result = await db.execute({
            sql: `INSERT INTO recurring_kajian (
        masjid, address, city, pemateri, pemateri2, pemateri3, tema,
        pattern, day_of_week, week_of_month,
        waktu_mulai, waktu_selesai, cp, cp2, cp3,
        gmapsUrl, lat, lng,
        imageUrl, catatan, linkInfo,
        khususAkhwat, isOnline, isKidsFriendly,
        createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                data.masjid,
                data.address || null,
                data.city,
                data.pemateri,
                data.pemateri2 || null,
                data.pemateri3 || null,
                data.tema || null,
                data.pattern,
                data.day_of_week,
                data.week_of_month || null,
                data.waktu_mulai,
                data.waktu_selesai || 'Selesai',
                data.cp || null,
                data.cp2 || null,
                data.cp3 || null,
                data.gmapsUrl || null,
                data.lat || null,
                data.lng || null,
                data.imageUrl || null,
                data.catatan || null,
                data.linkInfo || null,
                data.khususAkhwat ? 1 : 0,
                data.isOnline ? 1 : 0,
                data.isKidsFriendly ? 1 : 0,
                username
            ]
        });

        return NextResponse.json({
            success: true,
            id: Number(result.lastInsertRowid),
            message: 'Recurring kajian created successfully'
        });
    } catch (error: any) {
        console.error('Error creating recurring kajian:', error);
        return NextResponse.json(
            { error: 'Failed to create recurring kajian', details: error.message },
            { status: 500 }
        );
    }
}
