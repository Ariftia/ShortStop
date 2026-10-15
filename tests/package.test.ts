import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

describe('Package and Distribution Archive Integrity', () => {
  const manifestPath = path.resolve('public/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  it('contains valid browser_specific_settings with gecko id', () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.browser_specific_settings).toBeDefined();
    expect(manifest.browser_specific_settings.gecko).toBeDefined();
    expect(manifest.browser_specific_settings.gecko.id).toBe('shortstop@stop-scrolling.ext');
  });

  it('guarantees packaged zip and xpi files have manifest.json at the archive root', () => {
    const archives = ['shortstop-v0.1.0.zip', 'shortstop-v0.1.0.xpi'];

    for (const archive of archives) {
      const archivePath = path.resolve(archive);
      expect(fs.existsSync(archivePath), `Expected ${archive} to exist`).toBe(true);

      const zipOutput = execSync(`unzip -l "${archivePath}"`, { encoding: 'utf8' });
      const lines = zipOutput.split('\n');

      // Check root-level manifest.json exists
      const hasRootManifest = lines.some((line) => line.trim().endsWith(' manifest.json'));
      expect(hasRootManifest, `${archive} must contain manifest.json at archive root`).toBe(true);

      // Verify no corrupt nested folder prefix (e.g. dist/manifest.json)
      const hasCorruptPrefix = lines.some((line) => line.includes('dist/manifest.json'));
      expect(hasCorruptPrefix, `${archive} must not have dist/ prefix`).toBe(false);
    }
  });
});
