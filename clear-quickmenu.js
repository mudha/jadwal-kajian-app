const { createClient } = require('@libsql/client');
const path = require('path');

const db = createClient({
    url: `file:${path.join(process.cwd(), 'kajian.db')}`
});

async function clearQuickMenuSettings() {
    try {
        // Check if quick menu settings exist
        const result = await db.execute("SELECT value FROM settings WHERE key = 'quick_menu_items'");

        if (result.rows.length > 0) {
            console.log('Found existing quick menu settings. Deleting to use defaults...');
            await db.execute("DELETE FROM settings WHERE key = 'quick_menu_items'");
            console.log('✅ Quick menu settings cleared. The app will now use default items including Ambulance Gratis.');
        } else {
            console.log('No quick menu settings found. Defaults will be used automatically.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

clearQuickMenuSettings();
