import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

async function searchNavAndFooter() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    if (line.includes('src/components/layout/Navbar.tsx') || line.includes('src\\\\components\\\\layout\\\\Navbar.tsx')) {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        console.log(`Line ${lineIdx}: ${obj.tool_calls[0].name} on Navbar Start: ${obj.tool_calls[0].args?.StartLine} End: ${obj.tool_calls[0].args?.EndLine}`);
      }
      if (obj.type === 'VIEW_FILE') {
        const m = obj.content.match(/Showing lines (\d+) to (\d+)/);
        if (m) console.log(`Line ${lineIdx}: VIEW_FILE Navbar ${m[1]} to ${m[2]}`);
      }
    }
    if (line.includes('src/components/layout/Footer.tsx') || line.includes('src\\\\components\\\\layout\\\\Footer.tsx')) {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        console.log(`Line ${lineIdx}: ${obj.tool_calls[0].name} on Footer Start: ${obj.tool_calls[0].args?.StartLine} End: ${obj.tool_calls[0].args?.EndLine}`);
      }
      if (obj.type === 'VIEW_FILE') {
        const m = obj.content.match(/Showing lines (\d+) to (\d+)/);
        if (m) console.log(`Line ${lineIdx}: VIEW_FILE Footer ${m[1]} to ${m[2]}`);
      }
    }
    lineIdx++;
  }
}

searchNavAndFooter();
