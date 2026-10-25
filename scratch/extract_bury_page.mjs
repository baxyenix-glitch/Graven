import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function extractBuryPage() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx === 908) {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      console.log('Line 908 tool call Target:', tc?.args?.TargetContent?.substring(0, 200));
      console.log('Line 908 tool call Replacement:', tc?.args?.ReplacementContent?.substring(0, 200));
    }
    // Also check line 1204, 1206, 1208
    if (lineIdx === 1204 || lineIdx === 1206) {
      const obj = JSON.parse(line);
      const m = obj.content?.match(/Showing lines (\d+) to (\d+)/);
      if (m) console.log(`Line ${lineIdx}: Showing lines ${m[1]} to ${m[2]}`);
    }
    lineIdx++;
  }
}

extractBuryPage();
