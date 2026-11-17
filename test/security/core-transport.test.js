'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getCoreTransportOptions,
  isLoopbackHost,
  validateCoreRpcPath,
} = require('../../src/main/ipc/coreTransport');

test('only literal loopback Core hosts receive the local TLS exception', () => {
  for (const host of [
    '127.0.0.1',
    '127.10.20.30',
    '::1',
    '[::1]',
    '0:0:0:0:0:0:0:1',
    '::ffff:127.0.0.1',
  ]) {
    assert.equal(isLoopbackHost(host), true, host);
    assert.deepEqual(getCoreTransportOptions({ ip: host, apiSSL: false }), {
      apiSSL: false,
      rejectUnauthorized: false,
    });
  }

  for (const host of ['localhost', '::ffff:192.0.2.1', '192.0.2.1', 'core.example']) {
    assert.equal(isLoopbackHost(host), false, host);
    assert.throws(
      () => getCoreTransportOptions({ ip: host, apiSSL: false }),
      /Remote Core endpoints require TLS/
    );
    assert.deepEqual(getCoreTransportOptions({ ip: host, apiSSL: true }), {
      apiSSL: true,
      rejectUnauthorized: true,
    });
  }
});

test('Core RPC paths reject encoded and malformed traversal', () => {
  assert.equal(validateCoreRpcPath('/system/stop'), 'system/stop');
  assert.equal(validateCoreRpcPath('wallet/list/transactions'), 'wallet/list/transactions');

  for (const value of [
    '',
    '/',
    '../system/stop',
    'system/../stop',
    'system/%2e%2e/stop',
    'system/%2Fetc',
    'system/%5Cwindows',
    'system/%',
    'https://core.example/system/stop',
    'system\\stop',
  ]) {
    assert.throws(() => validateCoreRpcPath(value), /Core RPC URL/);
  }
});
