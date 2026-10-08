import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);

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
};

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

    const data = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(data);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('VALORA frontend server error');
    console.error(error);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`VALORA frontend running at http://localhost:${port}`);
});
