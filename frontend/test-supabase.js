const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabaseUrl = "https://sxdkedopdneocnbomjbi.supabase.co";
const supabaseAnonKey = "sb_publishable_qMxp5XrC-62ivklh41OQ8Q_JuJ1ryuN";
const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

async function uploadFileTest() {
    try {
        const fileContent = "dummy content";
        const file = new Blob([fileContent], { type: 'text/plain' });

        const fileName = `test_upload_${Date.now()}.txt`;
        const filePath = `uploads/${fileName}`;

        console.log("Testing upload...");
        const { error, data } = await supabaseAdmin.storage
            .from('documents')
            .upload(filePath, fileContent, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'text/plain',
            });

        if (error) {
            console.error("Upload error:", error);
        } else {
            console.log("Upload success:", data);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

async function registerTest() {
    try {
        console.log("Testing register...");
        const userId = crypto.randomUUID();

        const userRow = {
            id: userId,
            email: `test_${Date.now()}@example.com`,
            name: "Test User",
            role: "RIDER",
            status: 'PENDING',
            phone_number: "1234567890",
            date_of_birth: "1990-01-01",
            gender: "Male",
            address: "123 Street",
        };

        const { error: userError } = await supabaseAdmin.from('users').insert(userRow);
        if (userError) {
            console.error("User insert failed:", userError.message);
        } else {
            console.log("Success register!");
        }
    } catch (e) {
        console.error("Register exception", e);
    }
}

async function main() {
    await uploadFileTest();
    await registerTest();
}

main();
