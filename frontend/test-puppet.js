const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
    page.on('dialog', async dialog => {
        console.log('BROWSER_ALERT:', dialog.message());
        await dialog.dismiss();
    });

    console.log("Navigating to signup...");
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });

    // Step 1: Role
    console.log("Clicking role...");
    await page.evaluate(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        if (cards.length > 0) cards[0].click(); // Rider
    });
    await page.click('button.bg-teal-600'); // Next

    // Step 2: Personal
    console.log("Filling personal...");
    await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        inputs[0].value = 'John';
        inputs[1].value = 'Doe';
        inputs[2].value = 'test@example.com';
        inputs[3].value = '1990-01-01'; // DOB
        inputs[4].value = '1234567890'; // Phone
        document.querySelector('select').value = 'Male';
        inputs.forEach(i => i.dispatchEvent(new Event('input', { bubbles: true })));
        document.querySelector('select').dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.click('button.bg-teal-600'); // Next

    // Step 3: Address
    console.log("Filling address...");
    await page.evaluate(() => {
        const ta = document.querySelector('textarea');
        ta.value = '123 Street';
        ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.click('button.bg-teal-600'); // Next

    // Step 4: Education
    console.log("Filling education...");
    await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        // 9 inputs total
        for (let i = 0; i < 9; i++) {
            inputs[i].value = i % 3 === 0 ? 'School' : i % 3 === 1 ? '2010' : '90';
            inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await page.click('button.bg-teal-600'); // Next

    // Step 5: Submit
    console.log("Clicking Submit...");
    await page.click('button.bg-teal-600'); // Submit

    // Wait a bit to see output
    await new Promise(r => setTimeout(r, 3000));
    console.log("Done testing.");
    await browser.close();
})();
