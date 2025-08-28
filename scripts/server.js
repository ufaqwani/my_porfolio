import http from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const port = process.env.PORT || 3000;
const root = resolve(process.cwd(), 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  // Normalize URL and prevent path traversal
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  // Ensure leading slashes don't escape the public root
  const cleaned = urlPath.replace(/^\/+/, '');
  let filePath = cleaned === '' ? join(root, 'index.html') : join(root, cleaned);

  try {
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
  } catch (e) {
    // ignore and fall through to 404
  }

  if (!existsSync(filePath)) {
    // Only fallback to index.html for non-asset routes (no extension) requesting HTML
    const wantsHtml = (req.headers['accept'] || '').includes('text/html');
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(cleaned);
    if (wantsHtml && !hasExtension) {
      const fallback = join(root, 'index.html');
      if (existsSync(fallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        createReadStream(fallback).pipe(res);
        return;
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end('Not found');
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const type = mimeTypes[ext] || 'application/octet-stream';
  const isHtml = ext === '.html';
  const headers = { 'Content-Type': type };
  if (isHtml) {
    headers['Cache-Control'] = 'no-cache';
  } else {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  }
  res.writeHead(200, headers);
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
