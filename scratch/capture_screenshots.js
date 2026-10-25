import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419';

async function capture(prefix = 'before') {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1280px Desktop
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
      await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `desktop_${prefix}_full.png`), clip: { x: 0, y: 0, width: 1280, height: 900 } });
      const hero = await page.$('.hero-section');
      if (hero) {
        await hero.screenshot({ path: path.join(ARTIFACT_DIR, `hero_${prefix}_1280px.png`) });
      }
      await page.close();
    }

    // 390px Mobile
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `mobile_${prefix}_full.png`), clip: { x: 0, y: 0, width: 390, height: 844 } });
      const hero = await page.$('.hero-section');
      if (hero) {
        await hero.screenshot({ path: path.join(ARTIFACT_DIR, `hero_${prefix}_390px.png`) });
      }
      await page.close();
    }

    console.log(`Successfully captured ${prefix} screenshots!`);
  } finally {
    await browser.close();
  }
}

const mode = process.argv[2] || 'before';
capture(mode).catch(console.error);
