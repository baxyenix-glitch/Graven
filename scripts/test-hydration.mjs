import { chromium, devices } from '@playwright/test';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:3000';

async function testHydration() {
  console.log('Testing /debug-tap on Pixel 7 and iPhone 13...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const deviceName of ['Pixel 7', 'iPhone 13']) {
    console.log(`\n--- Device: ${deviceName} ---`);
    const context = await browser.newContext({
      ...devices[deviceName],
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(`${BASE_URL}/debug-tap`, { waitUntil: 'networkidle' });

    // Read counter before tap
    const plainBtn = page.locator('#plain-tap-btn');
    const layoutBtn = page.locator('#layout-tap-btn');

    console.log('Initial plain text:', await plainBtn.innerText());
    console.log('Initial layout text:', await layoutBtn.innerText());

    // Tap both
    await plainBtn.tap();
    await page.waitForTimeout(500);

    await layoutBtn.tap();
    await page.waitForTimeout(500);

    console.log('After tap plain text:', await plainBtn.innerText());
    console.log('After tap layout text:', await layoutBtn.innerText());

    console.log('Console Errors:', consoleMessages.filter((m) => m.type === 'error'));
    console.log('Console Warnings:', consoleMessages.filter((m) => m.type === 'warning'));
    console.log('Page Errors:', pageErrors);

    await context.close();
  }

  await browser.close();
}

testHydration().catch(console.error);
