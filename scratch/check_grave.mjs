import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function checkGravestoneLines() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx === 1579 || lineIdx === 1674) {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      console.log(`Line ${lineIdx}: Target -> \n${tc?.args?.TargetContent}`);
      console.log(`\nReplacement -> \n${tc?.args?.ReplacementContent}\n`);
    }
    lineIdx++;
  }
}

checkGravestoneLines();
