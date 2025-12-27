export function normalize(str: string): string {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Collapse spaces
        .replace(/\b(masjid|musholla|surau|langgar|baitul|baitur|jami|raya|agung|besar)\b/g, '') // Remove common mosque prefixes
        .replace(/\b(ustadz|ust|ustad|prof|dr|kh|habib|syekh|syaikh)\b/g, '') // Remove titles
        .trim();
}

export function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
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

    return matrix[b.length][a.length];
}

export function similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;

    if (longerLength === 0) {
        return 1.0;
    }

    return (longerLength - levenshteinDistance(longer, shorter)) / parseFloat(longerLength.toString());
}
