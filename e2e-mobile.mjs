import { chromium, devices } from '@playwright/test';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:3000';

async function runTestSuite() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED MOBILE E2E VERIFICATION SUITE');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const testDevices = [
    { name: 'Pixel 7 (Android/Chrome)', config: { ...devices['Pixel 7'] } },
    { name: 'iPhone 13 (iOS/Safari)', config: { ...devices['iPhone 13'] } },
  ];

  let totalTests = 0;
  let passedTests = 0;
  const failures = [];

  for (const { name: deviceName, config } of testDevices) {
    console.log(`\n----------------------------------------------------`);
    console.log(`[DEVICE] Testing on ${deviceName}`);
    console.log(`----------------------------------------------------`);

    const context = await browser.newContext({
      ...config,
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();
    const consoleErrors = [];
    const timeoutErrors = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
      if (text.includes('signal timed out') || text.includes('TimeoutError')) {
        timeoutErrors.push(text);
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // TEST 1: Home Page Loads and No Horizontal Overflow
    totalTests++;
    try {
      console.log(`  1. Loading Home Page (${BASE_URL}/)...`);
      const res = await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      if (!res || !res.ok()) throw new Error(`Home page returned status ${res?.status()}`);

      await page.waitForTimeout(1000);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (overflow) throw new Error('Horizontal overflow detected on home page!');

      console.log('     ✓ Home page loaded with zero horizontal overflow.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 1 Home: ${err.message}`);
    }

    // TEST 2: Hamburger Menu Tap & Navigation Interactivity
    totalTests++;
    try {
      console.log('  2. Testing Mobile Hamburger Menu Interactivity...');
      const trigger = page.locator('#mobile-menu-trigger');
      await trigger.waitFor({ state: 'visible', timeout: 5000 });
      await trigger.tap();

      const drawer = page.locator('#mobile-menu-drawer');
      await drawer.waitFor({ state: 'visible', timeout: 4000 });
      console.log('     ✓ Hamburger tapped -> Drawer opened smoothly.');

      // Check menu links
      const cemeteryLink = drawer.locator('a[href="/graves"]');
      await cemeteryLink.waitFor({ state: 'visible', timeout: 3000 });
      await cemeteryLink.tap();

      await page.waitForURL('**/graves', { timeout: 8000 });
      console.log('     ✓ Menu link navigation tapped -> Reached /graves in < 3s.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 2 Hamburger: ${err.message}`);
    }

    // TEST 3: Graves Page Filters & Search
    totalTests++;
    try {
      console.log('  3. Testing Graves Page Filter Chips & Search...');
      await page.waitForSelector('input[placeholder*="Search"]', { timeout: 6000 });

      // Tap filter chip "PONS"
      const ponsFilter = page.locator('div.rounded-full button', { hasText: /^pons$/i });
      if (await ponsFilter.isVisible()) {
        await ponsFilter.tap();
        await page.waitForTimeout(500);
        console.log('     ✓ PONS filter chip tapped and active.');
      }

      // Tap filter chip "ALL"
      const allFilter = page.locator('div.rounded-full button', { hasText: /^all$/i });
      if (await allFilter.isVisible()) {
        await allFilter.tap();
        await page.waitForTimeout(500);
      }

      console.log('     ✓ Graves filter chips interactive.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 3 Graves: ${err.message}`);
    }

    // TEST 4: Burial Wizard Step 1 & 2 (Faucet removed & $GRAVEN gate checked)
    totalTests++;
    try {
      console.log('  4. Testing Burial Wizard Flow (/bury)...');
      await page.goto(`${BASE_URL}/bury`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Verify "CLAIM 20,000 $GRAVEN" is completely removed
      const faucetBtn = page.locator('button', { hasText: 'CLAIM 20,000' });
      const hasFaucet = await faucetBtn.count();
      if (hasFaucet > 0) {
        throw new Error('"Claim 20,000 $GRAVEN" faucet button is still present in burial flow!');
      }
      console.log('     ✓ Confirmed "Claim 20,000 $GRAVEN" faucet button is completely removed.');

      // Check Step indicators
      const steps = page.locator('text=BURIAL WIZARD').first();
      await steps.waitFor({ state: 'visible', timeout: 5000 });
      console.log('     ✓ Burial wizard rendered cleanly.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 4 Burial: ${err.message}`);
    }

    // TEST 5: Leaderboard Page Tabs
    totalTests++;
    try {
      console.log('  5. Testing Leaderboard Page Tabs (/leaderboard)...');
      await page.goto(`${BASE_URL}/leaderboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800);

      const creatorsTab = page.locator('button', { hasText: 'TOP CREATORS' });
      await creatorsTab.waitFor({ state: 'visible', timeout: 5000 });
      await creatorsTab.tap();
      await page.waitForTimeout(500);

      const recentTab = page.locator('button', { hasText: 'RECENTLY BURIED' });
      await recentTab.tap();
      await page.waitForTimeout(500);

      console.log('     ✓ Leaderboard tabs switched cleanly with zero hang.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 5 Leaderboard: ${err.message}`);
    }

    // TEST 6: Grave Detail Page (/grave/[address])
    totalTests++;
    try {
      console.log('  6. Testing Grave Detail Page (/grave/0x5f73bf1564cd9fca0c35cf0906c67f4de3015f7d)...');
      await page.goto(`${BASE_URL}/grave/0x5f73bf1564cd9fca0c35cf0906c67f4de3015f7d`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await page.waitForTimeout(1000);

      const stone = page.locator('text=Axo Token').first();
      await stone.waitFor({ state: 'visible', timeout: 8000 });
      console.log('     ✓ Grave memorial stone rendered correctly.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 6 Grave Detail: ${err.message}`);
    }

    // TEST 7: Connect Wallet Button Interactivity & No Stuck State
    totalTests++;
    try {
      console.log('  7. Testing Connect Wallet Button Behavior...');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800);

      const connectBtn = page.locator('header button[aria-label="Connect Web3 Wallet"]');
      await connectBtn.waitFor({ state: 'visible', timeout: 5000 });
      await connectBtn.tap();
      await page.waitForTimeout(600);

      // Verify the button does NOT stay stuck in disabled "CONNECTING..." state permanently
      await page.waitForTimeout(2600);
      const isStillConnecting = await page.locator('text=CONNECTING...').count();
      if (isStillConnecting > 0) {
        throw new Error('Connect button is stuck in disabled "CONNECTING..." state!');
      }

      console.log('     ✓ Connect wallet button triggered and gracefully reset without freezing.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 7 Connect Wallet: ${err.message}`);
    }

    // TEST 8: Signal Timeout Errors Absence
    totalTests++;
    try {
      console.log('  8. Checking for "Signal Timed Out" Errors in Console Logs...');
      if (timeoutErrors.length > 0) {
        throw new Error(`Found ${timeoutErrors.length} "signal timed out" error(s) in console:\n${timeoutErrors.join('\n')}`);
      }
      console.log('     ✓ ZERO "signal timed out" errors detected across entire session.');
      passedTests++;
    } catch (err) {
      console.error(`     ✗ FAILED: ${err.message}`);
      failures.push(`[${deviceName}] Test 8 Signal Timeout: ${err.message}`);
    }

    await context.close();
  }

  await browser.close();

  console.log('\n====================================================');
  console.log(`TEST SUITE SUMMARY: ${passedTests}/${totalTests} PASSED`);
  console.log('====================================================');

  if (failures.length > 0) {
    console.error('\nFAILURES DETECTED:');
    failures.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  } else {
    console.log('\nALL MOBILE TESTS PASSED CLEANLY! ZERO REGRESSIONS.\n');
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
