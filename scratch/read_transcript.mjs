import fs from 'fs';

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'USER_INPUT') {
      const match = (obj.content || '').match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
      const req = match ? match[1].trim() : obj.content;
      console.log(`\n=== STEP ${obj.step_index} ===`);
      console.log(req.substring(0, 300) + (req.length > 300 ? '... [total len ' + req.length + ']' : ''));
    }
  } catch (e) {}
}
