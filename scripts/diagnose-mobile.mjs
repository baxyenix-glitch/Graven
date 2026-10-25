import { chromium, devices } from '@playwright/test';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:3000';

const routes = [
  '/',
  '/graves',
  '/bury',
  '/dashboard',
  '/leaderboard',
  '/how-it-works',
  '/faucet',
  '/grave/0x5f73bf1564cd9fca0c35cf0906c67f4de3015f7d',
  '/terms',
  '/privacy',
];

async function diagnose() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('--- STARTING MOBILE SUSPECT AUDIT ---');

  for (const width of [360, 390]) {
    console.log(`\n================ Viewport Width: ${width}px ================`);
    const context = await browser.newContext({
      viewport: { width, height: 800 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    });
    const page = await context.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    for (const route of routes) {
      console.log(`\nChecking route: ${route}`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(1000);

      // 1. Check Horizontal Overflow
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        };
      });
      console.log(`  Overflow check: scrollWidth=${overflow.scrollWidth}, innerWidth=${overflow.innerWidth}, hasOverflow=${overflow.hasOverflow}`);

      // 2. Check Invisible Overlays via elementFromPoint on interactive elements
      const elementReport = await page.evaluate(() => {
        const results = [];
        const selectors = [
          '#mobile-menu-trigger',
          'header button[aria-label="Connect Web3 Wallet"]',
          '#hero-bury-btn',
          'a[href="/bury"]',
          '.hero-btn-bury-compact',
          'button',
        ];

        for (const sel of selectors) {
          const els = document.querySelectorAll(sel);
          els.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight) {
              const cx = Math.round(rect.left + rect.width / 2);
              const cy = Math.round(rect.top + rect.height / 2);
              const topEl = document.elementFromPoint(cx, cy);
              const isMatch = topEl === el || el.contains(topEl);
              results.push({
                selector: `${sel}[${idx}]`,
                tag: el.tagName,
                text: el.innerText ? el.innerText.slice(0, 20) : '',
                point: `(${cx},${cy})`,
                topTag: topEl?.tagName,
                topId: topEl?.id,
                topClass: String((topEl && (topEl.className?.baseVal || topEl.className)) || '').slice(0, 30),
                isMatch,
              });
            }
          });
        }
        return results;
      });

      console.log('  elementFromPoint checks:');
      elementReport.slice(0, 6).forEach((r) => {
        console.log(`    ${r.selector} ("${r.text}") at ${r.point} -> Top: <${r.topTag} id="${r.topId}" class="${r.topClass}"> Match=${r.isMatch}`);
      });

      // 3. Test Hamburger Tap if on page
      if (route === '/') {
        console.log('  Testing Hamburger Tap on route /:');
        const trigger = page.locator('#mobile-menu-trigger');
        if (await trigger.isVisible()) {
          const topBefore = await page.evaluate(() => {
            const btn = document.querySelector('#mobile-menu-trigger');
            if (!btn) return 'none';
            const rect = btn.getBoundingClientRect();
            const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            return el ? el.outerHTML.slice(0, 80) : 'null';
          });
          console.log(`    Hamburger center element: ${topBefore}`);

          await trigger.tap();
          await page.waitForTimeout(500);

          const drawerVisible = await page.locator('#mobile-menu-drawer').isVisible();
          console.log(`    Drawer visible after tap: ${drawerVisible}`);

          // Close it
          if (drawerVisible) {
            await trigger.tap();
            await page.waitForTimeout(300);
          }
        }
      }
    }

    console.log('\nConsole Errors across all routes:');
    const errors = consoleLogs.filter((m) => m.type === 'error');
    errors.forEach((e) => console.log('  [ERROR]', e.text));

    console.log('\nPage Errors across all routes:');
    pageErrors.forEach((e) => console.log('  [PAGE ERROR]', e));

    await context.close();
  }

  await browser.close();
}

diagnose().catch(console.error);
