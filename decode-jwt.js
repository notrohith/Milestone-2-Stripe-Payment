// Run: node decode-jwt.js <token>
const token = process.argv[2];
if (!token) { console.log("Usage: node decode-jwt.js <jwt_token>"); process.exit(1); }
const parts = token.split('.');
if (parts.length !== 3) { console.log("Not a valid JWT"); process.exit(1); }
const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
console.log("sub (UUID):", payload.sub);
console.log("email:", payload.email);
console.log("app_metadata.role:", payload.app_metadata?.role);
console.log("user_metadata.role:", payload.user_metadata?.role);
console.log("user_metadata.name:", payload.user_metadata?.name);
console.log("\nFull payload:", JSON.stringify(payload, null, 2));
