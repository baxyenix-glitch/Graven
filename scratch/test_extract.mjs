import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

// Files to restore to their state at Line 1189
const filesToRestore = [
  'src/components/ui/Surface.tsx',
  'src/app/globals.css',
  'src/app/layout.tsx',
  'src/components/ui/Button.tsx',
  'src/components/home/StatsBand.tsx',
  'src/components/home/Hero.tsx',
  'src/app/bury/page.tsx',
  'src/app/faucet/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/not-found.tsx',
  'src/app/error.tsx',
  'src/app/global-error.tsx',
  'src/app/admin/page.tsx',
  'src/app/how-it-works/page.tsx',
  'src/components/home/TopGraves.tsx',
  'src/components/home/RecentBurials.tsx',
  'src/components/home/AnalyticsSection.tsx',
  'src/components/home/AnalyticsCharts.tsx',
  'src/components/home/TimelineAndCTA.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/graves/page.tsx',
  'src/app/grave/[address]/page.tsx',
  'src/app/leaderboard/page.tsx',
  'src/components/auth/ConnectButton.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/CommandPalette.tsx',
  'src/components/chain/WrongNetworkModal.tsx',
  'src/components/ui/Toast.tsx',
  'src/components/grave/Gravestone.tsx'
];

async function extractSnapshots() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIndex = 0;
  // Map of file -> content
  const restoredContent = {};

  for await (const line of rl) {
    if (lineIndex > 1682) break;
    try {
      const obj = JSON.parse(line);

      // 1. If lineIndex < 1190, any write_to_file or replace_file_content or view_file gives us state up to 1189!
      // 2. If lineIndex >= 1190, the FIRST view_file on a file before modifying it gives us the EXACT state from before 1190!
      if (obj.type === 'VIEW_FILE' && obj.content) {
        for (const f of filesToRestore) {
          const matchName = f.replace(/\//g, '\\');
          if (obj.content.includes(f) || obj.content.includes(matchName)) {
            // Check if full content is in this view_file
            const m = obj.content.match(/Showing lines 1 to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
            if (m) {
              const fullMatch = obj.content.includes('shows the entire, complete file contents');
              // Extract lines
              const text = m[2].split('\n').map(l => l.replace(/^\d+:\s?/, '')).join('\n');
              
              if (lineIndex < 1190) {
                // If before 1190, this is valid state
                restoredContent[f] = { line: lineIndex, content: text, complete: fullMatch };
              } else if (!restoredContent[f]) {
                // If >= 1190 and we don't have it yet, the first view_file represents the unedited state from before 1190!
                restoredContent[f] = { line: lineIndex, content: text, complete: fullMatch };
              }
            }
          }
        }
      }
    } catch (e) {}
    lineIndex++;
  }

  console.log('\n--- Extraction Summary ---');
  for (const f of filesToRestore) {
    if (restoredContent[f]) {
      console.log(`[${restoredContent[f].complete ? 'FULL' : 'PARTIAL'}] ${f} extracted from line ${restoredContent[f].line} (len: ${restoredContent[f].content.length})`);
    } else {
      console.log(`[MISSING] ${f}`);
    }
  }
}

extractSnapshots();
