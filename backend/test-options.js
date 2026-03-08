async function test() {
    try {
        const res = await fetch('http://localhost:8080/api/auth/sync', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'authorization, content-type'
            }
        });
        const text = await res.text();
        console.log(res.status, res.headers.get('access-control-allow-origin'));
    } catch (e) {
        console.error("ERROR:", e);
    }
}
test();
