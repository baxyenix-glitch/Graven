import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function check1545to1570() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx >= 1540 && lineIdx <= 1570) {
      const obj = JSON.parse(line);
      console.log(`Line ${lineIdx}: ${obj.type}`);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          console.log(`  tool: ${tc.name} ${tc.args?.TargetFile || tc.args?.AbsolutePath}`);
        }
      }
      if (obj.type === 'VIEW_FILE' && obj.content) {
        const m = obj.content.match(/File Path: `file:\/\/\/(.*?)`[\s\S]*?Showing lines (\d+) to (\d+)/);
        if (m) console.log(`  view: ${m[1]} (${m[2]} to ${m[3]})`);
      }
    }
    lineIdx++;
  }
}

check1545to1570();
