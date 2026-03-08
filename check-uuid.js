const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sxdkedopdneocnbomjbi.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZGtlZG9wZG5lb2NuYm9tamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM2NjIwMywiZXhwIjoyMDg1OTQyMjAzfQ.grmNlTGsKqq8xVvpHcjK9rF6YPl3weidK_KSvx7xLOI';

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    // 1. Check auth users (Supabase internal)
    console.log('=== Supabase Auth Users ===');
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
        console.log('Auth list error:', authErr.message);
    } else {
        authUsers.users.forEach(u => {
            console.log(`  Auth UUID: ${u.id}  Email: ${u.email}  Role: ${u.user_metadata?.role || u.app_metadata?.role || 'none'}`);
        });
    }

    // 2. Check backend users table
    console.log('\n=== Backend users table ===');
    const { data: dbUsers, error: dbErr } = await supabase.from('users').select('id, email, role, status');
    if (dbErr) {
        console.log('DB error:', dbErr.message);
    } else {
        dbUsers.forEach(u => {
            console.log(`  DB UUID:   ${u.id}  Email: ${u.email}  Role: ${u.role}  Status: ${u.status}`);
        });
    }

    // 3. Cross-reference
    console.log('\n=== UUID Match Check ===');
    if (authUsers?.users && dbUsers) {
        authUsers.users.forEach(authUser => {
            const match = dbUsers.find(db => db.id === authUser.id);
            const emailMatch = dbUsers.find(db => db.email === authUser.email);
            if (match) {
                console.log(`✅ ${authUser.email}: Auth UUID = DB UUID (${authUser.id})`);
            } else if (emailMatch) {
                console.log(`⚠️  ${authUser.email}: Email matches but UUIDs DIFFER!`);
                console.log(`     Auth UUID: ${authUser.id}`);
                console.log(`     DB UUID:   ${emailMatch.id}`);
            } else {
                console.log(`❌ ${authUser.email}: NOT FOUND in backend DB (Auth UUID: ${authUser.id})`);
            }
        });
    }
}

main().catch(console.error);
