/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://alcdn.msauth.net https://alcdn.msftauth.net https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://login.microsoftonline.com https://graph.microsoft.com https://*.azure-api.net https://*.azurewebsites.net https://va.vercel-scripts.com; frame-ancestors 'none';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};

function send(res, status, payload, contentType) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': contentType
  });
  res.end(payload);
}

function resolveSafePath(urlPath) {
  const requested = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const resolved = path.normalize(path.join(ROOT, requested));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function routeToFile(pathname) {
  if (pathname === '/' || pathname === '') return 'index.html';
  return pathname.replace(/^\/+/, '');
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;
  const candidate = resolveSafePath(routeToFile(pathname));

  if (!candidate) {
    send(res, 400, 'Bad request', 'text/plain; charset=utf-8');
    return;
  }

  fs.stat(candidate, (statErr, stats) => {
    let filePath = candidate;

    if (statErr || (stats && stats.isDirectory())) {
      filePath = resolveSafePath('index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(res, 404, 'Not found', 'text/plain; charset=utf-8');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      send(res, 200, data, contentType);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`AIC portal server listening on http://${HOST}:${PORT}`);
});
