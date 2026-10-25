import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function print1200to1215() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx >= 1203 && lineIdx <= 1212) {
      const obj = JSON.parse(line);
      console.log(`Line ${lineIdx}: ${obj.type}`);
      if (obj.tool_calls) console.log('  tool:', obj.tool_calls[0].name, obj.tool_calls[0].args);
      if (obj.content) {
        const m = obj.content.match(/Showing lines (\d+) to (\d+)/);
        if (m) console.log(`  content: Showing lines ${m[1]} to ${m[2]}`);
      }
    }
    lineIdx++;
  }
}

print1200to1215();
