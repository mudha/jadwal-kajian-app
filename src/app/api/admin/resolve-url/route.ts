
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await requireAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL to prevent SSRF (basic check)
        try {
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Perform HEAD request to get final URL
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const finalUrl = response.url;

        return NextResponse.json({
            originalUrl: url,
            resolvedUrl: finalUrl
        });

    } catch (error: any) {
        console.error('Error resolving URL:', error);
        return NextResponse.json({ error: 'Failed to resolve URL: ' + error.message }, { status: 500 });
    }
}
