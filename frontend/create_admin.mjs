import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');

const supabaseUrl = "https://sxdkedopdneocnbomjbi.supabase.co";
const supabaseAnonKey = "sb_publishable_qMxp5XrC-62ivklh41OQ8Q_JuJ1ryuN";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'rohith@corideadmin.com';
const password = 'bruhlmao';

async function createAdmin() {
    console.log(`[INFO] Starting Admin Creation Process...`);

    // 1. Supabase Auth Logic
    let session;
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (!signInError && signInData.session) {
        console.log('[INFO] User already exists and signed in successfully.');
        session = signInData.session;
    } else {
        console.log('[INFO] User not found or wrong password. Attempting to Sign Up...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            console.error('[ERROR] Sign Up failed:', JSON.stringify(signUpError, null, 2));
            return;
        }

        if (signUpData.user) {
            console.log('[INFO] Sign Up successful.');
            session = signUpData.session;
        }
    }

    if (session) {
        console.log(`[INFO] Authenticated. User ID: ${session.user.id}`);
        // 2. Sync User via Backend API
        await syncUserRecord(session.user.id, session.access_token);
    } else {
        console.error('[ERROR] Could not obtain valid session.');
    }
}

async function syncUserRecord(userId, token) {
    console.log('[INFO] Syncing user record via backend API...');

    const payload = JSON.stringify({
        id: userId,
        email: email,
        name: 'RideWithMe Admin',
        role: 'ADMIN'
    });

    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/sync',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length,
            'Authorization': `Bearer ${token}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('[SUCCESS] User synced successfully!');
                    console.log('Response:', data);
                    resolve();
                } else {
                    console.error(`[ERROR] Sync failed with status ${res.statusCode}`);
                    console.error('Response:', data);
                    resolve(); // Resolve anyway to finish script logic gracefully
                }
            });
        });

        req.on('error', (e) => {
            console.error(`[ERROR] Request failed: ${e.message}`);
            resolve();
        });

        req.write(payload);
        req.end();
    });
}

createAdmin();
