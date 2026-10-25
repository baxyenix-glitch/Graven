import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

function extractLines(content) {
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

async function assembleSurface() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const allLines = [];
  for await (const line of rl) {
    if (lineIdx === 982 || lineIdx === 984) {
      const obj = JSON.parse(line);
      const l = extractLines(obj.content);
      for (let i = 1; i < l.length; i++) {
        if (l[i] !== undefined) allLines[i] = l[i];
      }
    }
    lineIdx++;
  }

  console.log(`Total Surface lines: ${allLines.length - 1}`);
  fs.writeFileSync('src/components/ui/Surface.tsx', allLines.slice(1).join('\n'), 'utf8');
  console.log('Saved complete src/components/ui/Surface.tsx');
}

assembleSurface();
