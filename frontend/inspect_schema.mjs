import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
const fs = require('fs');

const dbConfig = {
    host: '2406:da1c:f42:ae0b:3a41:2d21:1273:3c63',
    port: 5432,
    user: 'postgres',
    password: 'superrohith007',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

async function inspectSchema() {
    console.log('[INFO] Connecting to database to inspect schema...');
    const client = new Client(dbConfig);
    try {
        await client.connect();

        // Check if table exists
        const resTable = await client.query("SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'");
        if (resTable.rows.length === 0) {
            console.error('[ERROR] Table public.users DOES NOT EXIST!');
            fs.writeFileSync('error.txt', 'Table public.users DOES NOT EXIST!');
        } else {
            console.log('[INFO] Table public.users exists.');

            // Check columns
            const resCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'");
            console.log('[INFO] Columns in public.users:');
            let output = 'Columns:\n';
            resCols.rows.forEach(row => {
                console.log(` - ${row.column_name} (${row.data_type})`);
                output += ` - ${row.column_name} (${row.data_type})\n`;
            });
            fs.writeFileSync('success.txt', output);
        }
    } catch (e) {
        console.error(`[ERROR] Failed to inspect schema: ${e.message}`);
        fs.writeFileSync('error.txt', `ERROR: ${e.message}\nSTACK: ${e.stack}`);
    } finally {
        await client.end();
    }
}

inspectSchema();
