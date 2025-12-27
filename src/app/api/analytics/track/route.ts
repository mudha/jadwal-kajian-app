import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { path } = body;

        // Get IP
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        // Anonymize IP (SHA-256 hash)
        const consistentIpHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 12);

        // Get User Agent
        const uaString = req.headers.get('user-agent') || '';
        const parser = new UAParser(uaString);
        const result = parser.getResult();

        const browser = `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim();
        const os = `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim();
        const deviceType = result.device.type || (result.device.model ? 'Mobile' : 'Desktop');

        // Get Geo (Vercel Headers)
        const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
        const country = req.headers.get('x-vercel-ip-country') || 'Unknown';

        await db.execute({
            sql: `INSERT INTO analytics (path, ip_hash, ua_browser, ua_os, ua_device, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [path, consistentIpHash, browser, os, deviceType, city, country]
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Track Error:', e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
