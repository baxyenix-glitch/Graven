import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  console.log('Browser launched successfully!');
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
  });

  const response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
  console.log('Status:', response.status());

  const evalResult = await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;
    
    // Find hamburger button
    const buttons = Array.from(document.querySelectorAll('button'));
    const hamburger = buttons.find(b => b.getAttribute('aria-label')?.includes('Menu') || b.querySelector('svg.lucide-menu'));
    let hamburgerInfo = null;
    if (hamburger) {
      const rect = hamburger.getBoundingClientRect();
      const topEl = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      hamburgerInfo = {
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        topElementTag: topEl?.tagName,
        topElementClass: topEl?.className,
        isSameOrChild: topEl === hamburger || hamburger.contains(topEl)
      };
    }
    
    // Find a main button or Connect button
    const connectBtn = buttons.find(b => b.textContent?.includes('CONNECT'));
    let connectBtnInfo = null;
    if (connectBtn) {
      const rect = connectBtn.getBoundingClientRect();
      const topEl = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      connectBtnInfo = {
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        topElementTag: topEl?.tagName,
        topElementClass: topEl?.className,
        isSameOrChild: topEl === connectBtn || connectBtn.contains(topEl)
      };
    }

    return {
      scrollWidth,
      innerWidth,
      hasOverflow: scrollWidth > innerWidth,
      hamburgerInfo,
      connectBtnInfo
    };
  });

  console.log('Evaluation result:', JSON.stringify(evalResult, null, 2));
  console.log('Console messages:', JSON.stringify(consoleMessages.filter(m => m.type === 'error' || m.text.includes('hydration') || m.text.includes('Hydration') || m.type === 'warning'), null, 2));
  console.log('Failed requests:', JSON.stringify(failedRequests, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
