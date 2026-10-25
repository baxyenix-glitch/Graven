import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

const targetFiles = [
  'src\\lib\\types\\tokens.ts',
  'src\\components\\ui\\Surface.tsx',
  'src\\app\\globals.css',
  'src\\app\\layout.tsx',
  'src\\components\\ui\\Button.tsx',
  'src\\components\\home\\StatsBand.tsx',
  'src\\components\\home\\Hero.tsx',
  'src\\app\\bury\\page.tsx',
  'src\\app\\faucet\\page.tsx',
  'src\\app\\terms\\page.tsx',
  'src\\app\\privacy\\page.tsx',
  'src\\app\\not-found.tsx',
  'src\\app\\error.tsx',
  'src\\app\\global-error.tsx',
  'src\\app\\admin\\page.tsx',
  'src\\app\\how-it-works\\page.tsx',
  'src\\components\\home\\TopGraves.tsx',
  'src\\components\\home\\RecentBurials.tsx',
  'src\\components\\home\\AnalyticsSection.tsx',
  'src\\components\\home\\AnalyticsCharts.tsx',
  'src\\components\\home\\TimelineAndCTA.tsx',
  'src\\app\\dashboard\\page.tsx',
  'src\\app\\graves\\page.tsx',
  'src\\app\\grave\\[address]\\page.tsx',
  'src\\app\\leaderboard\\page.tsx',
  'src\\components\\auth\\ConnectButton.tsx',
  'src\\components\\layout\\Navbar.tsx',
  'src\\components\\layout\\Footer.tsx',
  'src\\components\\layout\\CommandPalette.tsx',
  'src\\components\\chain\\WrongNetworkModal.tsx',
  'src\\components\\ui\\Toast.tsx',
  'src\\components\\grave\\Gravestone.tsx',
  'src\\app\\buttons\\page.tsx'
];

async function findLatestSnapshotBefore1190() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIndex = 0;
  const lastState = {};

  for await (const line of rl) {
    if (lineIndex >= 1190) break;
    try {
      const obj = JSON.parse(line);
      // check tool_calls
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file') {
            const f = tc.args?.TargetFile?.replace(/^"|"$/g, '');
            for (const tf of targetFiles) {
              if (f && f.endsWith(tf)) {
                lastState[tf] = { type: 'write_to_file', content: tc.args.CodeContent, line: lineIndex };
              }
            }
          }
        }
      }
      // check tool response (content)
      if (obj.type === 'VIEW_FILE' && obj.content) {
        for (const tf of targetFiles) {
          if (obj.content.includes(tf.replace(/\\/g, '/')) || obj.content.includes(tf)) {
            // Check if it has full content
            const match = obj.content.match(/Showing lines 1 to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
            if (match) {
              const rawLines = match[2].split('\n').map(l => l.replace(/^\d+:\s?/, '')).join('\n');
              lastState[tf] = { type: 'view_file', content: rawLines, line: lineIndex };
            }
          }
        }
      }
    } catch (e) {}
    lineIndex++;
  }

  console.log('Found states before line 1190:');
  for (const tf of targetFiles) {
    if (lastState[tf]) {
      console.log(` ✅ ${tf} found at line ${lastState[tf].line} (${lastState[tf].type}, len: ${lastState[tf].content?.length})`);
    } else {
      console.log(` ❌ ${tf} NOT found directly`);
    }
  }
}

findLatestSnapshotBefore1190();
