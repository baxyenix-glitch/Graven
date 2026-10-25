import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function listWritesBetween1190And1682() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx >= 1190 && lineIdx <= 1682) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (const tc of obj.tool_calls) {
            if (tc.name === 'write_to_file') {
              console.log(`Line ${lineIdx}: write_to_file on ${tc.args?.TargetFile} (Overwrite: ${tc.args?.Overwrite})`);
            }
          }
        }
      } catch (e) {}
    }
    lineIdx++;
  }
}

listWritesBetween1190And1682();
