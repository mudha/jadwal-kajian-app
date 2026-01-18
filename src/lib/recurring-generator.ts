/**
 * Recurring Kajian Date Generator
 * 
 * Generates future dates for recurring kajian based on pattern
 */

export type RecurringPattern =
    | 'weekly'
    | 'biweekly'
    | 'monthly'
    | 'monthly_odd'
    | 'monthly_even';

export interface RecurringConfig {
    pattern: RecurringPattern;
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    weekOfMonth?: number; // 1-4 for monthly patterns
}

/**
 * Get the week number of a date within its month (1-5)
 */
function getWeekOfMonth(date: Date): number {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay();
    const dateNum = date.getDate();

    // Calculate which week this date falls in
    const weekNumber = Math.ceil((dateNum + firstDayOfWeek) / 7);
    return weekNumber;
}

/**
 * Get the nth occurrence of a weekday in a month
 * @param year Year
 * @param month Month (0-11)
 * @param dayOfWeek Day of week (0-6)
 * @param occurrence Which occurrence (1-4)
 * @returns Date or null if doesn't exist
 */
function getNthWeekdayOfMonth(
    year: number,
    month: number,
    dayOfWeek: number,
    occurrence: number
): Date | null {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    // Calculate the date of the first occurrence of the target day
    let firstOccurrenceDate = 1 + ((7 + dayOfWeek - firstDayOfWeek) % 7);

    // Calculate the date of the nth occurrence
    const targetDate = firstOccurrenceDate + (occurrence - 1) * 7;

    // Check if the date is valid for this month
    const resultDate = new Date(year, month, targetDate);
    if (resultDate.getMonth() !== month) {
        return null; // Date doesn't exist (e.g., 5th Monday in a month with only 4)
    }

    return resultDate;
}

/**
 * Generates recurring dates based on pattern
 * @param config Recurring configuration
 * @param startDate Start date (defaults to today)
 * @param endDate End date (defaults to 3 months from start)
 * @returns Array of dates matching the pattern
 */
export function generateRecurringDates(
    config: RecurringConfig,
    startDate: Date = new Date(),
    endDate?: Date
): Date[] {
    const dates: Date[] = [];

    // Default end date: 3 months from start
    if (!endDate) {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);
    }

    const { pattern, dayOfWeek } = config;

    switch (pattern) {
        case 'weekly': {
            // Find the first occurrence of the target day on or after startDate
            let current = new Date(startDate);
            while (current.getDay() !== dayOfWeek) {
                current.setDate(current.getDate() + 1);
            }

            // Generate weekly occurrences
            while (current <= endDate) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 7);
            }
            break;
        }

        case 'biweekly': {
            // Find the first occurrence of the target day on or after startDate
            let current = new Date(startDate);
            while (current.getDay() !== dayOfWeek) {
                current.setDate(current.getDate() + 1);
            }

            // Generate bi-weekly occurrences (every 2 weeks)
            while (current <= endDate) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 14);
            }
            break;
        }

        case 'monthly': {
            // Monthly on specific week
            const weekNum = config.weekOfMonth || 1;
            let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

            while (current <= endDate) {
                const occurrence = getNthWeekdayOfMonth(
                    current.getFullYear(),
                    current.getMonth(),
                    dayOfWeek,
                    weekNum
                );

                if (occurrence && occurrence >= startDate && occurrence <= endDate) {
                    dates.push(occurrence);
                }

                // Move to next month
                current.setMonth(current.getMonth() + 1);
            }
            break;
        }

        case 'monthly_odd': {
            // Occurs on weeks 1 and 3 of each month
            let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

            while (current <= endDate) {
                // Week 1
                const week1 = getNthWeekdayOfMonth(
                    current.getFullYear(),
                    current.getMonth(),
                    dayOfWeek,
                    1
                );
                if (week1 && week1 >= startDate && week1 <= endDate) {
                    dates.push(week1);
                }

                // Week 3
                const week3 = getNthWeekdayOfMonth(
                    current.getFullYear(),
                    current.getMonth(),
                    dayOfWeek,
                    3
                );
                if (week3 && week3 >= startDate && week3 <= endDate) {
                    dates.push(week3);
                }

                current.setMonth(current.getMonth() + 1);
            }
            break;
        }

        case 'monthly_even': {
            // Occurs on weeks 2 and 4 of each month
            let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

            while (current <= endDate) {
                // Week 2
                const week2 = getNthWeekdayOfMonth(
                    current.getFullYear(),
                    current.getMonth(),
                    dayOfWeek,
                    2
                );
                if (week2 && week2 >= startDate && week2 <= endDate) {
                    dates.push(week2);
                }

                // Week 4
                const week4 = getNthWeekdayOfMonth(
                    current.getFullYear(),
                    current.getMonth(),
                    dayOfWeek,
                    4
                );
                if (week4 && week4 >= startDate && week4 <= endDate) {
                    dates.push(week4);
                }

                current.setMonth(current.getMonth() + 1);
            }
            break;
        }
    }

    // Sort dates chronologically
    return dates.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Helper to get day name from day number
 */
export function getDayName(dayOfWeek: number): string {
    const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayOfWeek] || '';
}

/**
 * Helper to get pattern description in Indonesian
 */
export function getPatternDescription(config: RecurringConfig): string {
    const dayName = getDayName(config.dayOfWeek);

    switch (config.pattern) {
        case 'weekly':
            return `Setiap ${dayName}`;
        case 'biweekly':
            return `Setiap 2 pekan (${dayName})`;
        case 'monthly':
            return `Setiap bulan (Pekan ke-${config.weekOfMonth}, ${dayName})`;
        case 'monthly_odd':
            return `2x sebulan (Pekan 1 & 3, ${dayName})`;
        case 'monthly_even':
            return `2x sebulan (Pekan 2 & 4, ${dayName})`;
        default:
            return 'Tidak diketahui';
    }
}
