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

async function extractFiles() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const toastLines = [];
  const cpLines = [];
  let navbarRepl = null;
  let navbarTarget = null;

  for await (const line of rl) {
    if (lineIdx === 1561 || lineIdx === 1564) {
      const obj = JSON.parse(line);
      const l = extractLinesFromView(obj.content);
      for (let i = 1; i < l.length; i++) {
        if (l[i] !== undefined) toastLines[i] = l[i];
      }
    }
    if (lineIdx === 1552 || lineIdx === 1554) {
      const obj = JSON.parse(line);
      const l = extractLinesFromView(obj.content);
      for (let i = 1; i < l.length; i++) {
        if (l[i] !== undefined) cpLines[i] = l[i];
      }
    }
    if (lineIdx === 1541) {
      const obj = JSON.parse(line);
      navbarTarget = obj.tool_calls?.[0]?.args?.TargetContent;
      navbarRepl = obj.tool_calls?.[0]?.args?.ReplacementContent;
    }
    lineIdx++;
  }

  console.log(`Toast lines count: ${toastLines.length - 1}`);
  let toastMissing = [];
  for (let i = 1; i < toastLines.length; i++) {
    if (toastLines[i] === undefined) toastMissing.push(i);
  }
  console.log(`Toast missing: ${toastMissing.length ? toastMissing.join(',') : 'NONE ✅'}`);

  console.log(`CommandPalette lines count: ${cpLines.length - 1}`);
  let cpMissing = [];
  for (let i = 1; i < cpLines.length; i++) {
    if (cpLines[i] === undefined) cpMissing.push(i);
  }
  console.log(`CommandPalette missing: ${cpMissing.length ? cpMissing.join(',') : 'NONE ✅'}`);

  if (toastMissing.length === 0) {
    fs.writeFileSync('src/components/ui/Toast.tsx', toastLines.slice(1).join('\n'), 'utf8');
    console.log('Saved src/components/ui/Toast.tsx');
  }
  if (cpMissing.length === 0) {
    fs.writeFileSync('src/components/layout/CommandPalette.tsx', cpLines.slice(1).join('\n'), 'utf8');
    console.log('Saved src/components/layout/CommandPalette.tsx');
  }
}

extractFiles();
