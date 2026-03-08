async function test() {
    try {
        const res = await fetch('http://localhost:8080/api/auth/sync', {
            method: 'POST',
            headers: {
                'Origin': 'http://localhost:3000',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer INVALID_JWT'
            },
            body: JSON.stringify({
                id: '90e227fc-c9da-4e2b-9dd7-73d8a9e40003',
                email: 'test@test.com',
                name: 'test',
                role: 'RIDER'
            })
        });
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("BODY:", text);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
test();
