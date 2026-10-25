import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function apply1107() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  let target = null;
  let repl = null;

  for await (const line of rl) {
    if (lineIdx === 1107) {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      target = tc?.args?.TargetContent;
      repl = tc?.args?.ReplacementContent;
    }
    lineIdx++;
  }

  const current = fs.readFileSync('src/components/auth/ConnectButton.tsx', 'utf8');
  if (current.includes(target)) {
    const updated = current.replace(target, repl);
    fs.writeFileSync('src/components/auth/ConnectButton.tsx', updated, 'utf8');
    console.log('Applied line 1107 replacement cleanly to ConnectButton.tsx!');
  } else {
    console.log('Target not found in ConnectButton.tsx');
  }
}

apply1107();
