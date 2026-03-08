const dns = require('dns');

console.log('Resolving db.sxdkedopdneocnbomjbi.supabase.co...');

dns.lookup('db.sxdkedopdneocnbomjbi.supabase.co', { all: true }, (err, addresses) => {
    if (err) {
        console.error('Lookup failed:', err);
    } else {
        console.log('Addresses:', JSON.stringify(addresses, null, 2));
        const fileContent = JSON.stringify(addresses, null, 2);
        require('fs').writeFileSync('ips.json', fileContent);
    }
});
