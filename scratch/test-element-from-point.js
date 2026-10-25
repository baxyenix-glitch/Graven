import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function auditElements() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle2' });

  const audit = await page.evaluate(() => {
    const results = [];
    // Collect all interactive elements
    const elements = Array.from(document.querySelectorAll('button, a, input, select'));

    elements.forEach((el, index) => {
      // Check if element is displayed
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') {
        return;
      }

      // If it is inside the viewport or near it
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Only test elements within current viewport (0 <= cy <= 844)
      if (cx < 0 || cx > 390 || cy < 0 || cy > 844) {
        return;
      }

      const topEl = document.elementFromPoint(cx, cy);
      const isTarget = el === topEl || el.contains(topEl);

      results.push({
        tag: el.tagName,
        id: el.id || '',
        text: el.textContent?.trim().slice(0, 25) || '',
        href: el.getAttribute('href') || '',
        rect: { x: Math.round(cx), y: Math.round(cy), w: Math.round(rect.width), h: Math.round(rect.height) },
        topElement: topEl ? `${topEl.tagName}${topEl.id ? '#' + topEl.id : ''}.${String(topEl.className || '').slice(0, 25)}` : 'NULL',
        isTarget,
        pointerEvents: style.pointerEvents,
      });
    });

    return results;
  });

  console.log('\n--- INTERACTIVE ELEMENT TAP-AUDIT AT (390x844) ---');
  const blocked = audit.filter((a) => !a.isTarget);
  console.log(`Total visible interactive elements tested: ${audit.length}`);
  console.log(`Blocked elements count: ${blocked.length}`);
  if (blocked.length > 0) {
    console.log('BLOCKED ELEMENTS:', JSON.stringify(blocked, null, 2));
  } else {
    console.log('ALL visible interactive elements receive tap events directly!');
  }

  await browser.close();
}

auditElements().catch(console.error);
