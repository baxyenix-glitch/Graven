import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Desktop
  const deskPage = await browser.newPage();
  await deskPage.setViewport({ width: 1280, height: 900 });
  await deskPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await deskPage.screenshot({ path: path.join(ARTIFACT_DIR, 'reverted_desktop.png'), fullPage: false });
  console.log('Saved reverted_desktop.png');
  await deskPage.close();

  // Mobile
  const mobPage = await browser.newPage();
  await mobPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await mobPage.screenshot({ path: path.join(ARTIFACT_DIR, 'reverted_mobile.png'), fullPage: false });
  console.log('Saved reverted_mobile.png');
  await mobPage.close();

  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
