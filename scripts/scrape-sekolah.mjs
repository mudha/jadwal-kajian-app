import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Database connection
const db = createClient({
    url: process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '../kajian.db')}`,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Jenjang categories to scrape
const JENJANG_LIST = [
    'DC', 'PAUD', 'TK', 'MI', 'MTs', 'MA',
    'SD', 'SMP', 'SMA', 'SMK', 'PT',
    'Pesantren', 'Kursus'
];

// Delay between requests to be respectful
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate slug from school name
function generateSlug(nama) {
    return nama
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Extract Google Maps coordinates from iframe
function extractMapCoords(html) {
    const mapMatch = html.match(/!1d(-?\d+\.\d+)!2d(-?\d+\.\d+)/);
    if (mapMatch) {
        return {
            lat: parseFloat(mapMatch[2]),
            lng: parseFloat(mapMatch[1])
        };
    }
    return { lat: null, lng: null };
}

// Parse price to integer
function parsePrice(priceStr) {
    if (!priceStr || priceStr.includes('Hubungi')) return null;
    return parseInt(priceStr.replace(/[^\d]/g, '')) || null;
}

// Scrape a single school detail page
async function scrapeSchoolDetail(url, slug) {
    try {
        console.log(`  ↳ Scraping detail: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const school = { slug };

        // Extract basic info
        school.nama = $('h1').first().text().trim();
        school.deskripsi = $('meta[property="og:description"]').attr('content') || '';

        // Extract structured data
        const dataFields = {};
        $('h3').each((i, elem) => {
            const label = $(elem).text().trim();
            const value = $(elem).next().text().trim();
            dataFields[label] = value;
        });

        // Map fields
        school.jenjang = dataFields['Jenjang'] || '';
        school.alamat = dataFields['Alamat'] || '';
        school.kota = dataFields['Kota'] || '';
        school.telepon = dataFields['Telepon'] || '';
        school.handphone = dataFields['Handphone'] || '';
        school.nama_pembina = dataFields['Nama Pembina'] || '';
        school.ketua_yayasan = dataFields['Nama Ketua Yayasan'] || '';
        school.kepala_sekolah = dataFields['Nama Kepala Sekolah'] || '';

        // Extract prices
        school.uang_masuk = parsePrice(dataFields['Uang Masuk']);
        school.spp_bulanan = parsePrice(dataFields['Biaya Bulanan']);

        // Extract facilities (Akhwat/Ikhwan)
        school.khusus_akhwat = response.data.includes('Akhwat') ? 1 : 0;
        school.khusus_ikhwan = response.data.includes('Ikhwan') ? 1 : 0;

        // Extract Google Maps
        const mapsIframe = $('iframe[src*="google.com/maps"]').attr('src');
        if (mapsIframe) {
            school.gmaps_url = mapsIframe;
            const coords = extractMapCoords(mapsIframe);
            school.lat = coords.lat;
            school.lng = coords.lng;
        }

        // Extract image
        const image = $('img').first().attr('src');
        if (image && !image.includes('placeholder')) {
            school.imageUrl = image.startsWith('http') ? image : `https://sekolahsunnah.com${image}`;
        }

        // Extract WhatsApp link
        const waLink = $('a[href*="wa.me"]').attr('href');
        school.whatsapp_link = waLink || '';

        // Extract website
        const websiteLink = $('a[href*="http"]').filter((i, el) => {
            const href = $(el).attr('href');
            return href && !href.includes('sekolahsunnah.com') && !href.includes('wa.me') && !href.includes('google.com');
        }).first().attr('href');
        school.website = websiteLink || '';

        // Extract province from kota
        if (school.kota.includes(',')) {
            const parts = school.kota.split(',');
            school.provinsi = parts[parts.length - 1].trim();
        }

        await delay(1000); // Be respectful to the server
        return school;

    } catch (error) {
        console.error(`    ERROR scraping ${url}:`, error.message);
        return null;
    }
}

// Scrape all schools from a jenjang category

// Scrape all schools from a jenjang category with pagination
async function scrapeJenjang(jenjang) {
    console.log(`\n📚 Scraping ${jenjang}...`);
    let page = 1;
    let hasNextPage = true;
    let totalJenjangSchools = 0;
    const MAX_PAGES = 50; // Safety limit

    while (hasNextPage && page <= MAX_PAGES) {
        console.log(`  📄 Processing Page ${page}...`);
        try {
            const url = `https://sekolahsunnah.com/level/${jenjang}?page=${page}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Find all school links on this page
            const pageSchoolLinks = [];
            $('.item').each((i, elem) => {
                const titleEl = $(elem).find('.title');
                const href = titleEl.attr('href');
                if (href && !href.includes('/level/') && !href.includes('/search')) {
                    const fullUrl = href.startsWith('http') ? href : `https://sekolahsunnah.com${href}`;
                    const slug = href.split('/').pop();
                    if (slug && !pageSchoolLinks.some(link => link.slug === slug)) {
                        pageSchoolLinks.push({ url: fullUrl, slug });
                    }
                }
            });

            if (pageSchoolLinks.length === 0) {
                console.log(`    No schools found on page ${page}. Stopping.`);
                hasNextPage = false;
                break;
            }

            console.log(`    Found ${pageSchoolLinks.length} schools on page ${page}`);

            // Process schools on this page
            for (const link of pageSchoolLinks) {
                const school = await scrapeSchoolDetail(link.url, link.slug);
                if (school && school.nama) {
                    await insertSchools([school]);
                    totalJenjangSchools++;
                    process.stdout.write('.'); // Progress indicator
                }
            }
            console.log(''); // New line after dots

            // Check for next page
            const nextLink = $('.pagination .page-item a[aria-label="Next »"]');
            if (nextLink.length > 0) {
                page++;
                await delay(2000); // Delay between pages
            } else {
                console.log(`    Last page reached for ${jenjang}.`);
                hasNextPage = false;
            }

        } catch (error) {
            console.error(`  ERROR scraping ${jenjang} page ${page}:`, error.message);
            hasNextPage = false; // Stop on error
        }
    }

    return totalJenjangSchools;
}


// Insert schools into database
async function insertSchools(schools) {
    console.log(`\n💾 Inserting ${schools.length} schools into database...`);

    let inserted = 0;
    let skipped = 0;

    for (const school of schools) {
        try {
            // Check if already exists
            const existing = await db.execute({
                sql: 'SELECT id FROM sekolah WHERE slug = ?',
                args: [school.slug]
            });

            if (existing.rows.length > 0) {
                skipped++;
                continue;
            }

            // Helper to sanitize values (LibSQL hates undefined)
            const sanitize = (val, defaultVal = null) => (val === undefined ? defaultVal : val);

            // Insert new school
            await db.execute({
                sql: `
          INSERT INTO sekolah (
            nama, slug, jenjang, alamat, kota, provinsi,
            telepon, handphone, whatsapp_link, website,
            gmaps_url, lat, lng,
            uang_masuk, spp_bulanan, deskripsi,
            khusus_akhwat, khusus_ikhwan,
            nama_pembina, ketua_yayasan, kepala_sekolah,
            imageUrl
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
                args: [
                    sanitize(school.nama, ''),
                    sanitize(school.slug, ''),
                    sanitize(school.jenjang, ''),
                    sanitize(school.alamat, ''),
                    sanitize(school.kota, ''),
                    sanitize(school.provinsi, ''),
                    sanitize(school.telepon, ''),
                    sanitize(school.handphone, ''),
                    sanitize(school.whatsapp_link, ''),
                    sanitize(school.website, ''),
                    sanitize(school.gmaps_url, ''),
                    sanitize(school.lat),
                    sanitize(school.lng),
                    sanitize(school.uang_masuk),
                    sanitize(school.spp_bulanan),
                    sanitize(school.deskripsi, ''),
                    sanitize(school.khusus_akhwat, 0),
                    sanitize(school.khusus_ikhwan, 0),
                    sanitize(school.nama_pembina, ''),
                    sanitize(school.ketua_yayasan, ''),
                    sanitize(school.kepala_sekolah, ''),
                    sanitize(school.imageUrl, '')
                ]
            });

            inserted++;

        } catch (error) {
            console.error(`  ERROR inserting ${school.nama}:`, error.message);
        }
    }

    console.log(`  ✓ Inserted: ${inserted}`);
    console.log(`  ⊘ Skipped (duplicates): ${skipped}`);
}

// Main scraping function
async function main() {
    console.log('🚀 Starting Sekolah Sunnah scraper (Full Pagination Mode)...');

    let totalAll = 0;

    // Scrape each jenjang category
    for (const jenjang of JENJANG_LIST) {
        const count = await scrapeJenjang(jenjang);
        totalAll += count;
        await delay(2000); // Delay between categories
    }

    console.log(`\n✅ Scraping complete! Total schools: ${totalAll}`);
}


// Run the scraper
main().catch(console.error);
