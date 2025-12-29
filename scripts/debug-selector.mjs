
import axios from 'axios';
import * as cheerio from 'cheerio';

async function debug() {
    console.log('Fetching https://sekolahsunnah.com/level/SD ...');
    try {
        const response = await axios.get('https://sekolahsunnah.com/level/SD', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        console.log('Title:', $('title').text());

        // Check for .list-view
        console.log('.list-view count:', $('.list-view').length);

        // Check for .item
        console.log('.item count:', $('.item').length);

        // Check for a.title
        console.log('a.title count:', $('a.title').length);

        // Dump first item classes if any
        const firstItem = $('.item').first();
        if (firstItem.length) {
            console.log('First item classes:', firstItem.attr('class'));
            console.log('First item html (partial):', firstItem.html().substring(0, 100));
        }

        // Dump first a.title parent hierarchy
        const firstTitle = $('a.title').first();
        if (firstTitle.length) {
            console.log('First title parent classes:', firstTitle.parent().attr('class'));
            console.log('First title grand-parent classes:', firstTitle.parent().parent().attr('class'));
        }

    } catch (e) {
        console.error(e);
    }
}

debug();
