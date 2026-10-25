import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function checkWrites() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIndex = 0;
  for await (const line of rl) {
    if (lineIndex > 1189) break;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'replace_file_content') {
            console.log(`Line ${lineIndex}: ${tc.name} on ${tc.args?.TargetFile} (len: ${tc.args?.CodeContent?.length || tc.args?.ReplacementContent?.length})`);
          }
        }
      }
    } catch (e) {}
    lineIndex++;
  }
}

checkWrites();
