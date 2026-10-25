import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

// Let's inspect the files modified between 1190 and 1682:
// 1. Files newly created in that pass:
// - src/lib/types/tokens.ts
// - src/app/buttons/page.tsx
// - scratch/test_tokens.js
// - scratch/audit_contrast_all.mjs
// - scratch/capture_proof.mjs
// These should simply be DELETED!

// 2. Files that had view_file at lines 1220-1350 before being modified:
// - src/app/faucet/page.tsx (viewed at line 1220, 1325)
// - src/app/terms/page.tsx (viewed at line 1222, 1329)
// - src/app/privacy/page.tsx (viewed at line 1224, 1333)
// - src/app/not-found.tsx (viewed at line 1226)
// - src/app/error.tsx (viewed at line 1228, 1339)
// - src/app/global-error.tsx (viewed at line 1341)
// - src/app/admin/page.tsx (viewed at line 1230, 1347, 1349)
// - src/components/ui/Toast.tsx (viewed at line 1561, 1564)

async function extractPreEdit(lineNumbers) {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (lineNumbers.includes(lineIdx)) {
      try {
        const obj = JSON.parse(line);
        console.log(`\n=== LINE ${lineIdx} (${obj.type}) ===`);
        if (obj.content) {
          const m = obj.content.match(/File Path: `file:\/\/\/(.*?)`[\s\S]*?Showing lines 1 to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
          if (m) {
            console.log('File:', m[1], 'Lines:', m[2]);
            const code = m[3].split('\n').map(l => l.replace(/^\d+:\s?/, '')).join('\n');
            console.log('First 2 lines:', code.split('\n').slice(0, 2));
            console.log('Last 2 lines:', code.split('\n').slice(-3));
            console.log('Code len:', code.length);
          } else {
            console.log('No code match. Content snippet:', obj.content.substring(0, 200));
          }
        }
      } catch (e) {
        console.error('Error on line', lineIdx, e.message);
      }
    }
    lineIdx++;
  }
}

extractPreEdit([1220, 1222, 1224, 1226, 1228, 1341, 1349, 1564]);
