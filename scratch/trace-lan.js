import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function traceLanRequests() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const requests = new Map();
  page.on('request', (req) => {
    requests.set(req.url(), { time: Date.now(), status: 'pending' });
  });
  page.on('requestfinished', (req) => {
    const entry = requests.get(req.url());
    if (entry) entry.status = 'finished (' + (Date.now() - entry.time) + 'ms)';
  });
  page.on('requestfailed', (req) => {
    const entry = requests.get(req.url());
    if (entry) entry.status = 'FAILED: ' + req.failure()?.errorText;
  });
  page.on('console', (msg) => {
    console.log('[BROWSER_CONSOLE]', msg.type(), msg.text());
  });
  page.on('pageerror', (err) => {
    console.log('[BROWSER_PAGEERROR]', err.toString());
  });

  console.log('Navigating to http://10.196.13.60:3000/ with domcontentloaded...');
  try {
    await page.goto('http://10.196.13.60:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('DOMContentLoaded fired!');
  } catch (err) {
    console.error('DOMContent error:', err.message);
  }

  // Wait 4 seconds to observe pending requests
  await new Promise((r) => setTimeout(r, 4000));

  console.log('\n--- NETWORK REQUESTS SUMMARY ---');
  for (const [url, entry] of requests.entries()) {
    console.log(`${entry.status} -> ${url}`);
  }

  await browser.close();
}

traceLanRequests().catch(console.error);
