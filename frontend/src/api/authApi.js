import axiosClient from "./axiosClient";
import { supabase, supabaseAdmin } from "../supabaseClient";

/**
 * Upload a file directly to Supabase Storage (no backend needed).
 * Files land in the 'documents' bucket under a unique path.
 * Returns the public URL of the uploaded file.
 */
export const uploadFile = async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabaseAdmin.storage
        .from('documents')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
        });

    if (error) throw new Error(error.message);

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
        .from('documents')
        .getPublicUrl(filePath);

    // Return in same shape as before so callers don't need changes
    return { data: urlData.publicUrl };
};

/**
 * Register user directly to Supabase PostgreSQL tables.
 * Completely bypasses Spring Boot backend — no Spring Security issues.
 */
export const registerUser = async (userData) => {
    const generateId = () => {
        return (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    };
    const userId = userData.id || generateId();

    // 0. Check for duplicate email — non-fatal if the check fails (RLS/network)
    // The DB unique constraint on email will still reject true duplicates at insert time.
    try {
        const { data: existingArr } = await supabase
            .from('users')
            .select('id, status')
            .eq('email', userData.email)
            .limit(1);

        const existing = existingArr?.[0] || null;
        if (existing) {
            if (existing.status === 'PENDING') {
                throw new Error('This email is already registered and pending approval. Please wait for admin approval.');
            } else if (existing.status === 'APPROVED') {
                throw new Error('This email is already registered and approved. Please log in instead.');
            } else {
                throw new Error('This email is already registered. Please contact support if you think this is a mistake.');
            }
        }
    } catch (e) {
        // Re-throw only if it's our own "already registered" message
        if (e.message.toLowerCase().includes('already registered') || e.message.toLowerCase().includes('pending approval')) {
            throw e;
        }
        // Otherwise (network/RLS failure) — silently continue, insert will fail if truly duplicate
        console.warn('Duplicate check skipped (network/RLS):', e.message);
    }

    // 1. Insert into users table
    const userRow = {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: 'PENDING',
        phone_number: userData.phoneNumber,
        date_of_birth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        aadhar_card_url: userData.aadharCardUrl || null,
        pan_card_url: userData.panCardUrl || null,
        driving_license_url: userData.drivingLicenseUrl || null,
        profile_photo_url: userData.profilePhotoUrl || null,
    };

    const { error: userError } = await supabaseAdmin.from('users').insert(userRow);
    if (userError) throw new Error('User insert failed: ' + userError.message);

    // 2. Education details
    if (userData.educationDetails && userData.educationDetails.length > 0) {
        const eduRows = userData.educationDetails
            .filter(e => e.institutionName) // skip empty rows
            .map(e => ({
                level: e.level,
                institution_name: e.institutionName,
                passing_year: e.passingYear,
                percentage: e.percentage ? parseFloat(e.percentage) : null,
                user_id: userId,
            }));
        if (eduRows.length > 0) {
            const { error: eduError } = await supabaseAdmin.from('education').insert(eduRows);
            if (eduError) console.warn('Education insert warning:', eduError.message);
        }
    }

    // 3. Vehicle details (drivers only)
    if (userData.vehicleDetails) {
        const v = userData.vehicleDetails;
        const vehicleRow = {
            company: v.company,
            model: v.model,
            registration_number: v.registrationNumber,
            rc_number: v.rcNumber,
            insurance_number: v.insuranceNumber,
            year_of_model: v.yearOfModel ? parseInt(v.yearOfModel) : null,
            has_ac: v.hasAc || false,
            audio_system: v.audioSystem || null,
            km_driven: v.kmDriven ? parseInt(v.kmDriven) : null,
            color: v.color,
            user_id: userId,
            // NOTE: No image_urls column — images go into vehicle_images join table
        };
        const { data: vData, error: vError } = await supabaseAdmin.from('vehicles').insert(vehicleRow).select();
        if (vError) console.warn('Vehicle insert warning:', vError.message);

        // Insert vehicle images into the vehicle_images join table
        if (!vError && vData && vData[0] && v.imageUrls && v.imageUrls.length > 0) {
            const imageRows = v.imageUrls.map(url => ({ vehicle_id: vData[0].id, image_url: url }));
            const { error: imgError } = await supabaseAdmin.from('vehicle_images').insert(imageRows);
            if (imgError) console.warn('Vehicle images insert warning:', imgError.message);
        }
    }

    return { data: { id: userId, status: 'PENDING' } };
};

export const getPendingUsers = () => {
    return axiosClient.get("/api/admin/pending-users");
};

/**
 * Generate a completely random secure password (16 chars: mixed upper, lower, digits, symbols).
 */
const generateRandomPassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}";
    const all = upper + lower + digits + symbols;

    // Ensure at least one of each type for validity
    const pick = (src) => src[Math.floor(Math.random() * src.length)];
    const rand = Array.from({ length: 12 }, () => pick(all));
    const password = [pick(upper), pick(lower), pick(digits), pick(symbols), ...rand];

    // Shuffle the array to avoid predictable positions
    for (let i = password.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [password[i], password[j]] = [password[j], password[i]];
    }
    return password.join('');
};

/**
 * Approve a user:
 * 1. Creates their Supabase Auth account (or updates password if already exists)
 * 2. Sends a beautiful approval email via Resend with the temp password
 * 3. Marks user as APPROVED in the users table
 */
export const approveUserWithEmail = async (userId, email, name, role) => {
    const tempPassword = generateRandomPassword();

    const supabaseUrl = "https://sxdkedopdneocnbomjbi.supabase.co";
    const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZGtlZG9wZG5lb2NuYm9tamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM2NjIwMywiZXhwIjoyMDg1OTQyMjAzfQ.grmNlTGsKqq8xVvpHcjK9rF6YPl3weidK_KSvx7xLOI";

    const adminHeaders = {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
    };

    // Step 1: Create the user's Supabase Auth account with the temp password
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { name, firstLogin: true, role: role || 'RIDER' }
        })
    });

    if (!createRes.ok) {
        const errBody = await createRes.json();
        const msg = errBody?.msg || errBody?.message || JSON.stringify(errBody);

        // User already exists in Supabase Auth — just update their password
        if (createRes.status === 422 || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
            const listRes = await fetch(
                `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&per_page=1`,
                { headers: adminHeaders }
            );
            if (listRes.ok) {
                const listData = await listRes.json();
                const existing = (listData.users || []).find(u => u.email === email);
                if (existing) {
                    await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
                        method: "PUT",
                        headers: adminHeaders,
                        body: JSON.stringify({
                            password: tempPassword,
                            user_metadata: { ...existing.user_metadata, firstLogin: true, role: role || existing.user_metadata?.role || 'RIDER' }
                        })
                    });
                }
            }
        } else {
            throw new Error(`Failed to create auth user: ${msg}`);
        }
    }

    // Step 2: Send beautiful approval email via the Spring Boot backend
    try {
        const emailRes = await fetch('http://localhost:8080/api/admin/send-approval-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, tempPassword }),
        });

        if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.warn('Backend email send failed:', errText);
            // Ignoring email failure so that approval still completes!
        }
    } catch (emailErr) {
        console.error('Failed to send approval email (backend may be down):', emailErr.message);
        // Ignoring email failure locally so the driver can still be tested
    }

    // Step 3: Mark approved in users table
    const { error: dbErr } = await supabaseAdmin.from('users').update({ status: 'APPROVED' }).eq('id', userId);
    if (dbErr) throw new Error(`DB update failed: ${dbErr.message}`);

    return { tempPassword };
};

export const approveUser = (userId) => {
    return supabaseAdmin.from('users').update({ status: 'APPROVED' }).eq('id', userId);
};

export const rejectUser = async (userId) => {
    const { error } = await supabaseAdmin.from('users').update({ status: 'REJECTED' }).eq('id', userId);
    if (error) throw new Error(error.message);
};
