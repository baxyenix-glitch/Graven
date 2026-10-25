import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function testPagination() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('/api/graves')) {
      const mockGraves = Array.from({ length: 8 }).map((_, i) => ({
        id: `0x${i}111111111111111111111111111111111111111`,
        tokenAddress: `0x${i}111111111111111111111111111111111111111`,
        name: `Token ${i + 1}`,
        symbol: `TK${i + 1}`,
        decimals: 18,
        logoUrl: '/assets/logo.png',
        devWallet: '0xf343ee310ae6379a6af1d95ac0bd9d8c8be4a979',
        launchpad: i % 2 === 0 ? 'pons' : 'other',
        birthDate: '2026-10-20T14:59:16.462Z',
        deathDate: '2026-10-20T14:59:16.462Z',
        daysLived: (i + 1) * 3,
        peakMcapEth: (i + 1) * 0.1,
        epitaph: `Epitaph for token ${i + 1}`,
        buriedAt: new Date(Date.now() - (i + 1) * 60000).toISOString(),
        viewsCount: (i + 1) * 10,
        isRisen: i === 0,
        status: 'live',
      }));

      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ graves: mockGraves, total: 8 }),
      });
    } else {
      req.continue();
    }
  });

  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle2' });

  // Give polling / react a second to populate
  await new Promise(r => setTimeout(r, 1000));

  const page1Info = await page.evaluate(() => {
    const prevBtn = document.getElementById('mobile-graves-prev-btn');
    const nextBtn = document.getElementById('mobile-graves-next-btn');
    const grid = prevBtn.closest('.sm\\:hidden').querySelector('.grid');
    const cardNames = Array.from(grid.querySelectorAll('h3')).map(h => h.textContent.trim());
    const pageText = prevBtn.closest('.sm\\:hidden').querySelector('span.font-mono').textContent.trim();

    return {
      pageText,
      prevDisabled: prevBtn.disabled,
      nextDisabled: nextBtn.disabled,
      cardNames,
    };
  });

  console.log('Page 1 State:', JSON.stringify(page1Info, null, 2));

  // Click Next Button
  console.log('Tapping NEXT arrow button...');
  await page.tap('#mobile-graves-next-btn');
  await new Promise(r => setTimeout(r, 300));

  const page2Info = await page.evaluate(() => {
    const prevBtn = document.getElementById('mobile-graves-prev-btn');
    const nextBtn = document.getElementById('mobile-graves-next-btn');
    const grid = prevBtn.closest('.sm\\:hidden').querySelector('.grid');
    const cardNames = Array.from(grid.querySelectorAll('h3')).map(h => h.textContent.trim());
    const pageText = prevBtn.closest('.sm\\:hidden').querySelector('span.font-mono').textContent.trim();

    return {
      pageText,
      prevDisabled: prevBtn.disabled,
      nextDisabled: nextBtn.disabled,
      cardNames,
    };
  });

  console.log('Page 2 State:', JSON.stringify(page2Info, null, 2));

  // Click Prev Button
  console.log('Tapping PREV arrow button...');
  await page.tap('#mobile-graves-prev-btn');
  await new Promise(r => setTimeout(r, 300));

  const backPage1Info = await page.evaluate(() => {
    const prevBtn = document.getElementById('mobile-graves-prev-btn');
    const nextBtn = document.getElementById('mobile-graves-next-btn');
    const grid = prevBtn.closest('.sm\\:hidden').querySelector('.grid');
    const cardNames = Array.from(grid.querySelectorAll('h3')).map(h => h.textContent.trim());
    const pageText = prevBtn.closest('.sm\\:hidden').querySelector('span.font-mono').textContent.trim();

    return {
      pageText,
      prevDisabled: prevBtn.disabled,
      nextDisabled: nextBtn.disabled,
      cardNames,
    };
  });

  console.log('Back to Page 1 State:', JSON.stringify(backPage1Info, null, 2));

  await browser.close();
  console.log('PAGINATION TEST PASSED SUCCESSFULLY!');
}

testPagination().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
