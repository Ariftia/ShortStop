import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const zipName = 'shortstop-v0.1.0.zip';
const zipPath = path.resolve(zipName);

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

try {
  execSync(`cd dist && zip -r "../${zipName}" ./*`, { stdio: 'inherit' });
  console.log(`Successfully created distribution archive: ${zipName}`);
} catch (err) {
  console.error('Packaging failed:', err);
  process.exit(1);
}
