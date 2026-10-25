import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    { name: '390px Mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
    { name: '768px Tablet', width: 768, height: 1024, isMobile: false, hasTouch: false },
    { name: '1280px Desktop', width: 1280, height: 900, isMobile: false, hasTouch: false },
  ];

  for (const vp of viewports) {
    console.log(`\n========================================`);
    console.log(`TESTING AT ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport(vp);

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Horizontal Scroll Check
    const scrollInfo = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    console.log(`[Horizontal Overflow]: ${scrollInfo.hasOverflow ? 'FAIL' : 'PASS'} (scrollWidth: ${scrollInfo.scrollWidth}, innerWidth: ${scrollInfo.innerWidth})`);

    // 2. ElementFromPoint Tap Audit on Hero & Nav elements
    const selectors = [
      { label: 'Bury Button', sel: '#hero-bury-btn' },
      { label: 'How It Works Button', sel: '#hero-how-it-works-btn' },
      { label: 'Search Input', sel: '#hero-ca-input' },
      { label: 'Search Submit Button', sel: '#hero-search-btn' },
    ];

    if (vp.width < 1024) {
      selectors.push({ label: 'Hamburger Trigger', sel: '#mobile-menu-trigger' });
    }

    const hasLiveBurial = await page.$('#hero-live-burial-link');
    if (hasLiveBurial) {
      selectors.push({ label: 'Live Burial Card', sel: '#hero-live-burial-link' });
    }

    const tapAudit = [];
    for (const item of selectors) {
      const res = await page.evaluate((sel, label) => {
        const el = document.querySelector(sel);
        if (!el) return { label, found: false };
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(cx, cy);
        const clickable = el === topEl || el.contains(topEl);
        return {
          label,
          found: true,
          topEl: topEl ? `${topEl.tagName}${topEl.id ? '#' + topEl.id : ''}` : null,
          clickable,
          pointerEvents: window.getComputedStyle(el).pointerEvents,
        };
      }, item.sel, item.label);
      tapAudit.push(res);
    }

    console.log('[Tap Interactivity Check]:');
    let allClickable = true;
    for (const r of tapAudit) {
      if (r.found && r.clickable) {
        console.log(`  ✓ ${r.label}: clickable directly (top: ${r.topEl})`);
      } else {
        console.log(`  ✗ ${r.label}: NOT directly clickable (top: ${r.topEl})`);
        allClickable = false;
      }
    }
    console.log(`  -> Overall Tap Test: ${allClickable ? 'PASS' : 'FAIL'}`);

    // 3. Decorations pointer-events: none check
    const decorPointerEvents = await page.evaluate(() => {
      const backdrop = document.querySelector('.hero-backdrop');
      const dots = document.querySelector('.hero-l2-dots');
      const mist = document.querySelector('.hero-l3-mist-a');
      const grain = document.querySelector('.hero-l6-grain');

      return {
        backdrop: backdrop ? window.getComputedStyle(backdrop).pointerEvents : 'n/a',
        dots: dots ? window.getComputedStyle(dots).pointerEvents : 'n/a',
        mist: mist ? window.getComputedStyle(mist).pointerEvents : 'n/a',
        grain: grain ? window.getComputedStyle(grain).pointerEvents : 'n/a',
      };
    });
    console.log(`[Backdrop pointer-events]:`, decorPointerEvents);

    // 4. No gridlines check
    const gridCheck = await page.evaluate(() => {
      const hero = document.querySelector('section');
      const text = hero ? hero.innerHTML : '';
      return {
        hasOldGridLines: text.includes('linear-gradient(to right, #0A0F2E 1px') || text.includes('32px 32px'),
        hasOldNoise: text.includes('fractalNoise') && text.includes('mix-blend-multiply'),
      };
    });
    console.log(`[No Gridlines Left]: ${!gridCheck.hasOldGridLines ? 'PASS' : 'FAIL'}`);

    // 5. Contrast Audit
    const contrastCheck = await page.evaluate(() => {
      // Subcopy
      const p = document.querySelector('section p');
      const pColor = p ? window.getComputedStyle(p).color : '';

      // Headline
      const h1 = document.querySelector('.hero-headline');
      const h1Color = h1 ? window.getComputedStyle(h1).color : '';

      // Search input
      const input = document.querySelector('input[placeholder*="Search token CA"]');
      const inputBg = input ? window.getComputedStyle(input).backgroundColor : '';
      const inputColor = input ? window.getComputedStyle(input).color : '';

      // Ghost button
      const ghost = document.querySelector('#hero-how-it-works-btn');
      const ghostColor = ghost ? window.getComputedStyle(ghost).color : '';
      const ghostBorder = ghost ? window.getComputedStyle(ghost).borderColor : '';

      return {
        subcopyColor: pColor,
        headlineColor: h1Color,
        inputBg,
        inputColor,
        ghostColor,
        ghostBorder,
      };
    });
    console.log(`[Contrast Verification]:`, contrastCheck);

    // 6. Prefers-Reduced-Motion Emulation
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const motionCheck = await page.evaluate(() => {
      const flowText = document.querySelector('.headline-flow-text');
      const pill = document.querySelector('.afterlife-pill');
      const shimmer = document.querySelector('.afterlife-shimmer');
      const soul = document.querySelector('.hero-soul');

      return {
        flowAnimation: flowText ? window.getComputedStyle(flowText).animationName : 'none',
        pillAnimation: pill ? window.getComputedStyle(pill).animationName : 'none',
        shimmerDisplay: shimmer ? window.getComputedStyle(shimmer).display : 'none',
        soulOpacity: soul ? window.getComputedStyle(soul).opacity : '0',
      };
    });
    console.log(`[Reduced Motion Check]:`, motionCheck);

    // 7. Console errors
    console.log(`[Console Errors]: ${consoleErrors.length === 0 ? 'PASS (0 errors)' : 'FAIL: ' + consoleErrors.join(', ')}`);

    await page.close();
  }

  await browser.close();
  console.log('\nALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

verify().catch(console.error);
