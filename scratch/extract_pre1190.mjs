import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function extractExactPre1190Files() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const extracted = {};

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];

      // Exact full file writes from lines 936 to 1115
      if (lineIdx === 936 && tc?.args?.ReplacementContent) {
        extracted['src/components/layout/Navbar.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 950 && tc?.args?.ReplacementContent) {
        extracted['src/components/layout/Footer.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 954 && tc?.args?.ReplacementContent) {
        extracted['src/components/home/StatsBand.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1019 && tc?.args?.ReplacementContent) {
        extracted['src/components/layout/CommandPalette.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1029 && tc?.args?.ReplacementContent) {
        extracted['src/components/home/AnalyticsCharts.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1031 && tc?.args?.ReplacementContent) {
        extracted['src/components/home/AnalyticsSection.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1035 && tc?.args?.ReplacementContent) {
        extracted['src/components/home/TimelineAndCTA.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1037 && tc?.args?.CodeContent) {
        extracted['src/app/how-it-works/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1039 && tc?.args?.CodeContent) {
        extracted['src/app/dashboard/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1045 && tc?.args?.CodeContent) {
        extracted['src/app/graves/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1053 && tc?.args?.CodeContent) {
        extracted['src/app/leaderboard/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1063 && tc?.args?.CodeContent) {
        extracted['src/app/grave/[address]/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1107 && tc?.args?.ReplacementContent) {
        extracted['src/components/auth/ConnectButton.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1115 && tc?.args?.ReplacementContent) {
        extracted['src/components/chain/WrongNetworkModal.tsx'] = tc.args.ReplacementContent;
      }

      // TopGraves and RecentBurials from TargetContent of lines 1447 & 1453
      if (lineIdx === 1447 && tc?.args?.TargetContent) {
        extracted['src/components/home/TopGraves.tsx'] = tc.args.TargetContent;
      }
      if (lineIdx === 1453 && tc?.args?.TargetContent) {
        extracted['src/components/home/RecentBurials.tsx'] = tc.args.TargetContent;
      }

      // Check view_file lines between 1200 and 1250 or 1320 and 1350
      if (obj.type === 'VIEW_FILE' && obj.content) {
        const m = obj.content.match(/File Path: `file:\/\/\/(.*?)`[\s\S]*?Showing lines 1 to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
        if (m) {
          const filePath = m[1].replace(/\\/g, '/');
          const code = m[3].split('\n').map(l => l.replace(/^\d+:\s?/, '')).join('\n')
            // remove trailing system message if any
            .replace(/\r?\nThe above content shows the entire, complete file contents of the requested file\.\r?$/, '')
            .replace(/\r?\nThe above content does NOT show the entire file contents[\s\S]*$/, '');
          
          if (filePath.endsWith('src/app/faucet/page.tsx') && !extracted['src/app/faucet/page.tsx']) {
            extracted['src/app/faucet/page.tsx'] = code;
          }
          if (filePath.endsWith('src/app/not-found.tsx') && !extracted['src/app/not-found.tsx']) {
            extracted['src/app/not-found.tsx'] = code;
          }
          if (filePath.endsWith('src/app/global-error.tsx') && !extracted['src/app/global-error.tsx']) {
            extracted['src/app/global-error.tsx'] = code;
          }
        }
      }

    } catch (e) {}
    lineIdx++;
  }

  console.log('Extracted files count:', Object.keys(extracted).length);
  for (const [k, v] of Object.entries(extracted)) {
    console.log(` - ${k}: ${v.length} characters`);
  }

  return extracted;
}

extractExactPre1190Files();
