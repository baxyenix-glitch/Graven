import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function inspectViews() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx >= 1195 && lineIdx <= 1355) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          const tc = obj.tool_calls[0];
          if (tc.name === 'view_file') {
            console.log(`Line ${lineIdx}: view_file on ${tc.args?.AbsolutePath} (Start: ${tc.args?.StartLine}, End: ${tc.args?.EndLine})`);
          }
        }
      } catch (e) {}
    }
    lineIdx++;
  }
}

inspectViews();
