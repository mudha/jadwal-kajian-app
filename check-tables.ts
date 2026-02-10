import db from './src/lib/db';

async function checkTables() {
    try {
        const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Tables:", result.rows.map(r => r.name));

        // Check columns of recurring_kajian_old if it exists
        const tableOld = result.rows.find(r => r.name === 'recurring_kajian_old');
        if (tableOld) {
            const cols = await db.execute("PRAGMA table_info(recurring_kajian_old)");
            console.log("Columns of recurring_kajian_old:", cols.rows.map(c => c.name));
        }
    } catch (e) {
        console.error(e);
    }
}

checkTables();
