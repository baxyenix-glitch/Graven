import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function listAllEdits() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const edits = [];
  for await (const line of rl) {
    if (lineIdx >= 1190 && lineIdx <= 1682) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (const tc of obj.tool_calls) {
            if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
              edits.push({
                line: lineIdx,
                name: tc.name,
                target: tc.args?.TargetFile,
                hasCode: Boolean(tc.args?.CodeContent),
                hasTarget: Boolean(tc.args?.TargetContent),
                hasRepl: Boolean(tc.args?.ReplacementContent),
                codeLen: tc.args?.CodeContent?.length,
                targetLen: tc.args?.TargetContent?.length,
                replLen: tc.args?.ReplacementContent?.length,
                desc: tc.args?.Description
              });
            }
          }
        }
      } catch (e) {}
    }
    lineIdx++;
  }

  console.log(`Total edits between 1190 and 1682: ${edits.length}`);
  console.log(JSON.stringify(edits, null, 2));
}

listAllEdits();
