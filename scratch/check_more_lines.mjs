import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

const linesToCheck = [851, 895, 908, 912, 978, 982, 1007, 1013, 1015, 1076, 1077, 1080, 1081];

async function checkMoreLines() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (linesToCheck.includes(lineIdx)) {
      try {
        const obj = JSON.parse(line);
        console.log(`\nLine ${lineIdx} (${obj.type}):`);
        if (obj.tool_calls) {
          const tc = obj.tool_calls[0];
          console.log(`  tool: ${tc.name} on ${tc.args?.TargetFile}`);
          if (tc.args?.ReplacementContent) console.log('  ReplacementContent len:', tc.args.ReplacementContent.length);
          if (tc.args?.TargetContent) console.log('  TargetContent len:', tc.args.TargetContent.length);
        }
        if (obj.content && obj.type === 'VIEW_FILE') {
          console.log('  view_file content len:', obj.content.length);
          const firstLine = obj.content.split('\n')[2];
          console.log('  view_file first line:', firstLine);
        }
      } catch (e) {}
    }
    lineIdx++;
  }
}

checkMoreLines();
