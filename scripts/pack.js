import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version || '0.1.0';
const name = pkg.name || 'shortstop';

const distDir = path.resolve('dist');
const manifestPath = path.join(distDir, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Error: dist/manifest.json not found! Run "npm run build" first.');
  process.exit(1);
}

const archives = [
  `${name}-v${version}.zip`,
  `${name}-v${version}.xpi`,
  `${name}.xpi`
];

for (const archive of archives) {
  const archivePath = path.resolve(archive);
  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath);
  }
}

try {
  // Zip directly from inside dist/ so all files (manifest.json, background.js, etc.)
  // are located at the root of the archive. Firefox rejects archives if manifest.json
  // is placed inside a subfolder or prefixed with a parent path.
  const primaryArchive = archives[0];
  execSync(`cd dist && zip -r -FS "../${primaryArchive}" * -x ".*"`, { stdio: 'inherit' });

  // Copy primary archive to .xpi targets
  for (let i = 1; i < archives.length; i++) {
    fs.copyFileSync(primaryArchive, archives[i]);
  }

  // Validate archive contents to ensure manifest.json is at root
  const zipListing = execSync(`unzip -l "${primaryArchive}"`, { encoding: 'utf8' });
  const lines = zipListing.split('\n');
  const hasRootManifest = lines.some((line) => line.trim().endsWith(' manifest.json'));
  const hasCorruptPrefix = lines.some((line) => line.includes('dist/manifest.json'));

  if (!hasRootManifest || hasCorruptPrefix) {
    console.error('Validation Error: manifest.json is not at archive root!');
    process.exit(1);
  }

  console.log('\n📦 Package archives generated successfully at root:');
  for (const archive of archives) {
    const stats = fs.statSync(archive);
    console.log(`   ✓ ${archive} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
} catch (err) {
  console.error('Packaging failed:', err);
  process.exit(1);
}
