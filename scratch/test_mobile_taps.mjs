import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 15000 });

  // Check all buttons
  const buttonAudit = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.map((b, i) => {
      const rect = b.getBoundingClientRect();
      const style = window.getComputedStyle(b);
      const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      let topElDesc = null;
      if (isVisible) {
        const topEl = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        topElDesc = topEl ? `${topEl.tagName}.${topEl.className}` : 'null';
      }
      return {
        index: i,
        text: b.textContent?.trim().slice(0, 30),
        ariaLabel: b.getAttribute('aria-label'),
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        isVisible,
        topEl: topElDesc,
        hasOnClick: typeof b.onclick === 'function' || b.hasAttribute('onclick')
      };
    });
  });

  console.log('Mobile buttons count:', buttonAudit.length);
  console.log('Visible buttons:', JSON.stringify(buttonAudit.filter(b => b.isVisible), null, 2));

  // Now let's click the hamburger button!
  console.log('\n--- TESTING HAMBURGER TAP ---');
  const hamburgerFound = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const hb = btns.find(b => b.getAttribute('aria-label')?.includes('Open Menu') || b.querySelector('svg.lucide-menu'));
    if (!hb) return false;
    hb.click();
    return true;
  });
  console.log('Hamburger clicked via evaluate:', hamburgerFound);

  // Wait 300ms for animation
  await new Promise(r => setTimeout(r, 400));

  const menuOpenCheck = await page.evaluate(() => {
    const menuEl = document.querySelector('a[href="/how-it-works"]');
    const drawer = document.querySelector('.fixed.inset-x-2');
    return {
      hasDrawer: Boolean(drawer),
      hasHowItWorksLink: Boolean(menuEl),
      drawerRect: drawer ? drawer.getBoundingClientRect() : null
    };
  });
  console.log('Menu open check after evaluate click:', JSON.stringify(menuOpenCheck, null, 2));

  // Now test actual touch tap on hamburger coordinates!
  console.log('\n--- TESTING REAL TOUCH TAP ON HAMBURGER COORDINATES ---');
  const hbCoords = buttonAudit.find(b => b.ariaLabel?.includes('Menu') || b.text?.includes('Close') || b.isVisible && b.rect.x > 300 && b.rect.y < 70);
  if (hbCoords) {
    console.log('Tapping coordinates:', hbCoords.rect.x + hbCoords.rect.w / 2, hbCoords.rect.y + hbCoords.rect.h / 2);
    // Tap to close first if open
    await page.touchscreen.tap(hbCoords.rect.x + hbCoords.rect.w / 2, hbCoords.rect.y + hbCoords.rect.h / 2);
    await new Promise(r => setTimeout(r, 400));
    const afterTap1 = await page.evaluate(() => Boolean(document.querySelector('.fixed.inset-x-2')));
    console.log('Drawer present after tap 1:', afterTap1);

    await page.touchscreen.tap(hbCoords.rect.x + hbCoords.rect.w / 2, hbCoords.rect.y + hbCoords.rect.h / 2);
    await new Promise(r => setTimeout(r, 400));
    const afterTap2 = await page.evaluate(() => Boolean(document.querySelector('.fixed.inset-x-2')));
    console.log('Drawer present after tap 2:', afterTap2);
  }

  await browser.close();
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
