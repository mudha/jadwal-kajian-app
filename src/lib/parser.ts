export interface KajianEntry {
    region: string;
    city: string;
    masjid: string;
    address: string;
    gmapsUrl: string;
    lat?: number;
    lng?: number;
    pemateri: string; // Pemateri utama / Primary speaker
    pemateri2?: string; // Pemateri kedua (optional)
    pemateri3?: string; // Pemateri ketiga (optional)
    tema: string;
    waktu: string; // Legacy field - kombinasi waktu mulai - selesai
    waktu_mulai?: string; // Waktu mulai (new field)
    waktu_selesai?: string; // Waktu selesai (new field, default: "Selesai")
    cp: string;
    cp2?: string; // Contact person 2
    cp3?: string; // Contact person 3
    imageUrl?: string; // Potential future use
    date: string; // From the header
    khususAkhwat?: boolean; // True if kajian is exclusively for women
    linkInfo?: string; // Link pendaftaran, streaming, atau WAG
    isOnline?: boolean; // True if kajian is online (Zoom, YouTube, etc.)
    isKidsFriendly?: boolean; // True if kajian is for kids
    attendanceCount?: number; // Count of people planning to attend
    catatan?: string; // Catatan dari panitia (notes from organizers)
}

export function parseKajianBroadcast(text: string): KajianEntry[] {
    // Normalize text: remove invisible characters and normalize newlines
    const cleanText = text.replace(/[\u200B-\u200D\uFEFF\u2063]/g, '').trim();
    const lines = cleanText.split('\n').map(line => line.trim());

    // Detection logic
    const isRekapan = /○●.+●○/.test(cleanText) || (cleanText.match(/】/g) || []).length > 5;
    const isDauroh = /DAURO?H/i.test(cleanText) || /[📅🗓📍🎙📚📝]/.test(cleanText);

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

function cleanMultiLineValue(val: string): string {
    if (!val) return '';
    // Similar to cleanValue but preserves newlines
    let result = val.replace(/[】】］\]\[［【○●▶️🚩📍🕌🕍🌏≡]/gu, ' ');
    result = result.replace(/[\*_~`]/g, '');

    // Only strip leading/trailing whitespace/punctuation, not internal newlines
    result = result.trim();
    return result;
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

function normalizeWaktu(waktu: string): string {
    if (!waktu || waktu === 'TBD') return waktu;

    const lower = waktu.toLowerCase();

    // Normalize prayer names first
    const prayerMap: Record<string, string> = {
        'subuh': 'Shubuh',
        'shubuh': 'Shubuh',
        'dzuhur': 'Dhuhur',
        'dhuhur': 'Dhuhur',
        'zuhur': 'Dhuhur',
        'luhur': 'Dhuhur',
        'asar': 'Ashar',
        'ashar': 'Ashar',
        'magrib': 'Maghrib',
        'maghrib': 'Maghrib',
        'isa': 'Isya',
        'isya': 'Isya',
    };

    // Check if it contains "ba'da" or similar keywords
    const badaPattern = /(?:ba['']?da|ba['']?dha|bada|setelah|habis|usai)\s+(subuh|shubuh|dzuhur|dhuhur|zuhur|luhur|asar|ashar|magrib|maghrib|isa|isya)/i;
    const badaMatch = lower.match(badaPattern);

    if (badaMatch) {
        const prayer = badaMatch[1].toLowerCase();
        const normalized = prayerMap[prayer] || prayer;
        return `Ba'da ${normalized} - Selesai`;
    }

    // Check if it's just a prayer name
    const prayerOnlyPattern = /^(subuh|shubuh|dzuhur|dhuhur|zuhur|luhur|asar|ashar|magrib|maghrib|isa|isya)\s*(-\s*selesai)?$/i;
    const prayerMatch = lower.match(prayerOnlyPattern);

    if (prayerMatch) {
        const prayer = prayerMatch[1].toLowerCase();
        const normalized = prayerMap[prayer] || prayer;
        return `${normalized} - Selesai`;
    }

    // If it has specific time (e.g., "19.00"), keep it as is
    // Just add " - Selesai" if it doesn't have it
    if (/\d{1,2}[:.]\d{2}/.test(waktu) && !lower.includes('selesai')) {
        return `${waktu} - Selesai`;
    }

    return waktu;
}

// Split waktu into waktu_mulai and waktu_selesai
export function splitWaktu(waktu: string): { waktu_mulai: string; waktu_selesai: string } {
    if (!waktu || waktu === 'TBD') {
        return { waktu_mulai: '', waktu_selesai: 'Selesai' };
    }

    // Check for time range patterns like "19.00 - 20.00" or "Ba'da Maghrib - Selesai"
    const rangePattern = /^(.+?)\s*[-–—]\s*(.+)$/;
    const match = waktu.match(rangePattern);

    if (match) {
        return {
            waktu_mulai: match[1].trim(),
            waktu_selesai: match[2].trim() || 'Selesai'
        };
    }

    // If no range, treat entire value as waktu_mulai
    return {
        waktu_mulai: waktu,
        waktu_selesai: 'Selesai'
    };
}

// Split pemateri into multiple speakers
export function splitPemateri(pemateri: string): { pemateri: string; pemateri2?: string; pemateri3?: string } {
    if (!pemateri) {
        return { pemateri: '' };
    }

    // Split by &, 'dan', or comma, but be careful with titles like "Ust." or "Dr."
    const separators = /\s+(?:&|dan|,)\s+/i;
    const speakers = pemateri.split(separators).map(s => s.trim()).filter(s => s.length > 0);

    return {
        pemateri: speakers[0] || '',
        pemateri2: speakers[1] || undefined,
        pemateri3: speakers[2] || undefined
    };
}

// Split CP into multiple contact persons
export function splitCP(cpString: string): { cp: string; cp2?: string; cp3?: string } {
    if (!cpString) return { cp: '' };

    // Regex to match phone numbers
    const phoneRegex = /(?:08|\+62)\d{8,12}/g;
    const matches = cpString.match(phoneRegex);

    if (matches && matches.length > 0) {
        // If strict phone numbers found
        const unique = Array.from(new Set(matches));
        return {
            cp: unique[0] || '',
            cp2: unique[1] || undefined,
            cp3: unique[2] || undefined
        };
    }

    // Fallback: split by comma or 'dan' if no strict phone pattern matches (e.g. names)
    // But usually CP is number.
    const parts = cpString.split(/[,&]|\bdan\b/i).map(s => s.trim()).filter(s => s);
    return {
        cp: parts[0] || cpString,
        cp2: parts[1] || undefined,
        cp3: parts[2] || undefined
    };
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
            waktu: normalizeWaktu(cleanValue(entry.waktu || 'TBD')),
            date: cleanValue(entry.date || currentDate || 'TBD'),
            ...splitCP(cleanValue(entry.cp || '')),
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
                currentDate = cleanValue(robustDateMatch[0]).replace(/Minggu/i, 'Ahad');
            } else if (dayPattern.test(cleanValue(line))) {
                // Fallback for just starting with day name
                currentDate = cleanValue(line).replace(/Minggu/i, 'Ahad');
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
    let commonCityFromHeader = '';

    const pushCurrent = () => {
        if (current.masjid || current.pemateri || current.tema || current.waktu) {
            entriesData.push({ ...current });
            current = {};
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim() === '') continue;

        // Header City Detection
        // "🔰 Jadwal Kajian Kota Palembang 🔰"
        if (/Kota Palembang/i.test(line)) {
            commonCityFromHeader = 'Palembang';
            continue;
        }

        // 🗓 or 📅 or 📝 (Header Date check)
        // Match: "🗓️ *Senin Ke-1, 5 Januari 2025*" or "📝 *JADWAL...*" or "📆 Selasa, 17 Syakban 1447 H / 6 Januari 2026 M"
        if (/[🗓📅📆]/.test(line)) {
            const val = line.replace(/[🗓📅📆]/gu, '').replace(/^\s*[:,-]\s*\*/, '').replace(/\*$/, '').trim();
            // Try to extract AD Date "6 Januari 2026"
            const adDateMatch = val.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/g);
            if (adDateMatch && adDateMatch.length > 0) {
                // Use the last one if multiple (e.g. Hijri dates might look similar or if format is H / M)
                // But typically Masehi is the standard format we want.
                // If "6 Januari 2026 M", extract "6 Januari 2026"
                const masehi = val.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})\s*M?/i);
                if (masehi) commonDate = masehi[1];
                else commonDate = adDateMatch[0];
            } else {
                commonDate = val;
            }
            continue;
        }

        // 🕌 - Start new entry for Palembang format
        if (line.includes('🕌')) {
            // If we have previous data, push it.
            // But be careful: in standard dauroh, 🕌 is just location line.
            // In Palembang format, 🕌 is the START of an entry.
            // Heuristic: If we already have a masjid in 'current', then seeing another 🕌 means NEW entry.
            if (current.masjid) {
                pushCurrent();
            }
        }

        // ⏰ or 🕙 - Primary New Entry Trigger (Time)
        if (/[⏰🕙]/.test(line)) {
            // ONLY start new entry if we don't have a masjid yet (standard format)
            // OR if we already have a time (collision)
            if (current.waktu) {
                pushCurrent();
            }
            current.waktu = line.replace(/[⏰🕙]/gu, '').replace(/^\s*[:,-]\s*/, '').trim();
        }
        // 📍 or 🕌 - Location
        else if (/[📍🕌]/.test(line)) {
            // Palembang format: "🕌 Ma’had Zaadul Ma’ad, Jl. Padat Karya..."
            const raw = line.replace(/[📍🕌]/gu, '').replace(/^\s*[:,-]\s*/, '').trim();
            // Split if address is same line
            const parts = raw.split(/\s+-\s+|\s*,\s*/);

            // If line starts with 🕌, and we assumed it's start of entry, current.masjid might be empty.
            // If it's not empty (from previous logic?), we already pushed.
            current.masjid = parts[0];

            if (parts.length > 1) {
                // Reconstruct address from remaining parts
                current.address = raw.substring(parts[0].length).replace(/^[\s\-,]+/, '');
            } else {
                // Look ahead for address or maps link
                let j = i + 1;
                let addr = current.address || '';
                // consume lines until next emoji marker
                while (j < lines.length && lines[j] && !markers.test(lines[j]) && !lines[j].startsWith('_')) {
                    // Check if it's a link (maps)
                    if (lines[j].startsWith('http')) {
                        current.gmapsUrl = lines[j].trim();
                    } else {
                        addr += (addr ? ', ' : '') + lines[j].trim();
                    }
                    j++;
                }
                if (addr) current.address = addr;
                // Don't skip index 'i' here because the loop will continue naturally, but we processed lines[j].
                // Wait, we need to skip the lines we consumed as address/link.
                // Correct logic:
                i = j - 1;
            }
        }
        // 👤 or 🎙 or 🗣 - Pemateri
        else if (/[👤🎙🗣]/.test(line) || line.includes('Pemateri')) {
            const val = line.replace(/[👤🎙🗣]/gu, '').replace(/Pemateri\s*[:\-]*/gi, '').trim();
            if (current.pemateri) {
                current.pemateri += ' & ' + val;
            } else {
                current.pemateri = val;
            }
        }
        // 📚 or 📝 or 📒 - Theme
        else if (/[📚📝📒🍭]/.test(line) || line.includes('Tema')) {
            if (line.includes('JADWAL KAJIAN')) {
                if (/Kota Palembang/i.test(line)) commonCityFromHeader = 'Palembang';
                continue;
            }

            const val = line.replace(/[📚📝📒🍭]/gu, '').replace(/Tema\s*[:\-]*/gi, '').trim();
            if (current.tema) {
                current.tema += ' / ' + val;
            } else {
                current.tema = val;
            }
        }
        // 🔗 or 🌏 - Maps or Links
        else if (/[🔗🌏]/.test(line) || line.includes('maps.app.goo.gl') || line.startsWith('http')) {
            // Palembang format has standalone link lines
            const urlMatch = line.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
                if (urlMatch[0].includes('maps') || urlMatch[0].includes('goo.gl')) {
                    current.gmapsUrl = urlMatch[0];
                } else if (!current.cp && !current.gmapsUrl) {
                    // Assume it might be maps if we don't have one, or CP/Info if we do
                    // Actually Palembang format uses bit.ly for maps sometimes
                    // "https://bit.ly/3tyL3KQ" -> likely maps
                    current.gmapsUrl = urlMatch[0];
                }
            }
        }
        // 📞 or 📱 or 📲 - CP or INFO
        else if (/[📞📱📲]/.test(line)) {
            if (line.toLowerCase().includes('share info')) continue;
            const val = line.replace(/[📞📱📲]/gu, '').replace(/Link Pendaftaran\s*:/i, '').trim();
            if (val.length > 5 && (/\d/.test(val) || val.startsWith('http'))) {
                if (val.toLowerCase().includes('hubungi') || val.toLowerCase().includes('whatsapp')) {
                    const phones = val.match(/(?:08|\+62)\d+/g);
                    if (phones) current.cp = phones.join(', ');
                } else {
                    if (current.cp) current.cp += ', ' + val;
                    else current.cp = val;
                }
            }
        }
        // 👥 Target (Ikhwan/Akhwat)
        else if (/[👥]/.test(line)) {
            if (line.toLowerCase().includes('akhwat') && !line.toLowerCase().includes('ikhwan')) {
                current.khususAkhwat = true;
            }
        }
    }
    pushCurrent();

    // Map extracted data into final entries, filling in globals
    return entriesData.map(e => {
        const masjid = e.masjid || commonMasjid || 'TBD';
        const address = e.address || commonAddress || masjid;
        const searchQuery = safeEncode(`${masjid} ${address}`);

        // Use detected header city if specific city not found in address
        let city = address.split(',').pop()?.trim() || commonAddress.split(',').pop()?.trim() || 'Jawa Timur';
        // Normalize common ambiguous cities
        if (city.match(/Jl\.|Jalan|Lrg\.|Lorong|Komplek|Perumahan/i)) {
            // If the "city" part looks like address, use the Header city
            if (commonCityFromHeader) city = commonCityFromHeader;
        }
        if (commonCityFromHeader && !city) city = commonCityFromHeader;

        return {
            region: 'INDONESIA',
            city: city,
            masjid,
            address,
            gmapsUrl: e.gmapsUrl || `https://www.google.com/maps/search/?api=1&query=${searchQuery}`,
            pemateri: e.pemateri || 'TBD',
            tema: e.tema || 'Kajian',
            waktu: normalizeWaktu(e.waktu || 'TBD'),
            ...splitCP(e.cp || commonCP || ''),
            date: e.date || commonDate || 'TBD',
            khususAkhwat: e.khususAkhwat
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

    // Detect Online indicators
    const isOnline = /(?:Zoom|Google Meet|Live Stream|Youtube|Online)/i.test(ocrFixed) || /Meeting ID/i.test(ocrFixed);
    if (isOnline) {
        entry.masjid = 'Online';
        entry.city = 'Online';
        entry.address = 'Online';
        entry.isOnline = true;
    }

    // Detect Kids/Anak indicators
    const isKids = /(?:Kajian Anak|Dongeng|Kids|Cilik|Santri Cilik|Untuk Anak|Adik-Adik|Kak\s+[A-Z])/i.test(ocrFixed);
    if (isKids) {
        entry.isKidsFriendly = true;
    }

    // Patterns for noisy OCR / Narrative
    const patterns = {
        pemateri: /(?:Ustadz|Ust\.|🎙|👤|Pemateri|Bersama|Oleh|Kak|Penceramah)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:\(|حفظه|tgl|tanggal|hari|di masjid|masjid|🕌|📍|Waktu|Pukul|Jam|⏰|🕙|dengan|tema|Kitab|📚|📝|[\n\r]|$))/i,
        date: /(?:tgl|tanggal|hari|🗓|📅)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:\/|di masjid|masjid|🕌|📍|Waktu|Pukul|Jam|⏰|🕙|[\n\r]|$))/i,
        masjid: /(?:di masjid|masjid|Musholla|🕌|📍|Lokasi|Tempat)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:Kitab|Tema|📚|📝|Waktu|Pukul|Jam|⏰|🕙|dengan|alamat|[\n\r]|$))/i,
        // Update: Allow multi-line capture for Tema
        tema: /(?:Kitab|Tema|📚|📝|Membahas|Kajian)\s*[:\-]*\s*([\s\S]+?)(?=\s*(?:Waktu|Pukul|Jam|⏰|🕙|di masjid|masjid|Oleh|Pemateri|Ustadz|🎙|👤|$))/i,
        // Enhanced waktu pattern to catch ba'da variations and prayer times
        waktu: /(?:Waktu|Pukul|Jam|⏰|🕙|Ba['']?da|Ba['']?dha|Bada|Setelah|Habis|Usai|Mulai)\s*[:\-]*\s*([^📋🗓📍🕌🎙📝\n\r]+?)(?=\s*(?:\-|sd|sampai|[\n\r]|$))/i,
        // Catatan: Capture until the end or next major keyword, allow newlines
        catatan: /(?:Catatan|Note|NB|Perhatian|Info Tambahan)\s*[:\-]\s*([\s\S]+?)(?=$)/i
    };

    // Specific Handling for the user's format (Date on separate lines)
    if (ocrFixed.includes('Rabu Malam') || ocrFixed.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/)) {
        // Try to capture date from line context if standard regex failed
        const lines = ocrFixed.split('\n').map(l => l.trim()).filter(l => l);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Date detection: "31 Desember 2025" or "12 Rajab 1447 H"
            if (/\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des|Rajab|Muharram|Ramadhan|Syawal|Dzulqa|Dzulhi)[a-z]*\s+\d{4}/i.test(line)) {
                // If line contains Hijri, prefer the AD date if available in nearby lines
                if (!entry.date || entry.date === 'TBD' || line.includes('Masehi') || !line.includes('H.')) {
                    entry.date = cleanValue(line);
                }
            }

            // Time detection: "(Pukul: 20.00 WIB - Selesai)"
            if (line.includes('Pukul') || line.includes('WIB') || /[:.]\d{2}/.test(line)) {
                if (entry.waktu === 'TBD') {
                    const timeMatch = line.match(/(?:Pukul|Jam)?\s*(\d{1,2}[:.]\d{2}.*?)(?:\)|$)/i);
                    if (timeMatch) entry.waktu = normalizeWaktu(timeMatch[1]);
                }
            }

            // Pemateri detection from simple line start "Ustadz ..."
            if (line.startsWith('Ustadz') || line.startsWith('Ust.')) {
                if (entry.pemateri === 'TBD') entry.pemateri = cleanValue(line);
            }

            // Theme detection - often first line or after "Membahas"
            if (i < 3 && !line.includes('Online') && !line.includes('Ustadz') && entry.tema === 'Kajian') {
                // Heuristic: Short line at start is often Title/Theme
                if (line.length > 5 && line.length < 50) entry.tema = cleanValue(line);
            }
        }
    }

    Object.entries(patterns).forEach(([key, regex]) => {
        const match = ocrFixed.match(regex);
        if (match) {
            let value = match[1];

            // Apply appropriate cleaning
            if (key === 'catatan') {
                value = cleanMultiLineValue(value);
            } else if (key === 'tema') {
                value = cleanMultiLineValue(value);
            } else {
                value = value.trim();
            }

            // Normalize waktu if it's the waktu field
            if (key === 'waktu') {
                value = normalizeWaktu(value);
            }
            // Only overwrite if TBD or empty (preserve specific line detection)
            if ((entry as any)[key] === 'TBD' || !(entry as any)[key]) {
                (entry as any)[key] = value;
            }
        }
    });

    // Extract CP (Phone numbers)
    const phoneMatch = ocrFixed.match(/(?:08|\+62)\d{8,12}/g);
    if (phoneMatch) {
        const unique = Array.from(new Set(phoneMatch));
        entry.cp = unique[0] || '';
        entry.cp2 = unique[1];
        entry.cp3 = unique[2];
    }

    // Extract Zoom/Meet Links if Online
    if (isOnline) {
        const zoomMatch = ocrFixed.match(/Meeting ID:\s*([\d\s]+)/i);
        if (zoomMatch) {
            entry.linkInfo = `Zoom ID: ${zoomMatch[1].trim()}`;
            const passMatch = ocrFixed.match(/Password:\s*([\w]+)/i);
            if (passMatch) entry.linkInfo += ` Pass: ${passMatch[1]}`;
        }

        const linkMatch = ocrFixed.match(/https?:\/\/(?:bit\.ly|zoom\.us|meet\.google)[^\s]+/);
        if (linkMatch) {
            if (!entry.linkInfo) entry.linkInfo = linkMatch[0];
            else entry.linkInfo += ` ${linkMatch[0]}`;
        }
    }

    // Try to extract City if mention of a city name is found (simplified list)
    const commonCities = ['Jakarta', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Bandung', 'Surabaya', 'Malang', 'Sidoarjo', 'Gresik'];
    for (const c of commonCities) {
        if (new RegExp(c, 'i').test(ocrFixed)) {
            entry.city = c;
            break;
        }
    }

    // Final Validation: Must have at least Pemateri or Masjid/Online to be valid
    if (entry.pemateri !== 'TBD' || entry.masjid !== 'TBD' || isOnline) {
        if (entry.masjid === 'TBD' && isOnline) {
            entry.masjid = 'Online';
            entry.address = 'Online';
        }

        const query = encodeURIComponent(`${entry.masjid} ${entry.city}`);
        entry.gmapsUrl = entry.gmapsUrl || `https://www.google.com/maps/search/?api=1&query=${query}`;

        return [entry as KajianEntry];
    }

    return [];
}
