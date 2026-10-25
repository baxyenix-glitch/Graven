import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function runDiagnostics() {
  console.log('--- STARTING COMPREHENSIVE MOBILE REPRO DIAGNOSTICS ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    const consoleLogs = [];
    page.on('console', (msg) => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', (err) => {
      consoleLogs.push({ type: 'pageerror', text: err.toString() });
    });

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    // TEST ON LOCALHOST
    console.log('\n--- 1. Testing Home Page on 127.0.0.1:3000 ---');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle2' });

    // SUSPECT c: INVISIBLE OVERLAYS (elementFromPoint)
    const overlays = await page.evaluate(() => {
      const results = {};
      const targets = [
        { name: 'hamburger', selector: '#mobile-menu-trigger' },
        { name: 'logo', selector: 'header a[href="/"]' },
        { name: 'mobile-connect-btn', selector: 'header button[aria-label="Connect Web3 Wallet"], header button[aria-label="Connected Wallet Menu"]' },
        { name: 'hero-bury-btn', selector: 'a[href="/bury"]' },
        { name: 'hero-how-btn', selector: 'a[href="/how-it-works"]' },
        { name: 'search-input', selector: 'input[placeholder*="0x"]' },
        { name: 'search-submit', selector: 'form button[type="submit"]' },
      ];

      for (const t of targets) {
        const el = document.querySelector(t.selector);
        if (!el) {
          results[t.name] = { error: 'Element not found: ' + t.selector };
          continue;
        }
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(cx, cy);
        results[t.name] = {
          expected: el.tagName + (el.id ? '#' + el.id : '') + '.' + String(el.className || '').slice(0, 30),
          actual: topEl ? topEl.tagName + (topEl.id ? '#' + topEl.id : '') + '.' + String(topEl.className || '').slice(0, 30) : 'null',
          isTargetOrDescendant: el === topEl || el.contains(topEl),
          coords: { cx: Math.round(cx), cy: Math.round(cy) },
        };
      }
      return results;
    });
    console.log('elementFromPoint results:\n', JSON.stringify(overlays, null, 2));

    // TEST HAMBURGER TAP
    console.log('\n--- 2. Testing Hamburger Tap ---');
    const hamburger = await page.$('#mobile-menu-trigger');
    if (hamburger) {
      await page.tap('#mobile-menu-trigger');
      await new Promise((r) => setTimeout(r, 300));
      const drawerVisible = await page.$('#mobile-menu-drawer');
      console.log('Drawer visible after tap:', Boolean(drawerVisible));

      if (drawerVisible) {
        // Test links inside drawer
        const drawerLinks = await page.$$eval('#mobile-menu-drawer a', (links) =>
          links.map((l) => ({ href: l.getAttribute('href'), text: l.textContent?.trim() }))
        );
        console.log('Links found in mobile menu drawer:', drawerLinks);

        // Close drawer
        await page.tap('#mobile-menu-trigger');
        await new Promise((r) => setTimeout(r, 300));
        const drawerAfterClose = await page.$('#mobile-menu-drawer');
        console.log('Drawer unmounted after second tap:', drawerAfterClose === null);
      }
    }

    // TEST CONNECT BUTTON TAP
    console.log('\n--- 3. Testing Connect Wallet Tap on 127.0.0.1 ---');
    const connectBtn = await page.$('header button[aria-label="Connect Web3 Wallet"]');
    if (connectBtn) {
      console.log('Tapping Connect Wallet in navbar...');
      await page.tap('header button[aria-label="Connect Web3 Wallet"]');
      await new Promise((r) => setTimeout(r, 1000));
    }

    // NOW TEST ON LAN IP (http://10.196.13.60:3000/) - THE EXACT SETUP USER IS USING!
    console.log('\n--- 4. Testing LAN IP (http://10.196.13.60:3000/) [Insecure Context] ---');
    const lanLogs = [];
    const lanPage = await browser.newPage();
    lanPage.on('console', (msg) => {
      lanLogs.push({ type: msg.type(), text: msg.text() });
    });
    lanPage.on('pageerror', (err) => {
      lanLogs.push({ type: 'pageerror', text: err.toString() });
    });

    await lanPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await lanPage.goto('http://10.196.13.60:3000/', { waitUntil: 'networkidle2' });

    const isSecureContextVal = await lanPage.evaluate(() => window.isSecureContext);
    console.log('window.isSecureContext on LAN IP:', isSecureContextVal);

    // Test hamburger on LAN IP
    await lanPage.tap('#mobile-menu-trigger');
    await new Promise((r) => setTimeout(r, 400));
    const lanDrawer = await lanPage.$('#mobile-menu-drawer');
    console.log('Drawer visible on LAN IP:', Boolean(lanDrawer));

    // Test Connect Button on LAN IP
    const lanConnectBtn = await lanPage.$('header button[aria-label="Connect Web3 Wallet"]');
    if (lanConnectBtn) {
      console.log('Tapping Connect Button on LAN IP...');
      await lanPage.tap('header button[aria-label="Connect Web3 Wallet"]');
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Check errors on LAN IP
    console.log('\n--- LAN IP Console Logs & Errors ---');
    console.log(JSON.stringify(lanLogs, null, 2));

    await lanPage.close();
    await page.close();
  } finally {
    await browser.close();
  }
}

runDiagnostics().catch(console.error);
