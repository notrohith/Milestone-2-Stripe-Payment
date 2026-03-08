const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://sxdkedopdneocnbomjbi.supabase.co';
const supabaseKey = 'sb_publishable_qMxp5XrC-62ivklh41OQ8Q_JuJ1ryuN';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    try {
        console.log('Testing upload to "documents" bucket...');
        const fileContent = 'test data';
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(`test_${Date.now()}.txt`, fileContent, {
                contentType: 'text/plain',
                upsert: true
            });

        if (error) {
            console.error('SUPABASE UPLOAD ERROR:', error.message);
        } else {
            console.log('SUPABASE UPLOAD SUCCESS:', data);
        }
    } catch (e) {
        console.error('SCRIPT EXCEPTION:', e.message);
    }
}

testUpload();
