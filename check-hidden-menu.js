const { createClient } = require('@libsql/client');
const path = require('path');

const db = createClient({
    url: `file:${path.join(process.cwd(), 'kajian.db')}`
});

async function checkHiddenMenu() {
    try {
        // Check if there's a hidden_menu in layout settings
        const result = await db.execute("SELECT value FROM settings WHERE key = 'homepage_layout'");

        if (result.rows.length > 0) {
            const layout = JSON.parse(result.rows[0].value);
            console.log('Current homepage_layout:', JSON.stringify(layout, null, 2));

            if (layout.hidden_menu && layout.hidden_menu.length > 0) {
                console.log('\n⚠️  Found hidden_menu:', layout.hidden_menu);
                console.log('This might be hiding the Ambulance Gratis menu item!');

                // Remove 'ambulance' from hidden_menu if it exists
                const updatedHiddenMenu = layout.hidden_menu.filter(id => id !== 'ambulance');
                layout.hidden_menu = updatedHiddenMenu;

                await db.execute({
                    sql: "UPDATE settings SET value = ? WHERE key = 'homepage_layout'",
                    args: [JSON.stringify(layout)]
                });

                console.log('\n✅ Updated hidden_menu to:', updatedHiddenMenu);
                console.log('Ambulance should now be visible. Please refresh your browser!');
            } else {
                console.log('\nNo items in hidden_menu. The issue might be elsewhere.');
            }
        } else {
            console.log('No homepage_layout settings found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkHiddenMenu();
