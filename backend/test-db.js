const { Client } = require('pg');
const fs = require('fs');

async function testConnection(name, config) {
    const client = new Client(config);
    try {
        await client.connect();
        await client.end();
        return { name, status: 'SUCCESS' };
    } catch (err) {
        return { name, status: 'FAILED', error: err.message };
    }
}

async function runTests() {
    const password = 'superrohith007'; // from properties
    const ref = 'sxdkedopdneocnbomjbi';

    const configs = [
        {
            name: 'Pooler 6543 postgres.[ref]',
            host: 'aws-0-ap-southeast-2.pooler.supabase.com',
            port: 6543,
            user: `postgres.${ref}`,
            password,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        },
        {
            name: 'Pooler 5432 postgres.[ref]',
            host: 'aws-0-ap-southeast-2.pooler.supabase.com',
            port: 5432,
            user: `postgres.${ref}`,
            password,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        },
        {
            name: 'Direct 5432 postgres.[ref]',
            host: `db.${ref}.supabase.co`,
            port: 5432,
            user: `postgres.${ref}`,
            password,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        },
        {
            name: 'Direct 5432 postgres',
            host: `db.${ref}.supabase.co`,
            port: 5432,
            user: 'postgres',
            password,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        }
    ];

    const results = [];
    for (const c of configs) {
        const { name, ...pgConfig } = c;
        const res = await testConnection(name, pgConfig);
        results.push(res);
    }

    fs.writeFileSync('res.json', JSON.stringify(results, null, 2));
}

runTests();
