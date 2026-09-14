'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  isTrustedWindowUrl,
  normalizeWindowUrl,
} = require('../../src/main/ipc/navigationPolicy');

const root = path.resolve(__dirname, '../..');

test('main-window URL policy allows only the configured document and hash routes', () => {
  const trusted = 'file:///opt/Nexus%20Wallet/app.html';
  assert.equal(isTrustedWindowUrl(trusted, trusted), true);
  assert.equal(isTrustedWindowUrl(`${trusted}#/settings`, trusted), true);
  assert.equal(isTrustedWindowUrl(`${trusted}?redirect=https://evil.test`, trusted), false);
  assert.equal(isTrustedWindowUrl('https://evil.test/', trusted), false);
  assert.equal(
    isTrustedWindowUrl('http://localhost:1212/assets/app.html', trusted),
    false
  );
  assert.equal(isTrustedWindowUrl('not a URL', trusted), false);
  const credentialed = new URL('https://example.test/');
  credentialed.username = 'user';
  credentialed.password = 'password';
  assert.throws(
    () => normalizeWindowUrl(credentialed.toString()),
    /credentials/
  );
});

test('main-window CSP is external-script-only and permits required local assets', () => {
  const html = fs.readFileSync(
    path.join(root, 'assets', 'static', 'app.html'),
    'utf8'
  );
  assert.match(html, /Content-Security-Policy/);
  const scriptDirective = html.match(/script-src\s+([^;]+)/)?.[1] || '';
  assert.equal(scriptDirective, "'self'");
  const connectDirective = html.match(/connect-src\s+([^;]+)/)?.[1] || '';
  assert.equal(connectDirective, "'self'");
  assert.match(html, /frame-src http:\/\/127\.0\.0\.1:\*/);
  assert.doesNotMatch(html, /frame-src[^;]*\bfile:/);
  assert.match(html, /src="\.\/app-bootstrap\.js"/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/);
});
