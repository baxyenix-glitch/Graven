import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

const queryFiles = [
  'Surface.tsx',
  'globals.css',
  'layout.tsx',
  'Button.tsx',
  'bury/page.tsx',
  'terms/page.tsx',
  'privacy/page.tsx',
  'error.tsx',
  'admin/page.tsx',
  'Toast.tsx'
];

async function findFileHistory() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineIdx > 1360) break;
    try {
      const obj = JSON.parse(line);
      for (const qf of queryFiles) {
        if (line.includes(qf) || line.includes(qf.replace(/\//g, '\\\\'))) {
          if (obj.tool_calls) {
            for (const tc of obj.tool_calls) {
              if (tc.name === 'view_file' || tc.name === 'write_to_file' || tc.name === 'replace_file_content') {
                console.log(`Line ${lineIdx}: ${tc.name} on ${tc.args?.TargetFile || tc.args?.AbsolutePath} (${qf})`);
              }
            }
          }
          if (obj.type === 'VIEW_FILE' && obj.content && (obj.content.includes(qf) || obj.content.includes(qf.replace(/\//g, '/')))) {
            console.log(`Line ${lineIdx}: VIEW_FILE response for ${qf} (len: ${obj.content.length})`);
          }
        }
      }
    } catch (e) {}
    lineIdx++;
  }
}

findFileHistory();
