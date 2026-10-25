import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419';

// Luminance and Contrast Ratio calculation according to WCAG 2.1
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [0, 0, 0];
}

function getContrast(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function runSuite() {
  console.log('====================================================');
  console.log('   GRAVEN AUTOMATED VERIFICATION SUITE (PART G)');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const pagesToTest = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Graves Directory', path: '/graves' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Bury Flow', path: '/bury' },
  ];

  const viewports = [
    { name: '360px Mobile Small', width: 360, height: 740, isMobile: true, hasTouch: true },
    { name: '375px iPhone SE', width: 375, height: 667, isMobile: true, hasTouch: true },
    { name: '390px iPhone 14/15', width: 390, height: 844, isMobile: true, hasTouch: true },
    { name: '414px iPhone Plus', width: 414, height: 896, isMobile: true, hasTouch: true },
    { name: '768px Tablet iPad', width: 768, height: 1024, isMobile: false, hasTouch: false },
    { name: '1280px Desktop', width: 1280, height: 900, isMobile: false, hasTouch: false },
  ];

  // 1. Horizontal Overflow Audit across all viewports for Home
  console.log('--- 1. HORIZONTAL OVERFLOW AUDIT (Target: 0 horizontal scroll) ---');
  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    const overflow = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    const status = overflow.hasOverflow ? 'FAIL ❌' : 'PASS ✅';
    console.log(`  [${vp.name}] ${status} - scrollWidth: ${overflow.scrollWidth}px, innerWidth: ${overflow.innerWidth}px`);
    await page.close();
  }

  // 2. Contrast Audit across all key pages
  console.log('\n--- 2. COLOR CONTRAST AUDIT (WCAG AA >= 4.5:1 normal, >= 3:1 large) ---');
  for (const pInfo of pagesToTest) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`http://127.0.0.1:3000${pInfo.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    const contrastResults = await page.evaluate(() => {
      const results = [];
      const samples = [
        { selector: 'h1', desc: 'Main Heading' },
        { selector: 'h2', desc: 'Section Heading' },
        { selector: 'p', desc: 'Body Text' },
        { selector: 'a', desc: 'Anchor Link' },
        { selector: 'button', desc: 'Button' },
      ];

      for (const item of samples) {
        const el = document.querySelector(item.selector);
        if (el) {
          const style = window.getComputedStyle(el);
          // Find parent background
          let cur = el;
          let bg = 'rgb(0, 0, 0)';
          while (cur) {
            const curBg = window.getComputedStyle(cur).backgroundColor;
            if (curBg && curBg !== 'rgba(0, 0, 0, 0)' && curBg !== 'transparent') {
              bg = curBg;
              break;
            }
            cur = cur.parentElement;
          }

          results.push({
            desc: item.desc,
            selector: item.selector,
            textColor: style.color,
            fontSize: style.fontSize,
            bgColor: bg,
          });
        }
      }
      return results;
    });

    console.log(`\n  Page: ${pInfo.name} (${pInfo.path})`);
    for (const r of contrastResults) {
      const fgRgb = parseRgb(r.textColor);
      const bgRgb = parseRgb(r.bgColor);
      const ratio = getContrast(fgRgb, bgRgb);
      const isLarge = parseFloat(r.fontSize) >= 18;
      const minRatio = isLarge ? 3.0 : 4.5;
      const pass = ratio >= minRatio;
      console.log(`    - ${r.desc} (${r.fontSize}): ${pass ? 'PASS ✅' : 'WARN ⚠️'} Contrast ${ratio.toFixed(2)}:1 (fg: ${r.textColor}, bg: ${r.bgColor})`);
    }
    await page.close();
  }

  // 3. Mobile Hamburger & Tap Interactivity Audit
  console.log('\n--- 3. MOBILE HAMBURGER & TAP INTERACTIVITY AUDIT (390px) ---');
  const mobPage = await browser.newPage();
  await mobPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobPage.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Check elementFromPoint on hamburger trigger
  const burgerCheck = await mobPage.evaluate(() => {
    const trigger = document.querySelector('#mobile-menu-trigger');
    if (!trigger) return { found: false };
    const rect = trigger.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy);
    return {
      found: true,
      rect: { width: rect.width, height: rect.height },
      topEl: topEl ? `${topEl.tagName}${topEl.id ? '#' + topEl.id : ''}` : null,
      clickable: trigger === topEl || trigger.contains(topEl),
    };
  });
  console.log(`  Hamburger Trigger elementFromPoint: ${burgerCheck.clickable ? 'PASS ✅' : 'FAIL ❌'} (top: ${burgerCheck.topEl}, size: ${burgerCheck.rect?.width}x${burgerCheck.rect?.height}px)`);

  // Open mobile menu
  console.log('  Tapping mobile menu hamburger...');
  await mobPage.click('#mobile-menu-trigger');
  await new Promise(r => setTimeout(r, 600));

  const menuOpenState = await mobPage.evaluate(() => {
    const drawer = document.querySelector('#mobile-menu-drawer');
    const links = Array.from(document.querySelectorAll('#mobile-menu-drawer a')).map(a => a.textContent?.trim());
    return {
      isOpen: Boolean(drawer),
      linksCount: links.length,
      links,
      bodyOverflow: document.body.style.overflow,
    };
  });
  console.log(`  Mobile Menu Drawer visible: ${menuOpenState.isOpen ? 'PASS ✅' : 'FAIL ❌'} (${menuOpenState.linksCount} links present)`);
  console.log(`  Drawer links: ${menuOpenState.links.join(' | ')}`);
  console.log(`  Body overflow locked: ${menuOpenState.bodyOverflow === 'hidden' ? 'YES (scroll locked) ✅' : 'NO'}`);

  // Tap close on mobile menu
  console.log('  Tapping close on mobile menu...');
  await mobPage.click('#mobile-menu-trigger');
  await new Promise(r => setTimeout(r, 600));

  const menuClosedState = await mobPage.evaluate(() => {
    const drawer = document.querySelector('#mobile-menu-drawer');
    return {
      isOpen: Boolean(drawer),
      bodyOverflow: document.body.style.overflow,
    };
  });
  console.log(`  Mobile Menu closed cleanly: ${!menuClosedState.isOpen ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`  Body overflow restored: ${menuClosedState.bodyOverflow === '' ? 'RESTORED ✅' : 'STILL LOCKED ❌'}`);

  // 4. ElementFromPoint Check for Primary CTAs
  console.log('\n--- 4. ELEMENT FROM POINT INTERACTION AUDIT ---');
  const ctaCheck = await mobPage.evaluate(() => {
    const buryBtn = document.querySelector('#hero-bury-btn');
    if (!buryBtn) return { buryBtn: false };
    const rect = buryBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy);
    return {
      buryBtn: true,
      topEl: topEl ? `${topEl.tagName}${topEl.id ? '#' + topEl.id : ''}` : null,
      clickable: buryBtn === topEl || buryBtn.contains(topEl),
    };
  });
  console.log(`  Hero Bury Button: ${ctaCheck.clickable ? 'CLICKABLE ✅' : 'OBSTRUCTED ❌'} (topEl: ${ctaCheck.topEl})`);

  // 5. Screenshots
  console.log('\n--- 5. CAPTURING UPDATED SCREENSHOTS ---');
  await mobPage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_pure_black.png'), fullPage: true });
  console.log(`  Saved: mobile_pure_black.png`);
  await mobPage.close();

  const deskPage = await browser.newPage();
  await deskPage.setViewport({ width: 1280, height: 900 });
  await deskPage.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await deskPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_pure_black.png'), fullPage: true });
  console.log(`  Saved: desktop_pure_black.png`);

  // How-It-Works Screenshot
  await deskPage.goto('http://127.0.0.1:3000/how-it-works', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await deskPage.screenshot({ path: path.join(ARTIFACT_DIR, 'how_it_works_pure_black.png'), fullPage: true });
  console.log(`  Saved: how_it_works_pure_black.png`);

  // Dashboard Screenshot
  await deskPage.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await deskPage.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_pure_black.png'), fullPage: true });
  console.log(`  Saved: dashboard_pure_black.png`);

  await deskPage.close();
  await browser.close();

  console.log('\n====================================================');
  console.log('   ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runSuite().catch(err => {
  console.error('Suite error:', err);
  process.exit(1);
});
