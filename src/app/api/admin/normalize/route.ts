import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Simple string similarity using Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[len1][len2];
}

function similarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
        return 1.0;
    }

    return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
}

// POST - Normalize name (find similar existing names)
export async function POST(request: Request) {
    try {
        const { name, type = 'ustadz', threshold = 0.7 } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Get all existing names
        const field = type === 'ustadz' ? 'pemateri' : 'masjid';
        const result = await db.execute(`
            SELECT DISTINCT ${field} as name, COUNT(*) as count
            FROM kajian
            WHERE ${field} IS NOT NULL AND ${field} != ''
            GROUP BY ${field}
        `);

        const normalizedInput = name.toLowerCase().trim();
        const suggestions: Array<{ name: string; similarity: number; count: number }> = [];

        for (const row of result.rows) {
            const existingName = (row as any).name;
            const normalizedExisting = existingName.toLowerCase().trim();

            // Calculate similarity
            const sim = similarity(normalizedInput, normalizedExisting);

            if (sim >= threshold && normalizedInput !== normalizedExisting) {
                suggestions.push({
                    name: existingName,
                    similarity: Math.round(sim * 100) / 100,
                    count: (row as any).count || 0,
                });
            }
        }

        // Sort by similarity (highest first)
        suggestions.sort((a, b) => b.similarity - a.similarity);

        // If exact match exists, return it as the canonical name
        const exactMatch = result.rows.find(
            (row: any) => row.name.toLowerCase().trim() === normalizedInput
        );

        return NextResponse.json({
            originalName: name,
            canonicalName: exactMatch ? (exactMatch as any).name : name,
            suggestions: suggestions.slice(0, 5), // Top 5 suggestions
            hasExactMatch: !!exactMatch,
        });
    } catch (error) {
        console.error('Error normalizing name:', error);
        return NextResponse.json(
            { error: 'Failed to normalize name' },
            { status: 500 }
        );
    }
}
