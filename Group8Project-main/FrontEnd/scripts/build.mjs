import * as esbuild from 'esbuild';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

function parseEnvFile(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

async function loadFrontendEnv() {
  let fileValues = {};
  try {
    fileValues = parseEnvFile(await readFile(path.join(root, '.env'), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  return {
    VITE_API_BASE_URL:
      process.env.VITE_API_BASE_URL || fileValues.VITE_API_BASE_URL || 'http://localhost:8000',
    VITE_USE_MOCK_AUTH:
      process.env.VITE_USE_MOCK_AUTH || fileValues.VITE_USE_MOCK_AUTH || 'false',
  };
}

const frontendEnv = await loadFrontendEnv();
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
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env': JSON.stringify(frontendEnv),
  },
});

const html = await readFile(path.join(root, 'index.html'), 'utf8');
await writeFile(
  path.join(dist, 'index.html'),
  html.replace(
    '<script type="module" src="/src/main.jsx"></script>',
    '<link rel="stylesheet" href="/assets/app.css" />\n    <script type="module" src="/assets/app.js"></script>',
  ),
);

const mode = String(frontendEnv.VITE_USE_MOCK_AUTH).toLowerCase() === 'false' ? 'api' : 'mock';
console.log(`Built → dist/ (auth mode: ${mode})`);
