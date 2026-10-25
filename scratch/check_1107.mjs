import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function check1107() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx === 1107) {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      console.log('Line 1107 StartLine:', tc?.args?.StartLine, 'EndLine:', tc?.args?.EndLine);
      console.log('TargetContent len:', tc?.args?.TargetContent?.length);
      console.log('ReplacementContent len:', tc?.args?.ReplacementContent?.length);
      console.log('ReplacementContent preview:', tc?.args?.ReplacementContent?.substring(0, 300));
    }
    lineIdx++;
  }
}

check1107();
