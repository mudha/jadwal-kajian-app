import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

// Helper function to parse Indonesian date format to ISO date
function parseIndonesianDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    try {
        // Format: "Ahad, 10 Februari 2026" or variations
        const months: { [key: string]: number } = {
            'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
            'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
            'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
        };

        // Extract day, month name, and year
        const parts = dateStr.toLowerCase().replace(/,/g, '').split(/\s+/);
        const day = parseInt(parts.find(p => /^\d{1,2}$/.test(p)) || '0');
        const monthName = parts.find(p => months[p] !== undefined);
        const year = parseInt(parts.find(p => /^\d{4}$/.test(p)) || '0');

        if (day && monthName && year) {
            return new Date(year, months[monthName], day);
        }
    } catch (e) {
        console.error('Error parsing date:', dateStr, e);
    }

    return null;
}

// Helper function to extract Cloudinary public_id from URL
function extractCloudinaryPublicId(url: string): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;

        const pathAfterUpload = parts[1];
        // Remove transformations (e.g., v1234567890/)
        const withoutVersion = pathAfterUpload.replace(/^v\d+\//, '');

        // Remove file extension
        const publicId = withoutVersion.replace(/\.[^.]+$/, '');

        return publicId;
    } catch (e) {
        console.error('Error extracting public_id from URL:', url, e);
        return null;
    }
}

// Helper function to delete image from Cloudinary
async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
    const publicId = extractCloudinaryPublicId(imageUrl);
    if (!publicId) {
        console.warn('Could not extract public_id from:', imageUrl);
        return false;
    }

    try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            console.warn('Cloudinary credentials not configured, skipping image deletion');
            return false;
        }

        // Generate signature for authenticated deletion
        const timestamp = Math.floor(Date.now() / 1000);
        const crypto = require('crypto');
        const signature = crypto
            .createHash('sha1')
            .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
            .digest('hex');

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('signature', signature);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            {
                method: 'POST',
                body: formData
            }
        );

        const result = await response.json();
        console.log('Cloudinary deletion result:', result);

        return result.result === 'ok' || result.result === 'not found';
    } catch (e) {
        console.error('Error deleting from Cloudinary:', e);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check admin authentication
        const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get threshold from request body (default: 1 month)
        const body = await request.json().catch(() => ({}));
        const thresholdMonths = body.thresholdMonths || 1;

        // Calculate cutoff date (1 month ago from now)
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - thresholdMonths);

        console.log(`🗄️ Starting auto-archive for kajian older than ${thresholdMonths} month(s)...`);
        console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}`);

        // Find kajian that are old and not already archived
        const result = await db.execute({
            sql: 'SELECT id, date, imageUrl, masjid FROM kajian WHERE archivedAt IS NULL',
            args: []
        });

        const kajianToArchive = result.rows.filter(row => {
            const kajianDate = parseIndonesianDate(row.date as string);
            if (!kajianDate) return false;
            return kajianDate < cutoffDate;
        });

        console.log(`📊 Found ${kajianToArchive.length} kajian to archive`);

        let archived = 0;
        let imagesDeleted = 0;
        const errors: string[] = [];

        for (const kajian of kajianToArchive) {
            try {
                const now = new Date().toISOString();
                let imageDeletedAt = null;

                // Delete image from Cloudinary if it exists
                if (kajian.imageUrl && typeof kajian.imageUrl === 'string') {
                    const deleted = await deleteFromCloudinary(kajian.imageUrl);
                    if (deleted) {
                        imageDeletedAt = now;
                        imagesDeleted++;
                        console.log(`✓ Deleted image for kajian #${kajian.id}`);
                    }
                }

                // Update database to mark as archived
                await db.execute({
                    sql: `UPDATE kajian 
                          SET archivedAt = ?, 
                              imageDeletedAt = ?,
                              imageUrl = NULL 
                          WHERE id = ?`,
                    args: [now, imageDeletedAt, kajian.id]
                });

                archived++;
            } catch (e) {
                const errorMsg = `Failed to archive kajian #${kajian.id}: ${e}`;
                console.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        console.log(`✅ Archived ${archived} kajian, deleted ${imagesDeleted} images`);

        return NextResponse.json({
            success: true,
            archived,
            imagesDeleted,
            cutoffDate: cutoffDate.toISOString(),
            thresholdMonths,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Auto-archive error:', error);
        return NextResponse.json(
            { error: 'Failed to auto-archive kajian', details: String(error) },
            { status: 500 }
        );
    }
}

// GET endpoint to preview what would be archived (dry run)
export async function GET(request: NextRequest) {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const thresholdMonths = parseInt(searchParams.get('thresholdMonths') || '1');

        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - thresholdMonths);

        const result = await db.execute({
            sql: 'SELECT id, date, imageUrl, masjid, city FROM kajian WHERE archivedAt IS NULL',
            args: []
        });

        const kajianToArchive = result.rows.filter(row => {
            const kajianDate = parseIndonesianDate(row.date as string);
            if (!kajianDate) return false;
            return kajianDate < cutoffDate;
        }).map(row => ({
            id: row.id,
            masjid: row.masjid,
            city: row.city,
            date: row.date,
            hasImage: !!row.imageUrl
        }));

        return NextResponse.json({
            cutoffDate: cutoffDate.toISOString(),
            thresholdMonths,
            count: kajianToArchive.length,
            preview: kajianToArchive.slice(0, 10),
            totalImages: kajianToArchive.filter(k => k.hasImage).length
        });

    } catch (error) {
        console.error('Preview error:', error);
        return NextResponse.json(
            { error: 'Failed to preview archive', details: String(error) },
            { status: 500 }
        );
    }
}
