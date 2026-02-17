import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateRecurringDates } from '@/lib/recurring-generator';
import { formatIndoDate } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

/**
 * POST /api/recurring-kajian/generate
 * 
 * Generates kajian instances from recurring templates
 * Generates for the next N months (default: 1.5 months ≈ 6 weeks)
 */
export async function POST(request: Request) {
    try {
        const { months = 1.5 } = await request.json().catch(() => ({}));

        // Get all active recurring kajian
        const recurringResult = await db.execute({
            sql: 'SELECT * FROM recurring_kajian WHERE isActive = 1',
            args: []
        });

        const templates = recurringResult.rows;

        if (templates.length === 0) {
            return NextResponse.json({
                success: true,
                generated: 0,
                skipped: 0,
                message: 'No active recurring kajian templates found'
            });
        }

        // Get all active holiday periods
        const holidayResult = await db.execute({
            sql: 'SELECT * FROM holiday_periods WHERE isActive = 1',
            args: []
        });

        const holidayPeriods = holidayResult.rows;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + Number(months));

        let generatedCount = 0;
        let skippedCount = 0;
        let skippedDueToHoliday = 0;

        for (const template of templates) {
            // Generate dates based on pattern
            const dates = generateRecurringDates(
                {
                    pattern: template.pattern as any,
                    dayOfWeek: Number(template.day_of_week),
                    weekOfMonth: template.week_of_month ? Number(template.week_of_month) : undefined
                },
                startDate,
                endDate
            );

            // For each date, check if instance already exists
            for (const date of dates) {
                const dateStr = formatIndoDate(date);
                const dateYYYYMMDD = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

                // Check if date falls within any holiday period
                const isInHoliday = holidayPeriods.some((period: any) => {
                    return dateYYYYMMDD >= period.start_date && dateYYYYMMDD <= period.end_date;
                });

                if (isInHoliday) {
                    skippedDueToHoliday++;
                    continue;
                }

                // Build waktu string
                let waktu = template.waktu_mulai || '';
                if (template.waktu_selesai && template.waktu_selesai !== 'Selesai') {
                    waktu += ` - ${template.waktu_selesai}`;
                } else if (template.waktu_selesai === 'Selesai') {
                    waktu += ' - Selesai';
                }

                // Check if this instance already exists
                const existingCheck = await db.execute({
                    sql: `SELECT id FROM kajian 
                WHERE recurring_kajian_id = ? 
                AND date = ?
                AND is_recurring_instance = 1`,
                    args: [template.id, dateStr]
                });

                if (existingCheck.rows.length > 0) {
                    skippedCount++;
                    continue;
                }

                // Create the kajian instance
                await db.execute({
                    sql: `INSERT INTO kajian (
            masjid, address, city, pemateri, pemateri2, pemateri3, tema,
            date, waktu, waktu_mulai, waktu_selesai,
            cp, cp2, cp3,
            gmapsUrl, lat, lng,
            imageUrl, catatan, linkInfo,
            khususAkhwat, isOnline, isKidsFriendly,
            recurring_kajian_id, is_recurring_instance
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        template.masjid,
                        template.address,
                        template.city,
                        template.pemateri,
                        template.pemateri2,
                        template.pemateri3,
                        template.tema,
                        dateStr,
                        waktu,
                        template.waktu_mulai,
                        template.waktu_selesai,
                        template.cp,
                        template.cp2,
                        template.cp3,
                        template.gmapsUrl,
                        template.lat,
                        template.lng,
                        template.imageUrl,
                        template.catatan,
                        template.linkInfo,
                        template.khususAkhwat,
                        template.isOnline,
                        template.isKidsFriendly,
                        template.id,
                        1 // is_recurring_instance
                    ]
                });

                generatedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            generated: generatedCount,
            skipped: skippedCount,
            skippedDueToHoliday: skippedDueToHoliday,
            templates: templates.length,
            message: `Generated ${generatedCount} kajian instances, skipped ${skippedCount} existing, ${skippedDueToHoliday} during holidays`
        });
    } catch (error: any) {
        console.error('Error generating recurring kajian:', error);
        return NextResponse.json(
            { error: 'Failed to generate recurring kajian', details: error.message },
            { status: 500 }
        );
    }
}
