const jwt = require('jsonwebtoken');

const secretStr = "gCiBmsBPZLnYz4SjmA0rXWRjXCthyZ0At1+mSA+UNYCL/CYz8LvI/W9puN5ZbJXcsQne78eT6Yu/NtKMj6jBvA==";
const secret = Buffer.from(secretStr, 'base64');

const token = jwt.sign(
    {
        sub: "11111111-1111-1111-1111-111111111111",
        email: "lol@gmail.com",
        app_metadata: { role: "driver" }
    },
    secret,
    { algorithm: "HS256", expiresIn: "10h" }
);

fetch('http://localhost:8080/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
}).then(res => res.text().then(t => console.log(res.status, t)))
    .catch(console.error);
