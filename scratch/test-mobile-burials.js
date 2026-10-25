import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function testMobileBurials() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle2' });

  // Wait for burial container
  await page.waitForSelector('#mobile-graves-prev-btn', { timeout: 8000 });

  const evaluation = await page.evaluate(() => {
    const prevBtn = document.getElementById('mobile-graves-prev-btn');
    const nextBtn = document.getElementById('mobile-graves-next-btn');
    const grid = prevBtn.closest('.sm\\:hidden').querySelector('.grid');
    const cards = Array.from(grid.children);

    return {
      prevDisabled: prevBtn.disabled,
      nextDisabled: nextBtn.disabled,
      cardsCount: cards.length,
      cardBoxes: cards.map((c, i) => {
        const r = c.getBoundingClientRect();
        return {
          index: i,
          width: Math.round(r.width),
          height: Math.round(r.height),
          left: Math.round(r.left),
          top: Math.round(r.top),
          right: Math.round(r.right),
        };
      }),
      containerWidth: document.body.clientWidth,
      scrollWidth: document.body.scrollWidth,
      hasHorizontalOverflow: document.body.scrollWidth > document.body.clientWidth,
    };
  });

  console.log('Mobile Burials Evaluation:', JSON.stringify(evaluation, null, 2));

  // Scroll to recent burials and take screenshot
  await page.evaluate(() => {
    document.getElementById('mobile-graves-prev-btn').scrollIntoView({ behavior: 'instant', block: 'center' });
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'scratch/mobile-burials-screenshot.png', fullPage: false });
  console.log('Screenshot saved to scratch/mobile-burials-screenshot.png');

  await browser.close();
}

testMobileBurials().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
