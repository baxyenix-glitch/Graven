import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function checkArgs(lines) {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lines.includes(lineIdx)) {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      console.log(`\nLine ${lineIdx}: ${tc?.name} on ${tc?.args?.TargetFile}`);
      console.log(`StartLine: ${tc?.args?.StartLine}, EndLine: ${tc?.args?.EndLine}`);
      console.log(`TargetContent len: ${tc?.args?.TargetContent?.length}, ReplacementContent len: ${tc?.args?.ReplacementContent?.length}`);
    }
    lineIdx++;
  }
}

checkArgs([936, 944, 950, 1115, 1491, 1541, 1549, 1555, 1559, 1565]);
