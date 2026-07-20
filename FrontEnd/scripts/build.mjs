import * as esbuild from 'esbuild';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, 'src/main.jsx')],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: path.join(dist, 'assets/app.js'),
  loader: { '.jsx': 'jsx' },
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});

const html = await readFile(path.join(root, 'index.html'), 'utf8');
await writeFile(
  path.join(dist, 'index.html'),
  html.replace(
    '<script type="module" src="/src/main.jsx"></script>',
    '<link rel="stylesheet" href="/assets/app.css" />\n    <script type="module" src="/assets/app.js"></script>',
  ),
);

console.log('Built → dist/');
