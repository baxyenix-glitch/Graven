import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (let i = 1180; i < 1205; i++) {
  const line = lines[i]?.trim();
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    console.log(`[Line ${i}] type: ${obj.type}, step: ${obj.step_index}, src: ${obj.source}`);
    if (obj.content) console.log('  content snippet:', obj.content.substring(0, 100).replace(/\n/g, ' '));
  } catch (e) {}
}

console.log('--- checking around line 1680 ---');
for (let i = 1680; i < 1735; i++) {
  const line = lines[i]?.trim();
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    console.log(`[Line ${i}] type: ${obj.type}, step: ${obj.step_index}, src: ${obj.source}`);
    if (obj.content) console.log('  content snippet:', obj.content.substring(0, 100).replace(/\n/g, ' '));
  } catch (e) {}
}
