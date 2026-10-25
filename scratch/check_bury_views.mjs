import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function checkBuryViews() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx < 1195) {
      if (line.includes('bury/page.tsx') || line.includes('bury\\\\page.tsx')) {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          console.log(`Line ${lineIdx}: ${obj.tool_calls[0].name}`, obj.tool_calls[0].args);
        }
        if (obj.type === 'VIEW_FILE') {
          console.log(`Line ${lineIdx}: VIEW_FILE (len: ${obj.content?.length})`);
          const m = obj.content.match(/Showing lines (\d+) to (\d+)/);
          if (m) console.log(`   Showing lines ${m[1]} to ${m[2]}`);
        }
      }
    }
    lineIdx++;
  }
}

checkBuryViews();
