/**
 * Express server serving static files for modules.
 * Only manifest-listed, path-normalized module files are reachable.
 */
import path, { normalize, sep } from 'path';
import fs from 'fs';
import express from 'express';
import log from 'electron-log';

import { modulesDir } from './paths';
import { assertRelativeModulePath, assertSafeModuleName } from './ipc/contracts';

const server = express();
let port = null;

/**
 * Precomputed authorized assets.
 * moduleName -> Map(relativePath -> absolute real path)
 * Request handling never joins user path segments into filesystem paths.
 */
/** @type {Map<string, Map<string, string>>} */
const authorizedAssets = new Map();

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX = 120;
/** @type {Map<string, { count: number, resetAt: number }>} */
const rateBuckets = new Map();

function normalizeRelativeFile(file) {
  let filePath = normalize(String(file)).replace(/\\/g, '/');
  while (filePath.startsWith('/')) filePath = filePath.slice(1);
  return assertRelativeModulePath(filePath);
}

function setSecurityHeaders(res) {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
}

function isRateLimited(req) {
  const key = String(req.ip || req.socket?.remoteAddress || 'local');
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateBuckets.set(key, bucket);
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return true;
  }
  bucket.count += 1;
  return false;
}

function resolveAssetAbsolute(moduleName, relativeFile) {
  const moduleRoot = path.resolve(modulesDir, moduleName);
  const candidate = path.resolve(moduleRoot, relativeFile);
  if (candidate !== moduleRoot && !candidate.startsWith(`${moduleRoot}${sep}`)) {
    throw new Error('Module file escapes module root');
  }

  const realRoot = fs.realpathSync(moduleRoot);
  const leafStat = fs.lstatSync(candidate);
  if (leafStat.isSymbolicLink() || !leafStat.isFile()) {
    throw new Error('Module file must be a regular non-symlink file');
  }
  const realFile = fs.realpathSync(candidate);
  if (realFile !== realRoot && !realFile.startsWith(`${realRoot}${sep}`)) {
    throw new Error('Module file realpath escapes module root');
  }
  return realFile;
}

server.get('/modules/:moduleName/*', (req, res) => {
  // Rate-limit this filesystem-serving route before any work.
  if (isRateLimited(req)) {
    setSecurityHeaders(res);
    return res.status(429).end('Too many requests');
  }

  setSecurityHeaders(res);

  let moduleName;
  try {
    moduleName = assertSafeModuleName(req.params.moduleName);
  } catch {
    return res.status(400).end('Invalid module');
  }

  const assets = authorizedAssets.get(moduleName);
  if (!assets || !assets.size) {
    return res.status(404).end('Module files not prepared');
  }

  let relative;
  try {
    const wildcard = req.params[0] || '';
    relative = normalizeRelativeFile(decodeURIComponent(wildcard));
  } catch {
    return res.status(400).end('Invalid path');
  }

  // Lookup only — absolute path was authorized when the module was prepared.
  const absolute = assets.get(relative);
  if (!absolute) {
    return res.status(404).end('Not found');
  }

  return res.sendFile(absolute, (error) => {
    if (error && !res.headersSent) res.status(404).end('Not found');
  });
});

// Loopback-only: module assets must never be reachable from the LAN/WAN.
const listener = server.listen(0, '127.0.0.1', () => {
  port = listener.address().port;
  log.info(`File server listening on 127.0.0.1:${port}`);
});

export function getDomain() {
  return `http://127.0.0.1:${port}`;
}

/**
 * Authorize a module's static files for serving.
 * Computes and stores absolute real paths up front so request handlers never
 * build filesystem paths from request input.
 * @param {string[]} files paths like `${moduleName}/${relativeFile}`
 */
export function serveModuleFiles(files) {
  /** @type {Map<string, Map<string, string>>} */
  const next = new Map();

  for (const file of files || []) {
    const normalized = normalize(String(file)).replace(/\\/g, '/');
    const parts = normalized.replace(/^\/+/, '').split('/');
    if (parts.length < 2) continue;
    const moduleName = assertSafeModuleName(parts[0]);
    const relative = normalizeRelativeFile(parts.slice(1).join('/'));
    const absolute = resolveAssetAbsolute(moduleName, relative);
    if (!next.has(moduleName)) next.set(moduleName, new Map());
    next.get(moduleName).set(relative, absolute);
  }

  authorizedAssets.clear();
  for (const [moduleName, map] of next) {
    authorizedAssets.set(moduleName, map);
  }
}

export function getAllowedModuleFiles(moduleName) {
  const map = authorizedAssets.get(moduleName);
  return map ? [...map.keys()] : [];
}
