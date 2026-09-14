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
import { readRegularFileNoFollow } from './ipc/safeCopy';

const server = express();
let port = null;

/**
 * Precomputed authorized assets.
 * moduleName -> Map(relativePath -> absolute real path)
 * Request handling never joins user path segments into filesystem paths.
 */
/** @type {Map<string, Map<string, { absolutePath: string, root: string, allowPathFallback: boolean }>>} */
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
const MAX_MODULE_ASSET_BYTES = 16 * 1024 * 1024;
const MAX_CONCURRENT_ASSET_READS = 8;
let activeAssetReads = 0;
/** @type {Map<string, { count: number, resetAt: number }>} */
const rateBuckets = new Map();

function reserveAssetReadSlot() {
  if (activeAssetReads >= MAX_CONCURRENT_ASSET_READS) {
    return false;
  }
  activeAssetReads += 1;
  return true;
}

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

function resolveAssetAbsolute(moduleName, relativeFile, resolvedFile) {
  const moduleRoot = resolvedFile?.root || path.resolve(modulesDir, moduleName);
  const candidate =
    resolvedFile?.absolutePath || path.resolve(moduleRoot, relativeFile);
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

server.get('/modules/:moduleName/*', async (req, res) => {
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
  const asset = assets.get(relative);
  if (!asset) {
    return res.status(404).end('Not found');
  }
  if (!reserveAssetReadSlot()) {
    return res.status(503).end('Module file server busy');
  }
  let released = false;
  let readDone = false;
  let responseDone = false;
  const release = () => {
    if (released || !readDone || !responseDone) return;
    released = true;
    activeAssetReads -= 1;
  };
  const finishResponse = () => {
    responseDone = true;
    release();
  };
  res.once('finish', finishResponse);
  res.once('close', finishResponse);
  try {
    const content = await readRegularFileNoFollow(asset.absolutePath, {
      root: asset.root,
      label: relative,
      maxBytes: MAX_MODULE_ASSET_BYTES,
      allowPathFallback: asset.allowPathFallback,
    });
    readDone = true;
    if (responseDone) {
      release();
      return;
    }
    return res.type(path.basename(relative)).send(content);
  } catch {
    readDone = true;
    if (responseDone) {
      release();
      return;
    }
    release();
    return res.status(404).end('Not found');
  }
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
 * @param {string} moduleName validated module name
 * @param {{ path: string, absolutePath: string, root: string, allowPathFallback?: boolean }[]} files
 */
export function serveModuleFiles(moduleName, files) {
  const safeModuleName = assertSafeModuleName(moduleName);
  /** @type {Map<string, { absolutePath: string, root: string, allowPathFallback: boolean }>} */
  const next = new Map();

  for (const file of files || []) {
    const relative = normalizeRelativeFile(file.path);
    const absolute = resolveAssetAbsolute(safeModuleName, relative, file);
    next.set(relative, {
      absolutePath: absolute,
      root: file.root,
      allowPathFallback: Boolean(file.allowPathFallback),
    });
  }

  authorizedAssets.set(safeModuleName, next);
}

export function getAllowedModuleFiles(moduleName) {
  const map = authorizedAssets.get(moduleName);
  return map ? [...map.keys()] : [];
}
