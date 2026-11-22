const assert = require('assert/strict');
const fs = require('fs');
const vm = require('vm');
const babel = require('@babel/core');
const React = require('react');

let state = null;
let effect;
let pendingRead;
const revoked = [];
const StarryNight = () => null;
const mocks = {
  react: { ...React, useState: () => [state, value => { state = value; }], useEffect: fn => { effect = fn; } },
  'react-redux': { useSelector: () => ({}) },
  fs: { readFile: (path, callback) => { pendingRead = { path, callback }; } },
  '@emotion/styled': { __esModule: true, default: { div: () => () => null } },
  'lib/theme': {},
  './StarryNight': StarryNight,
  './Particles': () => null,
  './Light_Space.jpg': 'bundled.jpg',
};
const compiled = babel.transformFileSync('src/App/AppBackground/index.js', {
  configFile: false, babelrc: false,
  presets: [['@babel/preset-env', { targets: { node: 'current' } }], ['@babel/preset-react', { runtime: 'automatic' }]],
}).code;
const mod = { exports: {} };
vm.runInNewContext(compiled, {
  module: mod, exports: mod.exports, Blob,
  URL: { createObjectURL: URL.createObjectURL, revokeObjectURL: url => { revoked.push(url); URL.revokeObjectURL(url); } },
  require: name => mocks[name] || require(name),
});
const { LocalWallpaper } = mod.exports;

async function main() {
  const path = 'C:/Pictures/Wallpaper #1 ("custom").PNG';
  LocalWallpaper({ path, size: 'contain' });
  const cleanup = effect();
  assert.equal(pendingRead.path, path);
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuoAAAAASUVORK5CYII=', 'base64');
  pendingRead.callback(null, bytes);
  const rendered = LocalWallpaper({ path, size: 'contain' });
  assert.match(rendered.props.image, /^blob:/);
  assert.equal(rendered.props.size, 'contain');
  const response = await fetch(rendered.props.image);
  assert.equal(response.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  assert.equal(LocalWallpaper({ path: 'other.jpg' }).props.image, undefined);
  cleanup();
  assert.deepEqual(revoked, [rendered.props.image]);

  LocalWallpaper({ path: 'missing.jpg' });
  const cleanupMissing = effect();
  pendingRead.callback(new Error('ENOENT'));
  assert.equal(LocalWallpaper({ path: 'missing.jpg' }).type, StarryNight);
  cleanupMissing();

  LocalWallpaper({ path: 'slow.jpg' });
  const cleanupSlow = effect();
  const previousState = state;
  cleanupSlow();
  pendingRead.callback(null, bytes);
  assert.equal(state, previousState, 'Late reads must not update an unmounted wallpaper');
  console.log('PASS: Wallpaper bytes, MIME type, special-character paths, sizing, fallback, replacement and URL cleanup.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
