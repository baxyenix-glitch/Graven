import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index >= 1180 && obj.step_index <= 1225) {
      console.log(`[Line ${i}] Step ${obj.step_index} | Type: ${obj.type} | Source: ${obj.source}`);
      if (obj.type === 'USER_INPUT') {
        console.log('CONTENT:', (obj.content || '').substring(0, 150));
      }
    }
  } catch (e) {}
}
