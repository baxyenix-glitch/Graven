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

async function check1100to1106() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const cbLines = [];

  for await (const line of rl) {
    if ([1100, 1102, 1104, 1106].includes(lineIdx)) {
      const obj = JSON.parse(line);
      const l = extractLinesFromView(obj.content);
      for (let i = 1; i < l.length; i++) {
        if (l[i] !== undefined) cbLines[i] = l[i];
      }
    }
    lineIdx++;
  }

  console.log(`ConnectButton lines count before 1107: ${cbLines.length - 1}`);
  let missing = [];
  for (let i = 1; i < cbLines.length; i++) {
    if (cbLines[i] === undefined) missing.push(i);
  }
  console.log(`ConnectButton missing: ${missing.length ? missing.join(',') : 'NONE ✅'}`);

  if (missing.length === 0) {
    fs.writeFileSync('src/components/auth/ConnectButton.tsx', cbLines.slice(1).join('\n'), 'utf8');
    console.log('Saved src/components/auth/ConnectButton.tsx');
  }
}

check1100to1106();
