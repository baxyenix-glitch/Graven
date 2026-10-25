import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function check1322() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx === 1322) {
      const obj = JSON.parse(line);
      const code = obj.tool_calls?.[0]?.args?.CodeContent;
      if (code) {
        const lines = code.split('\n');
        console.log('Lines 135 to 210 of line 1322 write:');
        console.log(lines.slice(135, 210).join('\n'));
      }
    }
    lineIdx++;
  }
}

check1322();
