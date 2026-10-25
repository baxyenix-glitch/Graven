import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

function extractLinesFromView(content) {
  const m = content.match(/Showing lines (\d+) to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
  if (!m) return [];
  const lines = [];
  const rawLines = m[3].split('\n');
  for (const line of rawLines) {
    const lineMatch = line.match(/^(\d+): (.*)/);
    if (lineMatch) {
      lines[parseInt(lineMatch[1], 10)] = lineMatch[2];
    } else {
      const emptyMatch = line.match(/^(\d+):$/);
      if (emptyMatch) {
        lines[parseInt(emptyMatch[1], 10)] = '';
      }
    }
  }
  return lines;
}

async function extractNavFooter() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const navLines = [];
  const footerLines = [];

  for await (const line of rl) {
    if ([1090, 1092, 1094, 1096].includes(lineIdx)) {
      const obj = JSON.parse(line);
      const l = extractLinesFromView(obj.content);
      for (let i = 1; i < l.length; i++) {
        if (l[i] !== undefined) navLines[i] = l[i];
      }
    }
    if ([1508, 1510].includes(lineIdx)) {
      const obj = JSON.parse(line);
      const l = extractLinesFromView(obj.content);
      for (let i = 1; i < l.length; i++) {
        if (l[i] !== undefined) footerLines[i] = l[i];
      }
    }
    lineIdx++;
  }

  console.log(`Navbar lines count: ${navLines.length - 1}`);
  let navMissing = [];
  for (let i = 1; i < navLines.length; i++) {
    if (navLines[i] === undefined) navMissing.push(i);
  }
  console.log(`Navbar missing: ${navMissing.length ? navMissing.join(',') : 'NONE ✅'}`);

  console.log(`Footer lines count: ${footerLines.length - 1}`);
  let footerMissing = [];
  for (let i = 1; i < footerLines.length; i++) {
    if (footerLines[i] === undefined) footerMissing.push(i);
  }
  console.log(`Footer missing: ${footerMissing.length ? footerMissing.join(',') : 'NONE ✅'}`);

  if (navMissing.length === 0) {
    fs.writeFileSync('src/components/layout/Navbar.tsx', navLines.slice(1).join('\n'), 'utf8');
    console.log('Saved src/components/layout/Navbar.tsx');
  }
  if (footerMissing.length === 0) {
    fs.writeFileSync('src/components/layout/Footer.tsx', footerLines.slice(1).join('\n'), 'utf8');
    console.log('Saved src/components/layout/Footer.tsx');
  }
}

extractNavFooter();
