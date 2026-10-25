import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function check1100() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx === 1100) {
      const obj = JSON.parse(line);
      const lines = obj.content?.split('\n').slice(0, 35);
      console.log('Line 1100:\n', lines?.join('\n'));
    }
    lineIdx++;
  }
}

check1100();
