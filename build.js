const esbuild = require('esbuild');
const fs      = require('fs');
const path    = require('path');

const isWatch = process.argv.includes('--watch');

// ── Auto-packs plugin ─────────────────────────────────────────
// Resolves the virtual import '~packs' → reads all *.json files
// from the /packs directory and bundles them as an array.
// To add a pack: just drop a .json file into /packs and rebuild.
const packsPlugin = {
  name: 'auto-packs',
  setup(build) {
    build.onResolve({ filter: /^~packs$/ }, () => ({
      path: '~packs',
      namespace: 'auto-packs',
    }));

    build.onLoad({ filter: /.*/, namespace: 'auto-packs' }, () => {
      const dir   = path.join(__dirname, 'packs');
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
      const packs = files.map(f =>
        JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
      );
      return {
        contents:   `export const BUILTIN_PACKS = ${JSON.stringify(packs)};`,
        loader:     'js',
        watchFiles: files.map(f => path.join(dir, f)),
        watchDirs:  [dir],
      };
    });
  },
};

// ── esbuild ───────────────────────────────────────────────────
async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/main.ts'],
    bundle:      true,
    outfile:     'dist/bundle.js',
    platform:    'browser',
    sourcemap:   true,
    minify:      !isWatch,
    loader: { '.css': 'css', '.png': 'file', '.jpg': 'file', '.svg': 'file' },
    assetNames:  '[name]',
    plugins:     [packsPlugin],
  });

  if (isWatch) {
    await ctx.watch();
    console.log('Watching for changes… (Ctrl+C to stop)');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('✓ Build complete → dist/bundle.js + dist/bundle.css');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
