import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

const edits = [];
for (let i = 1190; i < 1683; i++) {
  const line = lines[i]?.trim();
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.name === 'replace_file_content' || tc.name === 'write_to_file' || tc.name === 'multi_replace_file_content') {
          edits.push({ line: i, name: tc.name, file: tc.args?.TargetFile, desc: tc.args?.Description });
        }
      }
    }
  } catch (e) {}
}

console.log('Edits between line 1190 and 1683:');
console.log(JSON.stringify(edits, null, 2));
