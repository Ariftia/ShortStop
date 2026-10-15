import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const isWatch = process.argv.includes('--watch');
const outdir = path.resolve('dist');

// Ensure directories exist
fs.mkdirSync(outdir, { recursive: true });
fs.mkdirSync(path.join(outdir, 'ui'), { recursive: true });
fs.mkdirSync(path.join(outdir, 'icons'), { recursive: true });

function copyStatic() {
  // Manifest
  fs.copyFileSync('public/manifest.json', path.join(outdir, 'manifest.json'));

  // Icons
  const icons = fs.readdirSync('public/icons');
  for (const file of icons) {
    fs.copyFileSync(path.join('public/icons', file), path.join(outdir, 'icons', file));
  }

  // CSS
  fs.copyFileSync('src/content/content.css', path.join(outdir, 'content.css'));

  // UI HTML & CSS
  const pages = ['popup', 'blocked', 'settings', 'onboarding'];
  for (const page of pages) {
    const htmlSrc = `src/ui/${page}/${page}.html`;
    const cssSrc = `src/ui/${page}/${page}.css`;
    if (fs.existsSync(htmlSrc)) {
      fs.copyFileSync(htmlSrc, path.join(outdir, `ui/${page}.html`));
    }
    if (fs.existsSync(cssSrc)) {
      fs.copyFileSync(cssSrc, path.join(outdir, `ui/${page}.css`));
    }
  }

  console.log('Static assets copied to dist/');
}

async function runBuild() {
  copyStatic();

  const buildOptions = {
    entryPoints: [
      { in: 'src/background/index.ts', out: 'background' },
      { in: 'src/content/index.ts', out: 'content' },
      { in: 'src/ui/popup/popup.ts', out: 'ui/popup' },
      { in: 'src/ui/blocked/blocked.ts', out: 'ui/blocked' },
      { in: 'src/ui/settings/settings.ts', out: 'ui/settings' },
      { in: 'src/ui/onboarding/onboarding.ts', out: 'ui/onboarding' },
    ],
    outdir,
    bundle: true,
    format: 'iife',
    target: ['firefox115', 'chrome115'],
    sourcemap: !isWatch ? false : 'inline',
    minify: !isWatch,
    logLevel: 'info',
  };

  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('Build completed successfully!');
  }
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
