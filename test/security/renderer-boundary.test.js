'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');

const ALLOWED_NODE_FILE_PREFIXES = [
  path.join('src', 'main') + path.sep,
  path.join('src', 'keyboard', 'preload.js'),
  path.join('src', 'module_preload.js'),
  path.join('src', 'module') + path.sep,
];

const FORBIDDEN_IMPORT_RE =
  /(?:^|\n)\s*(?:import\s+(?:[^'"\n]+from\s+)?|require\s*\(\s*)['"](?:node:)?(fs|fs\/promises|path|http|https|crypto|os|child_process|net|tls|stream|zlib|worker_threads|vm|module|assert|url|buffer|dns|dgram|cluster|readline|repl|tty|v8|perf_hooks|async_hooks|inspector|trace_events|punycode|querystring|string_decoder|sys|constants|electron|macaddress|check-disk-space|unzip-stream)['"]/g;

const FORBIDDEN_PROCESS_RE =
  /\bprocess\.(?:env|platform|arch|cwd|binding|dlopen|mainModule)\b/;

const FORBIDDEN_REQUIRE_ELECTRON_RE = /\brequire\s*\(\s*['"]electron['"]\s*\)/;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'build' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === 'dll'
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(entry.name)) continue;
    files.push(fullPath);
  }
  return files;
}

function isAllowedNodeFile(relativePath) {
  const normalized = path.normalize(relativePath);
  return ALLOWED_NODE_FILE_PREFIXES.some((prefix) => {
    if (prefix.endsWith(path.sep)) {
      return normalized.startsWith(prefix);
    }
    return normalized === prefix;
  });
}

function collectMatches(source, regex) {
  const matches = [];
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(source))) {
    matches.push(match[0].trim());
  }
  return matches;
}

test('renderer and shared code stay free of Node core, Electron, and process privilege access', () => {
  const files = walk(path.join(root, 'src')).concat(
    walk(path.join(root, 'assets')).filter((filePath) =>
      /\.(js|ts|tsx)$/.test(filePath)
    )
  );

  const violations = [];

  for (const filePath of files) {
    const relativePath = path.relative(root, filePath);
    if (isAllowedNodeFile(relativePath)) continue;

    const source = fs.readFileSync(filePath, 'utf8');
    const importHits = collectMatches(source, FORBIDDEN_IMPORT_RE);
    if (importHits.length) {
      violations.push(`${relativePath}: forbidden import/require (${importHits[0]})`);
    }
    if (FORBIDDEN_PROCESS_RE.test(source)) {
      violations.push(`${relativePath}: direct process privilege access`);
    }
    if (FORBIDDEN_REQUIRE_ELECTRON_RE.test(source)) {
      violations.push(`${relativePath}: require("electron")`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Renderer boundary violations:\n${violations.join('\n')}`
  );
});

test('legacy Node-backed shared module ports are no longer present', () => {
  for (const relativePath of [
    path.join('src', 'shared', 'consts', 'paths.ts'),
    path.join('src', 'shared', 'utils', 'ensureDirExists.ts'),
    path.join('src', 'shared', 'utils', 'move.ts'),
    path.join('src', 'shared', 'utils', 'normalizeEol.ts'),
    path.join('src', 'shared', 'lib', 'modules', 'installModule.ts'),
    path.join('src', 'shared', 'lib', 'modules', 'module.ts'),
    path.join('src', 'shared', 'lib', 'modules', 'repo.ts'),
    path.join('src', 'shared', 'lib', 'modules', 'storage.ts'),
    path.join('src', 'shared', 'lib', 'modules', 'autoUpdate.ts'),
  ]) {
    assert.equal(
      fs.existsSync(path.join(root, relativePath)),
      false,
      `${relativePath} should be removed after main-process migration`
    );
  }
});

test('preload exposes clipboard and analytics through named IPC channels only', () => {
  const preload = fs.readFileSync(
    path.join(root, 'src', 'main', 'preload.js'),
    'utf8'
  );
  const contracts = fs.readFileSync(
    path.join(root, 'src', 'main', 'ipc', 'contracts.js'),
    'utf8'
  );

  assert.match(contracts, /writeClipboard:\s*'app:write-clipboard'/);
  assert.match(contracts, /trackEvent:\s*'app:track-event'/);
  assert.match(preload, /CHANNELS\.app\.writeClipboard/);
  assert.match(preload, /CHANNELS\.app\.trackEvent/);
  assert.doesNotMatch(preload, /\bclipboard\.writeText\b/);
  assert.doesNotMatch(preload, /@aptabase\/electron\/renderer/);
});
