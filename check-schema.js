const db = require('./src/lib/db').default;

async function checkSchema() {
    try {
        console.log("Checking recurring_kajian table schema...");
        const result = await db.execute("PRAGMA table_info(recurring_kajian)");
        console.log(result.rows);
    } catch (e) {
        console.error("Error:", e);
    }
}

checkSchema();
