import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

const missingFiles = [
  'src/lib/types/tokens.ts',
  'src/app/faucet/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/not-found.tsx',
  'src/app/error.tsx',
  'src/app/global-error.tsx',
  'src/app/admin/page.tsx',
  'src/app/grave/[address]/page.tsx',
  'src/components/ui/Toast.tsx',
  'src/app/buttons/page.tsx'
];

async function checkMentions() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIndex = 0;
  for await (const line of rl) {
    for (const mf of missingFiles) {
      const norm = mf.replace(/\//g, '\\\\');
      if (line.includes(mf) || line.includes(norm)) {
        try {
          const obj = JSON.parse(line);
          console.log(`Line ${lineIndex}: ${mf} | type: ${obj.type} | name: ${obj.tool_calls?.[0]?.name}`);
        } catch (e) {
          console.log(`Line ${lineIndex}: ${mf} (parse error)`);
        }
      }
    }
    lineIndex++;
  }
}

checkMentions();
