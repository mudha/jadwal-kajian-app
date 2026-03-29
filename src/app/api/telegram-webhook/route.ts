import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { parseWithGemini } from '@/lib/ai-parser';

// In a real app, you'd want to verify a secret token from Telegram
// to prevent unauthorized POST requests to this endpoint.
// For now, we'll use a simple query parameter check.
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'portalkajian_bot_secret_123';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Basic Telegram message structure
        // Depending on how you send it from your script, adjust this.
        // We assume the script sends: { message_id: '...', text: '...', source_name: 'channel_id' }
        const { message_id, text, source_name } = body;

        if (!text) {
            return NextResponse.json({ message: 'No text provided, ignored' }, { status: 200 });
        }

        console.log(`[Telegram Webhook] Received message from ${source_name || 'unknown'}`);

        // 1. Process text with Gemini AI using the app's robust parser
        let extractedData = [];
        try {
            // parseWithGemini uses NEXT_PUBLIC_GEMINI_API_KEY from the server environment
            extractedData = await parseWithGemini(text);
        } catch (e: any) {
            console.error('AI Response Parsing Error from Telegram Webhook:', e.message);
            // Even if AI completely fails formatting, we can still save the raw text as a draft for manual review
            extractedData = [{}] as any[];
        }

        // 2. Save to database as draft
        for (const item of extractedData) {
            const {
                region = 'INDONESIA',
                city = '',
                masjid = '',
                address = '',
                pemateri = '',
                tema = '',
                waktu = '',
                date = '',
                cp = '',
                cp2 = '',
                cp3 = '',
                catatan = ''
            } = item;

            const isOnline = city.toLowerCase() === 'online' || masjid.toLowerCase().includes('zoom') || masjid.toLowerCase().includes('live streaming') ? 1 : 0;

            await db.execute({
                sql: `
                  INSERT INTO kajian_drafts 
                  (source, source_id, raw_text, region, city, masjid, address, pemateri, tema, waktu, date, cp, cp2, cp3, catatan, isOnline, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                `,
                args: [
                    source_name || 'telegram',
                    message_id || Date.now().toString(),
                    text,
                    region,
                    city,
                    masjid,
                    address,
                    pemateri,
                    tema,
                    waktu,
                    date,
                    cp,
                    cp2,
                    cp3,
                    catatan,
                    isOnline
                ]
            });
        }

        return NextResponse.json({ success: true, count: extractedData.length }, { status: 200 });

    } catch (error: any) {
        console.error('Telegram Webhook Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
