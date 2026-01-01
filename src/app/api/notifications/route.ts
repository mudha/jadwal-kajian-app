import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await db.execute({
            sql: 'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?',
            args: [limit]
        });

        // Format relative time (optional, can be done in frontend too)
        const notifications = result.rows.map(row => ({
            ...row,
            // You might want to format the date here or just send raw timestamp
        }));

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, title, message, target_audience } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        const validTypes = ['info', 'reminder', 'recommendation'];
        const notifType = validTypes.includes(type) ? type : 'info'; // default fallback

        await db.execute({
            sql: `INSERT INTO notifications (type, title, message, target_audience) VALUES (?, ?, ?, ?)`,
            args: [notifType, title, message, target_audience || 'all']
        });

        return NextResponse.json({ success: true, message: 'Notification created' }, { status: 201 });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
