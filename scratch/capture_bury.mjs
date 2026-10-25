import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. Desktop /bury
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });
      await page.goto('http://127.0.0.1:3000/bury', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'bury_dark_desktop.png'), fullPage: false });
      await page.close();
    }

    // 2. Mobile /bury
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await page.goto('http://127.0.0.1:3000/bury', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'bury_dark_mobile.png'), fullPage: false });
      await page.close();
    }

    console.log('Successfully captured bury dark mode screenshots!');
  } finally {
    await browser.close();
  }
}

capture().catch(console.error);
