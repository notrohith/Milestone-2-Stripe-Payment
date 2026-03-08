async function test() {
    try {
        const res = await fetch('http://localhost:8080/api/auth/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: '90e227fc-c9da-4e2b-9dd7-73d8a9e40003',
                email: 'test@test.com',
                name: 'test',
                role: 'RIDER'
            })
        });
        const text = await res.text();
        console.log(res.status, text);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
test();
