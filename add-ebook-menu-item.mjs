import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const NEW_ITEM = {
    id: 'ebook-islami',
    label: 'Ebook Islami',
    iconName: 'BookOpen',
    href: '#',
    gradient: 'from-cyan-500 to-cyan-600',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    badge: 'SOON'
};

async function updateMenu() {
    try {
        // 1. Get current settings
        const result = await db.execute("SELECT * FROM settings WHERE key = 'quick_menu_items'");

        let items = [];
        if (result.rows.length > 0) {
            items = JSON.parse(result.rows[0].value);
        } else {
            console.log("No custom settings found. Nothing to update (code defaults will be used).");
            return;
        }

        // 2. Check if already exists
        const exists = items.some(item => item.id === 'ebook-islami');
        if (exists) {
            console.log("Item 'ebook-islami' already exists in settings.");
            return;
        }

        // 3. Insert at index 1 (after Sekolah Sunnah) or 0 if empty
        // Find index of Sekolah Sunnah to be safe, or just index 1
        const targetIndex = 1;
        items.splice(targetIndex, 0, NEW_ITEM);

        // 4. Update DB
        await db.execute({
            sql: "UPDATE settings SET value = ? WHERE key = 'quick_menu_items'",
            args: [JSON.stringify(items)]
        });

        console.log("✅ Successfully added 'Ebook Islami' to quick_menu_items in database!");
        console.log("New items count:", items.length);

    } catch (error) {
        console.error('Error updating menu:', error);
    }
}

updateMenu();
