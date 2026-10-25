import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

const linesToCheck = [936, 950, 954, 1007, 1013, 1015, 1019, 1023, 1029, 1031, 1035, 1037, 1039, 1045, 1053, 1063, 1077, 1081, 1107, 1115];

async function checkSpecificLines() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (linesToCheck.includes(lineIdx)) {
      try {
        const obj = JSON.parse(line);
        const tc = obj.tool_calls?.[0];
        console.log(`Line ${lineIdx}: ${tc?.name} -> Target: ${tc?.args?.TargetFile}`);
        if (tc?.args?.CodeContent) {
          console.log(`   CodeContent length: ${tc.args.CodeContent.length}`);
        }
        if (tc?.args?.ReplacementContent) {
          console.log(`   ReplacementContent length: ${tc.args.ReplacementContent.length}`);
        }
      } catch (e) {
        console.error('Err at', lineIdx, e.message);
      }
    }
    lineIdx++;
  }
}

checkSpecificLines();
