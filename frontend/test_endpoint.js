const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/reload-schema',
    method: 'POST'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
});

req.end();
