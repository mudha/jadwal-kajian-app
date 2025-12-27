import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/**
 * Normalize string for comparison
 */
function normalize(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')  // Multiple spaces to single
        .replace(/[.,\-_]/g, '') // Remove punctuation
        .replace(/masjid|musholla|mushola|msjd/gi, 'masjid') // Normalize masjid variants
        .replace(/ustadz|ustadh|ust\.|ust /gi, 'ustadz '); // Normalize ustadz variants
}

interface DuplicateGroup {
    canonical: string;
    variants: string[];
    count: number;
    type: 'masjid' | 'ustadz';
    locationInfo?: { [key: string]: { cities: string; addresses: string } };
}

interface MasjidData {
    name: string;
    cities: string;
    addresses: string;
    usageCount: number;
}

function findDuplicateGroupsWithInfo(data: MasjidData[], type: 'masjid'): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < data.length; i++) {
        if (processed.has(data[i].name)) continue;

        const canonical = data[i].name;
        const variants: string[] = [];
        const locationInfo: { [key: string]: { cities: string; addresses: string } } = {};

        // Store canonical location info
        locationInfo[canonical] = {
            cities: data[i].cities,
            addresses: data[i].addresses
        };

        const canonicalCities = data[i].cities ? data[i].cities.toLowerCase().split(',').map(c => c.trim()).filter(c => c.length > 0) : [];

        for (let j = i + 1; j < data.length; j++) {
            if (processed.has(data[j].name)) continue;

            const candidate = data[j].name;
            const candidateCities = data[j].cities ? data[j].cities.toLowerCase().split(',').map(c => c.trim()).filter(c => c.length > 0) : [];

            // Checks
            const sim = similarity(normalize(canonical), normalize(candidate));
            const normalizedMatch = normalize(canonical) === normalize(candidate);

            // INCREASED THRESHOLD: 0.95 to avoid false positives like 'Al Muslim' vs 'Al Muslimun'
            const isNameMatch = sim >= 0.95 || normalizedMatch;

            if (isNameMatch) {
                // CITY CHECK LOGIC
                // 1. If both have cities defined
                if (canonicalCities.length > 0 && candidateCities.length > 0) {
                    // Check if there is ANY overlap in cities
                    const hasSharedCity = canonicalCities.some(c => candidateCities.includes(c));

                    if (!hasSharedCity) {
                        // Different cities -> Skip this candidate, likely different mosque
                        continue;
                    }
                }
                // 2. If one or both is missing city info, we count it as potential duplicate (false positives safer than false negatives here? 
                //    User requested "jangan disaranin", so strict check means we SKIP if we can't confirm.
                //    Wait, logic: "Satu di Sby, satu di Gresik" -> Explicitly different.
                //    If one is unknown, it MIGHT be duplicate. 
                //    Safe approach: If DIFFERENT cities explicitly detected, skip. If one empty, allow.

                variants.push(candidate);
                locationInfo[candidate] = {
                    cities: data[j].cities,
                    addresses: data[j].addresses
                };
                processed.add(candidate);
            }
        }

        if (variants.length > 0) {
            groups.push({
                canonical,
                variants,
                count: variants.length + 1,
                type,
                locationInfo
            });
            processed.add(canonical);
        }
    }

    return groups;
}

export async function GET() {
    try {
        // Get all unique masjid names with their locations
        const masjidResult = await db.execute({
            sql: `SELECT DISTINCT masjid, 
                  GROUP_CONCAT(DISTINCT city) as cities,
                  GROUP_CONCAT(DISTINCT address) as addresses,
                  COUNT(*) as usage_count
                  FROM kajian 
                  WHERE masjid IS NOT NULL AND masjid != ""
                  GROUP BY masjid`,
            args: []
        });

        // Get all unique pemateri (ustadz) names
        const ustadzResult = await db.execute({
            sql: `SELECT DISTINCT pemateri, COUNT(*) as usage_count 
                  FROM kajian 
                  WHERE pemateri IS NOT NULL AND pemateri != ""
                  GROUP BY pemateri`,
            args: []
        });

        const masjidData = (masjidResult.rows as any[]).map(r => ({
            name: r.masjid as string,
            cities: r.cities as string,
            addresses: r.addresses as string,
            usageCount: r.usage_count as number
        }));

        const ustadzData = (ustadzResult.rows as any[]).map(r => ({
            name: r.pemateri as string,
            usageCount: r.usage_count as number
        }));

        const duplicates: DuplicateGroup[] = [];

        // Detect masjid duplicates with location info
        const masjidGroups = findDuplicateGroupsWithInfo(masjidData, 'masjid');
        duplicates.push(...masjidGroups);

        // Detect ustadz duplicates
        const ustadzGroups = findDuplicateGroups(ustadzData.map(d => d.name), 'ustadz');
        duplicates.push(...ustadzGroups);

        return NextResponse.json({
            success: true,
            duplicates,
            stats: {
                totalMasjid: masjidData.length,
                totalUstadz: ustadzData.length,
                duplicateGroups: duplicates.length,
                totalDuplicates: duplicates.reduce((sum, g) => sum + g.variants.length, 0)
            }
        });

    } catch (error) {
        console.error('Error detecting duplicates:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to detect duplicates' },
            { status: 500 }
        );
    }
}

function findDuplicateGroups(names: string[], type: 'masjid' | 'ustadz'): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < names.length; i++) {
        if (processed.has(names[i])) continue;

        const canonical = names[i];
        const variants: string[] = [];

        for (let j = i + 1; j < names.length; j++) {
            if (processed.has(names[j])) continue;

            const candidate = names[j];

            // Check if they're similar
            const sim = similarity(normalize(canonical), normalize(candidate));

            // Also check exact match after normalization
            const normalizedMatch = normalize(canonical) === normalize(candidate);

            // Threshold: 0.85 similarity or exact normalized match
            if (sim >= 0.85 || normalizedMatch) {
                variants.push(candidate);
                processed.add(candidate);
            }
        }

        if (variants.length > 0) {
            groups.push({
                canonical,
                variants,
                count: variants.length + 1,
                type
            });
            processed.add(canonical);
        }
    }

    return groups;
}
