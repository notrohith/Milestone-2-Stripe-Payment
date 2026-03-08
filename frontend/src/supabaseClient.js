import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sxdkedopdneocnbomjbi.supabase.co";

// Public anon key — for auth flows (login, signup)
const supabaseAnonKey = "sb_publishable_qMxp5XrC-62ivklh41OQ8Q_JuJ1ryuN";

// Service role key — bypasses ALL RLS policies (for admin DB writes)
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZGtlZG9wZG5lb2NuYm9tamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM2NjIwMywiZXhwIjoyMDg1OTQyMjAzfQ.grmNlTGsKqq8xVvpHcjK9rF6YPl3weidK_KSvx7xLOI";

// Custom fetch with retry for transient SSL/network errors (Supabase 525, etc)
const fetchWithRetry = async (url, options = {}, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            return res;
        } catch (err) {
            if (attempt === retries) throw err;
            // Wait 1s before retry
            await new Promise(r => setTimeout(r, 1000));
        }
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'coride-auth-token-v2',
        // Disable Navigator LockManager to prevent stale-lock timeouts
        lock: (name, acquireTimeout, fn) => fn(),
    },
    global: {
        fetch: fetchWithRetry,
    },
});

// supabaseAdmin uses the service role key — bypasses RLS for all table operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    }
});

