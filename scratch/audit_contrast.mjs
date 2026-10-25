import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function parseRgb(colorStr) {
  if (!colorStr) return [0, 0, 0, 1];
  const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return [0, 0, 0, 1];
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), m[4] !== undefined ? parseFloat(m[4]) : 1];
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(rgb1, rgb2) {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

async function inspectRoute(page, route) {
  console.log(`\n=== INSPECTING ROUTE: ${route} ===`);
  await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle0', timeout: 15000 });
  
  const contrastFailures = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function colorToRgba(colorStr) {
      if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
        return null;
      }
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return [data[0], data[1], data[2], data[3] / 255];
    }

    function getLuminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function getContrast(rgb1, rgb2) {
      const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
      const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    }

    function getEffectiveBg(el) {
      let cur = el;
      const layers = [];
      while (cur && cur !== document.documentElement) {
        const bg = window.getComputedStyle(cur).backgroundColor;
        const rgba = colorToRgba(bg);
        if (rgba && rgba[3] > 0.02) {
          layers.push(rgba);
          if (rgba[3] >= 0.98) break; // opaque layer reached
        }
        cur = cur.parentElement;
      }
      // Base default is #F6F4FF [246, 244, 255]
      let result = [246, 244, 255];
      // Composite from bottom (earliest ancestor) to top (nearest element)
      for (let i = layers.length - 1; i >= 0; i--) {
        const [r, g, b, a] = layers[i];
        result = [
          Math.round(r * a + result[0] * (1 - a)),
          Math.round(g * a + result[1] * (1 - a)),
          Math.round(b * a + result[2] * (1 - a))
        ];
      }
      return result;
    }

    const elements = Array.from(document.querySelectorAll('*'));
    const failures = [];

    elements.forEach(el => {
      const hasDirectText = Array.from(el.childNodes).some(
        n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
      );
      if (!hasDirectText) return;

      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') return;

      const text = el.textContent.trim().slice(0, 40);
      const fgRgba = colorToRgba(style.color) || [10, 15, 46, 1];
      const bgRgb = getEffectiveBg(el);

      const ratio = getContrast(fgRgba, bgRgb);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = parseInt(style.fontWeight, 10) || 400;
      const isLarge = fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700);
      const minRatio = isLarge ? 3.0 : 4.5;

      if (ratio < minRatio) {
        failures.push({
          tag: el.tagName,
          text,
          fg: `rgb(${fgRgba[0]}, ${fgRgba[1]}, ${fgRgba[2]})`,
          bg: `rgb(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]})`,
          fontSize,
          fontWeight,
          ratio: Math.round(ratio * 100) / 100,
          required: minRatio,
          className: el.className ? String(el.className).slice(0, 50) : ''
        });
      }
    });

    return failures;
  });

  console.log(`Audited route ${route}. Failures: ${contrastFailures.length}`);
  if (contrastFailures.length > 0) {
    console.log('Top contrast failures:', JSON.stringify(contrastFailures.slice(0, 15), null, 2));
  }
  return { route, failures: contrastFailures };
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const routes = ['/', '/how-it-works', '/dashboard', '/bury', '/graves', '/leaderboard', '/faucet'];
  const viewports = [
    { name: 'Mobile (390px)', width: 390, height: 844, isMobile: true },
    { name: 'Desktop (1280px)', width: 1280, height: 800, isMobile: false }
  ];

  let totalFailures = 0;
  for (const vp of viewports) {
    console.log(`\n========================================`);
    console.log(`TESTING VIEWPORT: ${vp.name}`);
    console.log(`========================================`);
    await page.setViewport(vp);
    for (const r of routes) {
      try {
        const res = await inspectRoute(page, r);
        totalFailures += res.failures.length;
      } catch (e) {
        console.error(`Error on route ${r}:`, e.message);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`CONTRAST AUDIT COMPLETE. TOTAL FAILURES ACROSS ALL ROUTES & VIEWPORTS: ${totalFailures}`);
  console.log(`========================================`);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
