export interface KajianEntry {
    region: string;
    city: string;
    masjid: string;
    address: string;
    gmapsUrl: string;
    lat?: number;
    lng?: number;
    pemateri: string;
    tema: string;
    waktu: string;
    cp: string;
    imageUrl?: string; // Potential future use
    date: string; // From the header
    khususAkhwat?: boolean; // True if kajian is exclusively for women
    linkInfo?: string; // Link pendaftaran, streaming, atau WAG
    isOnline?: boolean; // True if kajian is online (Zoom, YouTube, etc.)
    attendanceCount?: number; // Count of people planning to attend
}

export function parseKajianBroadcast(text: string): KajianEntry[] {
    // Normalize text: remove invisible characters and normalize newlines
    const cleanText = text.replace(/[\u200B-\u200D\uFEFF\u2063]/g, '').trim();
    const lines = cleanText.split('\n').map(line => line.trim());

    // Detection logic
    const isRekapan = /○●.+●○/.test(cleanText) || (cleanText.match(/】/g) || []).length > 5;
    const isDauroh = /DAURO?H/i.test(cleanText) || /[📅🗓📍🎙📚]/.test(cleanText);

    if (isRekapan && !isDauroh) return parseRekapanFormat(lines);
    if (isDauroh) return parseDaurohFormat(lines);
    return parseNarrativeFormat(cleanText);
}

function cleanValue(val: string): string {
    if (!val) return '';
    // Nuclear cleaning: remove specific brackets and emojis globally first
    let result = val.replace(/[】】］\]\[［【○●▶️🚩📍🕌🕍🌏≡]/gu, ' ');

    // Remove markdown
    result = result.replace(/[\*_~`]/g, '');

    // Strip leading/trailing punctuation and whitespace
    result = result.replace(/^[ \-\:\|\u200B-\u200D\uFEFF\u2063\t\n\r\.\,]+/, '');
    result = result.replace(/[ \-\:\|\u200B-\u200D\uFEFF\u2063\t\n\r\.\,]+$/, '');

    return result.trim();
}

function normalizeCity(city: string): string {
    const raw = cleanValue(city).toUpperCase();
    const map: Record<string, string> = {
        'JAK-TIM': 'Jakarta Timur',
        'JAK-SEL': 'Jakarta Selatan',
        'JAK-BAR': 'Jakarta Barat',
        'JAK-PUS': 'Jakarta Pusat',
        'JAK-UT': 'Jakarta Utara',
        'TANG-SEL': 'Tangerang Selatan'
    };
    return map[raw] || cleanValue(city);
}

function parseRekapanFormat(lines: string[]): KajianEntry[] {
    const entries: KajianEntry[] = [];
    let currentDate = '';
    let currentCity = '';

    let tempEntry: Partial<KajianEntry> | null = null;

    const finalize = (entry: Partial<KajianEntry>) => {
        if (!entry.masjid) return;
        entries.push({
            region: 'INDONESIA',
            city: cleanValue(entry.city || currentCity || 'Jakarta'),
            masjid: cleanValue(entry.masjid),
            address: cleanValue(entry.address || entry.masjid),
            pemateri: cleanValue(entry.pemateri || 'TBD'),
            tema: cleanValue(entry.tema || 'Kajian'),
            waktu: cleanValue(entry.waktu || 'TBD'),
            date: cleanValue(entry.date || currentDate || 'TBD'),
            cp: cleanValue(entry.cp || ''),
            gmapsUrl: entry.gmapsUrl || ''
        });
    };

    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        // Pre-clean line for detection
        const line = lines[i].replace(/[】]/g, '').trim();
        if (!line) continue;

        // Enhanced Date Header detection
        // specifically targeting: *▶️Selasa, 23 Desember 2025* or ▶Selasa...
        const dateMatch = line.match(/[\*]*[▶️▶🗓📅][\*]*\s*([^▶️▶🗓📅\*]+)/iu);
        if (dateMatch) {
            const val = cleanValue(dateMatch[1]);
            if (val.length > 8) {
                currentDate = val;
            }
        }

        // Backup: match day names if at the start of a line in the header (e.g. "Senin, ...")
        const dayPattern = /^(?:Senin|Selasa|Rabu|Kamis|Jumat|Jum'at|Sabtu|Ahad|Minggu)/i;
        if (!currentDate) {
            // Check for explicit date format: Day, DD Month YYYY (allow missing comma)
            const robustDateMatch = line.match(/(?:Senin|Selasa|Rabu|Kamis|Jumat|Jum'at|Sabtu|Ahad|Minggu)\s*[,]?\s*\d{1,2}\s+[a-zA-Z]+\s+\d{4}/i);
            if (robustDateMatch) {
                currentDate = cleanValue(robustDateMatch[0]);
            } else if (dayPattern.test(cleanValue(line))) {
                // Fallback for just starting with day name
                currentDate = cleanValue(line);
            }
        }

        // City detection
        if (line.includes('○●')) {
            const cityMatch = line.match(/○●\s*([^●]+)\s*●○/);
            if (cityMatch) currentCity = normalizeCity(cityMatch[1]);
        }
    }

    // Reset loop for entry processing
    for (let i = 0; i < lines.length; i++) {
        // SUPER NUCLEAR CLEANING: Remove the bracket from existence before parsing
        const line = lines[i].replace(/[】]/g, '').trim();
        if (!line) continue;

        // Use masjid emoji as start of entry
        if (line.includes('🕌') || line.includes('🕍')) {
            if (tempEntry) finalize(tempEntry);
            const parts = line.split(/[🕌🕍]/);
            tempEntry = { masjid: cleanValue(parts[parts.length - 1]) };
        }

        // 4. FIELD EXTRACTION (If inside an entry)
        else if (tempEntry) {
            const upperLine = line.toUpperCase();

            if (upperLine.includes('PEMATERI')) {
                if (tempEntry.pemateri) finalize(tempEntry); // Handle session split
                tempEntry.pemateri = cleanValue(line.split(/Pemateri\s*[:\-]/i).pop() || '');
            } else if (upperLine.includes('TEMA')) {
                tempEntry.tema = cleanValue(line.split(/Tema\s*[:\-]/i).pop() || '');
            } else if (upperLine.includes('WAKTU')) {
                tempEntry.waktu = cleanValue(line.split(/Waktu\s*[:\-]/i).pop() || '');
            } else if (upperLine.includes('CP')) {
                if (!line.includes('whatsapp.com')) {
                    tempEntry.cp = cleanValue(line.split(/CP\s*[:\-]/i).pop() || '');
                }
            } else if (upperLine.includes('G-MAPS') || line.includes('goo.gl') || line.includes('maps.app')) {
                const match = line.match(/https?:\/\/[^\s]+/);
                if (match) tempEntry.gmapsUrl = match[0];
            } else if (line.trim() === '***' || line.trim() === '.') {
                finalize(tempEntry);
                tempEntry = null;
            } else if (!tempEntry.pemateri && !tempEntry.tema && line.length > 5 && !line.startsWith('≡')) {
                // Collect address/location details
                tempEntry.address = tempEntry.address ? `${tempEntry.address}, ${line}` : line;
            }
        }
    }

    if (tempEntry) finalize(tempEntry);
    return entries;
}

function parseDaurohFormat(lines: string[]): KajianEntry[] {
    const entries: KajianEntry[] = [];
    let commonDate = '';
    let commonMasjid = '';
    let commonAddress = '';
    let commonCP = '';

    const safeEncode = (str: string) => {
        try {
            const clean = str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, '');
            return encodeURIComponent(clean);
        } catch (e) {
            return encodeURIComponent(str.replace(/[^\x00-\x7F]/g, ''));
        }
    };

    const markers = /[🗓📅⏰🕙👤🎙🗣📚📝📒📍🕌📞📱📲🔗🌏]/u;
    let current: Partial<KajianEntry> = {};
    const entriesData: Partial<KajianEntry>[] = [];

    const pushCurrent = () => {
        if (current.masjid || current.pemateri || current.tema || current.waktu) {
            entriesData.push({ ...current });
            current = {};
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim() === '') continue;

        // 🗓 or 📅 - Global Date
        if (/[🗓📅]/u.test(line)) {
            const val = line.replace(/[🗓📅]/gu, '').replace(/^\s*[:,-]\s*\*/, '').replace(/\*$/, '').trim();
            if (val) commonDate = val;
            continue;
        }

        // ⏰ or 🕙 - Primary New Entry Trigger (Time)
        if (/[⏰🕙]/u.test(line)) {
            if (current.waktu) pushCurrent();
            current.waktu = line.replace(/[⏰🕙]/gu, '').replace(/^\s*[:,-]\s*/, '').trim();
        }
        // 📍 or 🕌 - Primary New Entry Trigger (Location)
        else if (/[📍🕌]/u.test(line)) {
            // In some formats, Location comes before Pemateri. 
            // In multi-session posts, if we already have a Masjid, it's a new entry.
            if (current.masjid) pushCurrent();
            current.masjid = line.replace(/[📍🕌]/gu, '').replace(/^\s*[:,-]\s*/, '').trim();

            let j = i + 1;
            let addr = '';
            while (j < lines.length && lines[j] && !markers.test(lines[j]) && !lines[j].startsWith('_')) {
                addr += (addr ? ', ' : '') + lines[j].trim();
                j++;
            }
            if (addr) {
                current.address = addr;
                i = j - 1;
            }
        }
        // 👤 or 🎙 or 🗣 or 1️⃣... - Pemateri (Append if exists)
        else if (/[👤🎙🗣]|^[1-9]️⃣/u.test(line) || line.includes('Pemateri')) {
            const val = line.replace(/[👤🎙🗣]|(?:\d️⃣)/gu, '').replace(/Pemateri\s*[:\-]*/gi, '').trim();
            if (current.pemateri) {
                current.pemateri += ' & ' + val;
            } else {
                current.pemateri = val;
            }
            // Check for theme in next line if it's italicized _..._
            if (i + 1 < lines.length && lines[i + 1].startsWith('_') && lines[i + 1].includes('_')) {
                const nextTheme = lines[i + 1].replace(/_/g, '').trim();
                if (current.tema) {
                    current.tema += ' / ' + nextTheme;
                } else {
                    current.tema = nextTheme;
                }
                i++;
            }
        }
        // 📚 or 📝 or 📒 or 🍭 - Theme (Append if exists)
        else if (/[📚📝📒🍭]/u.test(line) || line.includes('Tema')) {
            const val = line.replace(/[📚📝📒🍭]/gu, '').replace(/Tema\s*[:\-]*/gi, '').trim();
            if (current.tema) {
                current.tema += ' / ' + val;
            } else {
                current.tema = val;
            }
        }
        // 🔗 or 🌏 - Maps or Links
        else if (/[🔗🌏]/u.test(line) || line.includes('maps.app.goo.gl')) {
            const urlMatch = line.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
                if (urlMatch[0].includes('maps')) {
                    current.gmapsUrl = urlMatch[0];
                } else if (!current.cp) {
                    current.cp = urlMatch[0];
                }
            }
        }
        // 📞 or 📱 or 📲 - CP
        else if (/[📞📱📲]/u.test(line)) {
            const val = line.replace(/[📞📱📲]/gu, '').replace(/Link Pendaftaran\s*:/i, '').trim();
            if (val.length > 5 || val.startsWith('http')) {
                if (current.cp) current.cp += ', ' + val;
                else current.cp = val;
            }
        }
    }
    pushCurrent();

    // Map extracted data into final entries, filling in globals
    return entriesData.map(e => {
        const masjid = e.masjid || commonMasjid || 'TBD';
        const address = e.address || commonAddress || masjid;
        const searchQuery = safeEncode(`${masjid} ${address}`);

        return {
            region: 'INDONESIA',
            city: address.split(',').pop()?.trim() || commonAddress.split(',').pop()?.trim() || 'Jawa Timur',
            masjid,
            address,
            gmapsUrl: e.gmapsUrl || `https://www.google.com/maps/search/?api=1&query=${searchQuery}`,
            pemateri: e.pemateri || 'TBD',
            tema: e.tema || 'Kajian',
            waktu: e.waktu || 'TBD',
            cp: e.cp || commonCP || '',
            date: e.date || commonDate || 'TBD'
        };
    });
}

function parseNarrativeFormat(text: string): KajianEntry[] {
    // Clean text: remove invisible characters and normalize
    const clean = text.replace(/[\u200B-\u200D\uFEFF\u2063]/g, '').trim();

    // OCR Fixes: Common misreads in Indonesian/Islamic contexts
    const ocrFixed = clean
        .replace(/Masiid/gi, 'Masjid')
        .replace(/Ustad\b/gi, 'Ustadz')
        .replace(/Kitah/gi, 'Kitab');

    const entry: Partial<KajianEntry> = {
        region: 'INDONESIA',
        city: 'Jawa Timur',
        masjid: 'TBD',
        pemateri: 'TBD',
        tema: 'Kajian',
        waktu: 'TBD',
        date: 'TBD',
        address: '',
        cp: '',
        gmapsUrl: ''
    };

    // Patterns for noisy OCR / Narrative
    const patterns = {
        pemateri: /(?:Ustadz|Ust\.|🎙|👤|Pemateri|Bersama|Oleh)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:\(|حفظه|tgl|tanggal|hari|di masjid|masjid|🕌|📍|Waktu|⏰|🕙|dengan|tema|Kitab|📚|📝|[\n\r]|$))/i,
        date: /(?:tgl|tanggal|hari|🗓|📅)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:\/|di masjid|masjid|🕌|📍|Waktu|⏰|🕙|[\n\r]|$))/i,
        masjid: /(?:di masjid|masjid|Musholla|🕌|📍|Lokasi|Tempat)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:Kitab|Tema|📚|📝|Waktu|⏰|🕙|dengan|alamat|[\n\r]|$))/i,
        tema: /(?:Kitab|Tema|📚|📝|Membahas|Kajian)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:Waktu|⏰|🕙|di masjid|masjid|[\n\r]|$))/i,
        waktu: /(?:Waktu|Pukul|Jam|⏰|🕙|Ba'da|Mulai)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:\-|sd|sampai|[\n\r]|$))/i
    };

    Object.entries(patterns).forEach(([key, regex]) => {
        const match = ocrFixed.match(regex);
        if (match) {
            (entry as any)[key] = match[1].trim();
        }
    });

    // Extract CP (Phone numbers)
    const phoneMatch = ocrFixed.match(/(?:08|\+62)\d{8,12}/g);
    if (phoneMatch) {
        entry.cp = Array.from(new Set(phoneMatch)).join(', ');
    }

    // Try to extract City if mention of a city name is found (simplified list)
    const commonCities = ['Jakarta', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Bandung', 'Surabaya', 'Malang', 'Sidoarjo', 'Gresik'];
    for (const c of commonCities) {
        if (new RegExp(c, 'i').test(ocrFixed)) {
            entry.city = c;
            break;
        }
    }

    // Use Masjid for address fallback
    if (entry.masjid && entry.masjid !== 'TBD') {
        const query = encodeURIComponent(`${entry.masjid} ${entry.city}`);
        entry.gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        entry.address = entry.masjid;
        return [entry as KajianEntry];
    }

    return [];
}
