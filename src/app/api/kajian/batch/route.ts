import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json([]);
        }

        // Validate IDs are numbers
        const validIds = ids.filter(id => typeof id === 'number' || !isNaN(Number(id)));

        if (validIds.length === 0) {
            return NextResponse.json([]);
        }

        // Construct query with dynamic placeholders
        const placeholders = validIds.map(() => '?').join(',');
        const sql = `SELECT * FROM kajian WHERE id IN (${placeholders}) ORDER BY created_at DESC`; // Or order by date? Let's use date.
        // Wait, 'created_at' might not exist in schema. Use 'id DESC' or 'date DESC'.
        // Let's check schema/parser.ts from previous context or just assume standard fields.
        // Checking route.ts earlier: SELECT * FROM kajian ORDER BY id DESC. So id is safe.

        // Actually better to sort by Event Date if possible, but let's stick to ID DESC or preserve order?
        // Usually order doesn't matter much for batch fetch, frontend will sort.

        // Re-checking db.execute signature. current db.ts wrapper (from memory/previous steps) uses execute({ sql, args }).
        // But if args is array, it might be fine.

        // Wait, better to assume standard 'id' field used in previous fetches.

        const result = await db.execute({
            sql: `SELECT * FROM kajian WHERE id IN (${placeholders})`,
            args: validIds
        });

        // Convert booleans like in main GET API
        const rows = result.rows.map(row => ({
            ...row,
            khususAkhwat: !!row.khususAkhwat
        }));

        return NextResponse.json(rows);

    } catch (error) {
        console.error('Batch Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch batch data' }, { status: 500 });
    }
}
