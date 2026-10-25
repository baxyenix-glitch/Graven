import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const routes = [
  '/',
  '/graves',
  '/grave/0xe35b3fe45395aef894d0ac00f22937e3e6a65249',
  '/bury',
  '/dashboard',
  '/leaderboard',
  '/how-it-works',
  '/faucet',
  '/terms',
  '/privacy',
];

async function testAllRoutes() {
  console.log('--- TESTING ALL ROUTES IN MOBILE EMULATION (390x844) ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const summary = [];

  for (const r of routes) {
    const logs = [];
    const onConsole = (msg) => logs.push({ type: msg.type(), text: msg.text() });
    const onPageError = (err) => logs.push({ type: 'pageerror', text: err.toString() });

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    const start = Date.now();
    let status = 'OK';
    let overflow = false;
    let heading = '';

    try {
      const res = await page.goto(`http://127.0.0.1:3000${r}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // wait up to 2 seconds for client hydration / dynamic data
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      overflow = scrollW > 390;

      heading = await page.evaluate(() => {
        const h = document.querySelector('h1, h2');
        return h ? h.textContent.trim().slice(0, 30) : 'NO_HEADING';
      });

      if (!res.ok()) {
        status = `HTTP_${res.status()}`;
      }
    } catch (err) {
      status = `ERR: ${err.message}`;
    }

    const duration = Date.now() - start;
    const errors = logs.filter((l) => l.type === 'error' || l.type === 'pageerror');
    const hydration = logs.filter((l) => l.text.includes('Hydration') || l.text.includes('mismatch'));

    summary.push({
      route: r,
      status,
      duration: `${duration}ms`,
      heading,
      hasOverflow: overflow,
      errorsCount: errors.length,
      hydrationCount: hydration.length,
      errors: errors.map((e) => e.text).slice(0, 3),
    });

    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }

  console.log('\n--- ROUTES AUDIT REPORT ---');
  console.table(summary);
  console.log(JSON.stringify(summary, null, 2));

  await browser.close();
}

testAllRoutes().catch(console.error);
