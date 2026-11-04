import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
// Guard against an empty, zero or non-numeric PORT, which would otherwise
// silently bind a random port instead of the documented 4173.
const port = Number(process.env.PORT) || 4173;

await new Promise((resolve, reject) => {
  const build = spawn(process.execPath, [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
  build.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Build failed: ${code}`))));
});

const dist = path.join(root, 'dist');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

/* Text files are sent gzipped (the JS and CSS shrink to about a quarter). */
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.map', '.svg']);

/* filePath -> { tag, data, gzipped } so a file is read and compressed once per change. */
const fileCache = new Map();

async function loadFile(filePath) {
  const details = await stat(filePath);
  const tag = `"${details.size.toString(36)}-${details.mtimeMs.toString(36)}"`;
  const hit = fileCache.get(filePath);
  if (hit && hit.tag === tag) return hit;

  const data = await readFile(filePath);
  const entry = {
    tag,
    data,
    gzipped: COMPRESSIBLE.has(path.extname(filePath)) ? gzipSync(data) : null,
  };
  fileCache.set(filePath, entry);
  return entry;
}

const server = createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url, 'http://' + request.headers.host).pathname);
    let filePath = path.join(dist, urlPath === '/' ? 'index.html' : urlPath);

    try {
      const details = await stat(filePath);
      if (details.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      filePath = path.join(dist, 'index.html');
    }

    const file = await loadFile(filePath);
    // "no-cache" = the browser keeps its copy but checks it is still current;
    // an unchanged file then costs a tiny 304 reply instead of a full download.
    const headers = {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ETag: file.tag,
      Vary: 'Accept-Encoding',
    };

    if (request.headers['if-none-match'] === file.tag) {
      response.writeHead(304, headers);
      response.end();
      return;
    }

    const acceptsGzip = /\bgzip\b/.test(request.headers['accept-encoding'] || '');
    if (file.gzipped && acceptsGzip) {
      response.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
      response.end(file.gzipped);
      return;
    }

    response.writeHead(200, headers);
    response.end(file.data);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('VALORA frontend server error');
    console.error(error);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`VALORA frontend running at http://localhost:${server.address().port}`);
});
