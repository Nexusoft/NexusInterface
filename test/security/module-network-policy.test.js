'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getModuleProxyConfig,
  isAllowedModuleRequest,
} = require('../../src/main/ipc/moduleNetworkPolicy');

const domain = 'http://127.0.0.1:43123';

test('production module sessions can request only their local module assets', () => {
  const policy = { moduleName: 'demo', development: false };

  for (const url of [
    `${domain}/modules/demo/index.html`,
    `${domain}/modules/demo/assets/app.js?version=1`,
    'data:image/png;base64,AAAA',
    'blob:http://127.0.0.1:43123/id',
    'about:blank',
  ]) {
    assert.equal(isAllowedModuleRequest(url, policy, domain), true, url);
  }

  for (const url of [
    `${domain}/modules/other/index.html`,
    `${domain}/modules/demo-evil/index.html`,
    'http://127.0.0.1:8080/private',
    'https://example.com/collect',
    'wss://example.com/socket',
    'file:///etc/passwd',
  ]) {
    assert.equal(isAllowedModuleRequest(url, policy, domain), false, url);
  }
});

test('development module sessions use only their loopback-served assets', () => {
  const policy = { moduleName: 'demo', development: true };
  assert.equal(
    isAllowedModuleRequest(`${domain}/modules/demo/index.html`, policy, domain),
    true
  );
  assert.equal(
    isAllowedModuleRequest('file:///tmp/demo/index.html', policy, domain),
    false
  );
  assert.equal(
    isAllowedModuleRequest(`${domain}/modules/other/index.html`, policy, domain),
    false
  );
});

test('module proxy blackholes external traffic and bypasses only production assets', () => {
  const production = getModuleProxyConfig(
    { moduleName: 'demo', development: false },
    domain
  );
  assert.match(production.proxyRules, /127\.0\.0\.1:9/);
  assert.equal(production.proxyBypassRules, '<-loopback>,127.0.0.1:43123');

  const development = getModuleProxyConfig(
    { moduleName: 'demo', development: true },
    domain
  );
  assert.equal(development.proxyBypassRules, '<-loopback>,127.0.0.1:43123');
});
