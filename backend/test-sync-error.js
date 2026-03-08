const id = "11111111-1111-1111-1111-111111111111"; // different id

fetch('http://localhost:8080/api/auth/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        id: id,
        email: "lol@gmail.com", // the user's email
        name: "Test User",
        role: "driver"
    })
}).then(res => res.text().then(text => console.log(res.status, text)))
    .catch(err => console.error(err));
