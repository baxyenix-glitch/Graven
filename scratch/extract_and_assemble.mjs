import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

function cleanViewCode(content) {
  const m = content.match(/Showing lines (\d+) to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
  if (!m) return null;
  const raw = m[3];
  const cleaned = raw.split('\n')
    .filter(l => /^\d+:/.test(l))
    .map(l => l.replace(/^\d+:\s?/, ''))
    .join('\n');
  return {
    start: parseInt(m[1]),
    end: parseInt(m[2]),
    code: cleaned
  };
}

async function run() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const linesMap = {};

  // Store lines we need
  const targets = [
    936, 950, 954, 1019, 1029, 1031, 1035, 1037, 1039, 1045, 1053, 1063, 1107, 1115, 1447, 1453,
    1198, 1200, 1202, 1204, 1206, 1208, 1214, 1220, 1226, 1244, 1306, 1329, 1333, 1339, 1341, 1347, 1349, 1564
  ];

  for await (const line of rl) {
    if (targets.includes(lineIdx)) {
      linesMap[lineIdx] = JSON.parse(line);
    }
    lineIdx++;
  }

  const files = {};

  // 1. Direct tool replacements or writes
  files['src/components/layout/Navbar.tsx'] = linesMap[936].tool_calls[0].args.ReplacementContent;
  files['src/components/layout/Footer.tsx'] = linesMap[950].tool_calls[0].args.ReplacementContent;
  files['src/components/home/StatsBand.tsx'] = linesMap[954].tool_calls[0].args.ReplacementContent;
  files['src/components/layout/CommandPalette.tsx'] = linesMap[1019].tool_calls[0].args.ReplacementContent;
  files['src/components/home/AnalyticsCharts.tsx'] = linesMap[1029].tool_calls[0].args.ReplacementContent;
  files['src/components/home/AnalyticsSection.tsx'] = linesMap[1031].tool_calls[0].args.ReplacementContent;
  files['src/components/home/TimelineAndCTA.tsx'] = linesMap[1035].tool_calls[0].args.ReplacementContent;
  files['src/app/how-it-works/page.tsx'] = linesMap[1037].tool_calls[0].args.CodeContent;
  files['src/app/dashboard/page.tsx'] = linesMap[1039].tool_calls[0].args.CodeContent;
  files['src/app/graves/page.tsx'] = linesMap[1045].tool_calls[0].args.CodeContent;
  files['src/app/leaderboard/page.tsx'] = linesMap[1053].tool_calls[0].args.CodeContent;
  files['src/app/grave/[address]/page.tsx'] = linesMap[1063].tool_calls[0].args.CodeContent;
  files['src/components/auth/ConnectButton.tsx'] = linesMap[1107].tool_calls[0].args.ReplacementContent;
  files['src/components/chain/WrongNetworkModal.tsx'] = linesMap[1115].tool_calls[0].args.ReplacementContent;
  files['src/components/home/TopGraves.tsx'] = linesMap[1447].tool_calls[0].args.TargetContent;
  files['src/components/home/RecentBurials.tsx'] = linesMap[1453].tool_calls[0].args.TargetContent;

  // 2. Views that were single complete chunks
  files['src/components/ui/Surface.tsx'] = cleanViewCode(linesMap[1214].content)?.code;
  files['src/app/faucet/page.tsx'] = cleanViewCode(linesMap[1220].content)?.code;
  files['src/app/not-found.tsx'] = cleanViewCode(linesMap[1226].content)?.code;
  files['src/components/ui/Button.tsx'] = cleanViewCode(linesMap[1244].content)?.code;
  files['src/app/layout.tsx'] = cleanViewCode(linesMap[1306].content)?.code;
  files['src/app/terms/page.tsx'] = cleanViewCode(linesMap[1329].content)?.code;
  files['src/app/privacy/page.tsx'] = cleanViewCode(linesMap[1333].content)?.code;
  files['src/app/error.tsx'] = cleanViewCode(linesMap[1339].content)?.code;
  files['src/app/global-error.tsx'] = cleanViewCode(linesMap[1341].content)?.code;

  // 3. Multi-chunk views: globals.css (1198, 1200, 1202)
  const g1 = cleanViewCode(linesMap[1198].content)?.code || '';
  const g2 = cleanViewCode(linesMap[1200].content)?.code || '';
  const g3 = cleanViewCode(linesMap[1202].content)?.code || '';
  files['src/app/globals.css'] = [g1, g2, g3].filter(Boolean).join('\n');

  // 4. Multi-chunk views: bury/page.tsx (1204, 1206, 1208)
  const b1 = cleanViewCode(linesMap[1204].content)?.code || '';
  const b2 = cleanViewCode(linesMap[1206].content)?.code || '';
  const b3 = cleanViewCode(linesMap[1208].content)?.code || '';
  files['src/app/bury/page.tsx'] = [b1, b2, b3].filter(Boolean).join('\n');

  // 5. Multi-chunk views: admin/page.tsx (1347, 1349)
  const a1 = cleanViewCode(linesMap[1347].content)?.code || '';
  const a2 = cleanViewCode(linesMap[1349].content)?.code || '';
  files['src/app/admin/page.tsx'] = [a1, a2].filter(Boolean).join('\n');

  // 6. Toast.tsx (1564)
  if (linesMap[1564]) {
    files['src/components/ui/Toast.tsx'] = cleanViewCode(linesMap[1564].content)?.code;
  }

  console.log('--- Extracted File Results ---');
  for (const [k, v] of Object.entries(files)) {
    if (!v) {
      console.log(`❌ ${k} is EMPTY/NULL`);
    } else {
      console.log(`✅ ${k}: ${v.split('\n').length} lines (${v.length} bytes)`);
    }
  }

  // Write them to a staging folder to inspect
  const stageDir = 'scratch/staged_revert';
  fs.mkdirSync(stageDir, { recursive: true });
  for (const [k, v] of Object.entries(files)) {
    if (v) {
      const outPath = `${stageDir}/${k.replace(/\//g, '__')}`;
      fs.writeFileSync(outPath, v, 'utf8');
    }
  }
  console.log('\nWrote all files to scratch/staged_revert/');
}

run();
