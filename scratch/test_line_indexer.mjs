import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

// Map of relative path -> Array of lines (1-indexed)
const reconstructedFiles = {};

function addViewFileContent(content) {
  const m = content.match(/File Path: `file:\/\/\/(.*?)`[\s\S]*?Showing lines (\d+) to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
  if (!m) return;
  const filePath = m[1].replace(/\\/g, '/');
  
  // Normalize path relative to repo
  let relPath = filePath;
  const marker = 'Graden/';
  const idx = filePath.indexOf(marker);
  if (idx !== -1) {
    relPath = filePath.substring(idx + marker.length);
  }

  if (!reconstructedFiles[relPath]) {
    reconstructedFiles[relPath] = [];
  }

  const rawLines = m[4].split('\n');
  for (const line of rawLines) {
    const lineMatch = line.match(/^(\d+): (.*)/);
    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1], 10);
      reconstructedFiles[relPath][lineNum] = lineMatch[2];
    } else {
      const emptyMatch = line.match(/^(\d+):$/);
      if (emptyMatch) {
        const lineNum = parseInt(emptyMatch[1], 10);
        reconstructedFiles[relPath][lineNum] = '';
      }
    }
  }
}

async function testReconstruction() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  for await (const line of rl) {
    // Only capture views between 1195 and 1355 before files were rewritten!
    if (lineIdx >= 1195 && lineIdx <= 1355) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'VIEW_FILE' && obj.content) {
          addViewFileContent(obj.content);
        }
      } catch (e) {}
    }
    lineIdx++;
  }

  console.log('\n--- Reconstructed Files Summary ---');
  for (const [f, lines] of Object.entries(reconstructedFiles)) {
    const totalLines = lines.length - 1;
    // Check if any line in 1..totalLines is missing
    let missing = [];
    for (let i = 1; i <= totalLines; i++) {
      if (lines[i] === undefined) missing.push(i);
    }
    console.log(`${f}: ${totalLines} lines (missing: ${missing.length > 0 ? missing.join(',') : 'NONE ✅'})`);
  }
}

testReconstruction();
