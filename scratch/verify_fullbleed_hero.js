import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    { name: '390px Mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
    { name: '768px Tablet', width: 768, height: 1024, isMobile: false, hasTouch: false },
    { name: '1280px Desktop', width: 1280, height: 900, isMobile: false, hasTouch: false },
    { name: '1536px Ultra-wide', width: 1536, height: 960, isMobile: false, hasTouch: false },
  ];

  const results = {};

  for (const vp of viewports) {
    console.log(`\n========================================`);
    console.log(`TESTING AT ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport(vp);

    const consoleErrors = [];
    const downloadedImages = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('hmr') && !text.includes('WebSocket')) {
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    page.on('response', resp => {
      const url = resp.url();
      if (url.includes('hero-desktop.webp') || url.includes('hero-mobile.webp')) {
        downloadedImages.push(url.split('/').pop().split('?')[0]);
      }
    });

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3500));

    // 1. Capture clean screenshot of Hero first (before interactions)
    const hero = await page.$('section.hero-section');
    if (hero) {
      const box = await hero.boundingBox();
      const filename = `hero_after_${vp.width}px.png`;
      if (box) {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), clip: box });
        console.log(`[Captured Clean Screenshot]: ${filename}`);
      }
    }

    // 2. Horizontal Scroll Check
    const scrollInfo = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    console.log('[Horizontal Overflow]:', scrollInfo.hasOverflow ? `FAIL (${scrollInfo.scrollWidth} > ${scrollInfo.innerWidth})` : `PASS (${scrollInfo.scrollWidth} <= ${scrollInfo.innerWidth})`);

    // 3. Image Download Check
    console.log('[Images Downloaded]:', downloadedImages);

    // 4. Old elements check (strictly inside hero section)
    const oldElementsCheck = await page.evaluate(() => {
      const heroEl = document.querySelector('section.hero-section');
      if (!heroEl) return { noHeroFound: true };
      return {
        hasHalftone: !!heroEl.querySelector('.hero-backdrop'),
        hasDots: !!heroEl.querySelector('.hero-l2-dots'),
        hasMist: !!heroEl.querySelector('.hero-l3-mist-a'),
        hasSilhouettes: !!heroEl.querySelector('.hero-l4-silhouettes'),
        hasSoulLights: !!heroEl.querySelector('.hero-soul-light'),
        hasHeadlineAnimation: !!heroEl.querySelector('.hero-headline-word'),
        hasAfterlifePill: !!heroEl.querySelector('.afterlife-pill'),
        hasTagPill: Array.from(heroEl.querySelectorAll('span, div')).some(el => el.textContent?.trim() === 'ROBINHOOD CHAIN'),
        hasSubcopy: Array.from(heroEl.querySelectorAll('p')).some(p => p.textContent.includes('Bury dead tokens under real engraved gravestones')),
        hasHowItWorksBtn: !!heroEl.querySelector('#hero-how-it-works-btn'),
        hasConnectWithUs: Array.from(heroEl.querySelectorAll('span, div')).some(el => el.textContent.includes('CONNECT WITH US:')),
        hasSidePanel: !!heroEl.querySelector('#hero-live-burial-link'),
      };
    });
    const anyOldFound = Object.entries(oldElementsCheck).filter(([k, v]) => v);
    console.log('[Old Elements Remaining Inside Hero]:', anyOldFound.length === 0 ? 'PASS (None)' : `FAIL: ${JSON.stringify(anyOldFound)}`);

    // 5. Hero Structure & Visibility
    const heroInfo = await page.evaluate(() => {
      const hero = document.querySelector('section.hero-section');
      if (!hero) return null;
      const rect = hero.getBoundingClientRect();
      const buryBtn = document.querySelector('#hero-bury-btn');
      const searchInput = document.querySelector('#hero-ca-input');
      const searchBtn = document.querySelector('#hero-search-btn');
      const buryRect = buryBtn ? buryBtn.getBoundingClientRect() : null;
      const searchRect = searchInput ? searchInput.getBoundingClientRect() : null;
      const img = hero.querySelector('picture img');

      return {
        heroRect: { width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top) },
        aspectRatio: (rect.width / rect.height).toFixed(2),
        imgSrc: img ? img.currentSrc : null,
        imgComplete: img ? img.complete : false,
        buryRect: buryRect ? { width: Math.round(buryRect.width), height: Math.round(buryRect.height), topRelative: ((buryRect.top - rect.top) / rect.height).toFixed(3) } : null,
        searchRect: searchRect ? { width: Math.round(searchRect.width), height: Math.round(searchRect.height), topRelative: ((searchRect.top - rect.top) / rect.height).toFixed(3) } : null,
      };
    });
    console.log('[Hero Info]:', heroInfo);

    // 6. Interactivity / elementFromPoint check
    const tapAudit = await page.evaluate(() => {
      function checkTop(selector) {
        const el = document.querySelector(selector);
        if (!el) return { found: false };
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(cx, cy);
        const isClickable = topEl === el || el.contains(topEl) || topEl?.contains(el);
        return {
          found: true,
          cx: Math.round(cx),
          cy: Math.round(cy),
          clickable: isClickable,
          topTag: topEl ? topEl.tagName : 'null',
          topId: topEl?.id || '',
        };
      }

      return {
        buryBtn: checkTop('#hero-bury-btn'),
        searchInput: checkTop('#hero-ca-input'),
        searchSubmit: checkTop('#hero-search-btn'),
      };
    });
    console.log('[Tap Interactivity Check]:', tapAudit);

    // 7. Reduced Motion Check
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const reducedMotionCheck = await page.evaluate(() => {
      const controls = document.querySelector('.hero-controls');
      const style = controls ? window.getComputedStyle(controls) : null;
      return {
        animationName: style?.animationName,
        opacity: style?.opacity,
      };
    });
    console.log('[Reduced Motion Check]:', reducedMotionCheck);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

    // 8. Search Form Real Keyboard & Validation Test
    await page.click('#hero-ca-input');
    await page.type('#hero-ca-input', '0x123');
    await new Promise(r => setTimeout(r, 300));
    const btnDisabled = await page.evaluate(() => document.querySelector('#hero-search-btn')?.disabled);
    console.log('[Search Button Disabled After 0x123]:', btnDisabled);
    await page.click('#hero-search-btn');
    await new Promise(r => setTimeout(r, 600));
    const searchErrorPresent = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Invalid contract address'));
    });
    console.log('[Search Validation Error Triggered on Invalid CA]:', searchErrorPresent ? 'PASS' : 'FAIL');

    // Test Paste Behavior
    await page.evaluate(() => {
      const input = document.querySelector('#hero-ca-input');
      if (input) {
        input.value = '';
        input.focus();
      }
    });
    await page.type('#hero-ca-input', '0x1111111111111111111111111111111111111111');
    const inputVal = await page.$eval('#hero-ca-input', el => el.value);
    console.log('[Search Input Accepts Paste/Typing]:', inputVal.length === 42 ? 'PASS' : 'FAIL');

    console.log('[Console Errors]:', consoleErrors.length === 0 ? 'PASS (0 errors)' : `FAIL: ${consoleErrors.join('; ')}`);

    results[vp.name] = {
      scrollOverflow: !scrollInfo.hasOverflow,
      onlyOneImage: downloadedImages.length === 1,
      noOldElements: anyOldFound.length === 0,
      tapClickable: tapAudit.buryBtn.clickable && tapAudit.searchInput.clickable && tapAudit.searchSubmit.clickable,
      searchWorks: searchErrorPresent && inputVal.length === 42,
      consolePass: consoleErrors.length === 0,
    };

    await page.close();
  }

  console.log('\n========================================');
  console.log('SUMMARY TABLE:');
  console.log('========================================');
  console.table(results);

  await browser.close();
}

run().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
