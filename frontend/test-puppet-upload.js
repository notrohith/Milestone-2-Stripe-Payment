const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err));

    try {
        await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });

        // Go through steps to reach documents
        await page.click('text/Rider');
        await page.click('button[type="submit"]'); // Next to personal

        await page.type('input[type="email"]', 'test@example.com');
        await page.type('input[placeholder="First Name"]', 'First');
        await page.type('input[placeholder="Last Name"]', 'Last');
        await page.type('input[type="date"]', '1990-01-01');
        await page.select('select', 'Male');
        await page.type('input[type="tel"]', '1234567890');
        await page.click('button[type="submit"]'); // Next to address

        await page.type('textarea', '123 Test St');
        await page.click('button[type="submit"]'); // Next to education

        await page.type('input[placeholder="Institution Name"]', 'School');
        await page.type('input[placeholder="Passing Year"]', '2010');
        await page.type('input[placeholder="Percentage"]', '90');
        await page.click('button[type="submit"]'); // Next to documents

        // Wait for the Aadhar card file input to appear
        const fileInputs = await page.$$('input[type="file"]');
        if (fileInputs.length > 0) {
            console.log('File inputs found:', fileInputs.length);
            // Attempt to upload a dummy file to the first input (Aadhar)
            await fileInputs[0].uploadFile('test-upload.js');
            console.log('Uploaded test script to Aadhar input. Waiting a moment...');
            await page.waitForTimeout(3000);
        } else {
            console.log('No file input found!');
        }

    } catch (e) {
        console.error('PUPPETEER ERROR:', e);
    } finally {
        await browser.close();
    }
})();
