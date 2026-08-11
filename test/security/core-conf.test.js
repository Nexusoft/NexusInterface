'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  fromKeyValues,
  parseBooleanFlag,
  resolveApiPortSSL,
  resolveEmbeddedCoreConnection,
  toKeyValues,
} = require('../../src/main/ipc/coreConf');

test('fromKeyValues trims Windows newlines and ignores comments', () => {
  const conf = fromKeyValues(
    'apiuser=apiserver\r\napipassword=secret\r\n# comment\r\napissl=1\r\n'
  );
  assert.deepEqual(conf, {
    apiuser: 'apiserver',
    apipassword: 'secret',
    apissl: '1',
  });
});

test('fromKeyValues strips a leading UTF-8 BOM from the first key', () => {
  const conf = fromKeyValues('\uFEFFapiuser=apiserver\napipassword=secret\n');
  assert.equal(conf.apiuser, 'apiserver');
  assert.equal(conf.apipassword, 'secret');
  assert.equal(conf['\uFEFFapiuser'], undefined);
});

test('toKeyValues skips undefined and null values', () => {
  const text = toKeyValues({
    apiuser: 'apiserver',
    apipassword: undefined,
    apisslport: null,
    apiport: '8080',
  });
  assert.equal(text, 'apiuser=apiserver\napiport=8080');
});

test('resolveApiPortSSL prefers Core apisslport over wallet apiportssl alias', () => {
  // Core only honors apisslport; apiportssl is a historical wallet-only alias.
  assert.equal(resolveApiPortSSL({ apisslport: '7099' }, '8443'), '7099');
  assert.equal(resolveApiPortSSL({ apiportssl: '7080' }, '8443'), '7080');
  assert.equal(
    resolveApiPortSSL({ apisslport: '7099', apiportssl: '7080' }, '8443'),
    '7099'
  );
  assert.equal(resolveApiPortSSL({}, '7080'), '7080');
});

test('parseBooleanFlag accepts Core-style 0/1 and true/false', () => {
  assert.equal(parseBooleanFlag('0', true), false);
  assert.equal(parseBooleanFlag('false', true), false);
  assert.equal(parseBooleanFlag('1', false), true);
  assert.equal(parseBooleanFlag(true, false), true);
  assert.equal(parseBooleanFlag(undefined, true), true);
});

test('settings overlay forces SSL/port alignment even when conf is stale', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {
      apiuser: 'apiserver',
      apipassword: 'existing-secret',
      // Stale conf that would make the GUI open plain HTTP while Core is
      // started with -apissl=1 (historical wallet launch flags).
      apissl: '0',
      apiport: '18080',
      // Core CLI-style key — must be preserved as the written conf key.
      apisslport: '8443',
    },
    {
      embeddedCoreUseNonSSL: false,
      embeddedCoreApiPort: undefined,
      embeddedCoreApiPortSSL: undefined,
      generatedApiPassword: 'should-not-replace',
    }
  );

  assert.equal(resolved.changed, true);
  assert.equal(resolved.connection.apiSSL, true);
  assert.equal(resolved.connection.apiPort, '18080');
  // Existing conf SSL port is preserved when settings do not override it.
  assert.equal(resolved.connection.apiPortSSL, '8443');
  assert.equal(resolved.connection.apiPassword, 'existing-secret');
  assert.equal(resolved.conf.apisslport, '8443');
  assert.equal(resolved.conf.apissl, '1');
  assert.equal(resolved.conf.apiportssl, undefined);

  // Serialized conf must use the Core-recognized key. Writing only apiportssl
  // leaves Core on default SSL port 8443 while the GUI dials 7080.
  const serialized = toKeyValues(resolved.conf);
  assert.match(serialized, /apisslport=8443/);
  assert.doesNotMatch(serialized, /apiportssl=/);
});

test('wallet SSL port setting overrides a default Core 8443 conf value', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {
      apiuser: 'apiserver',
      apipassword: 'secret',
      apissl: '1',
      apiport: '8080',
      apisslport: '8443',
    },
    {
      embeddedCoreUseNonSSL: false,
      embeddedCoreApiPortSSL: '7080',
      generatedApiPassword: 'unused',
    }
  );

  assert.equal(resolved.connection.apiPortSSL, '7080');
  assert.equal(resolved.conf.apisslport, '7080');
});

test('historical apiportssl conf alias is migrated to Core apisslport', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {
      apiuser: 'apiserver',
      apipassword: 'secret',
      apissl: '1',
      apiport: '8080',
      // Wallet-only alias Core ignores — must be rewritten.
      apiportssl: '7080',
    },
    {
      embeddedCoreUseNonSSL: false,
      generatedApiPassword: 'unused',
    }
  );

  assert.equal(resolved.changed, true);
  assert.equal(resolved.connection.apiPortSSL, '7080');
  assert.equal(resolved.conf.apisslport, '7080');
  assert.equal(resolved.conf.apiportssl, undefined);
  assert.match(toKeyValues(resolved.conf), /apisslport=7080/);
  assert.doesNotMatch(toKeyValues(resolved.conf), /apiportssl=/);
});

test('missing credentials are created so Core enables its API server', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {},
    {
      embeddedCoreUseNonSSL: false,
      generatedApiPassword: 'generated-secret',
    }
  );

  assert.equal(resolved.changed, true);
  assert.equal(resolved.connection.apiUser, 'apiserver');
  assert.equal(resolved.connection.apiPassword, 'generated-secret');
  assert.equal(resolved.connection.apiSSL, true);
  assert.equal(resolved.connection.apiPort, '8080');
  assert.equal(resolved.connection.apiPortSSL, '8443');
  assert.equal(resolved.conf.apisslport, '8443');
});

const { normalizePort } = require('../../src/main/ipc/coreConf');

test('normalizePort accepts valid port numbers in 1..65535', () => {
  assert.equal(normalizePort('8443', 8443, 'apisslport'), '8443');
  assert.equal(normalizePort('7080', 8443, 'apisslport'), '7080');
  assert.equal(normalizePort('1', 8443, 'apisslport'), '1');
  assert.equal(normalizePort('65535', 8443, 'apisslport'), '65535');
  assert.equal(normalizePort(8080, 8080, 'apiport'), '8080');
});

test('normalizePort rejects zero and falls back to default SSL port 8443', () => {
  assert.equal(normalizePort('0', 8443, 'apisslport'), '8443');
  assert.equal(normalizePort(0, 8443, 'apisslport'), '8443');
});

test('normalizePort rejects blank and falls back to configured default', () => {
  assert.equal(normalizePort('', 8443, 'apisslport'), '8443');
  assert.equal(normalizePort(null, 8080, 'apiport'), '8080');
  assert.equal(normalizePort(undefined, 8080, 'apiport'), '8080');
});

test('normalizePort rejects non-numeric values and falls back', () => {
  assert.equal(normalizePort('abc', 8443, 'apisslport'), '8443');
  assert.equal(normalizePort('7080abc', 8443, 'apisslport'), '8443');
  assert.equal(normalizePort('port7080', 8080, 'apiport'), '8080');
});

test('normalizePort rejects negative values and falls back', () => {
  assert.equal(normalizePort('-1', 8443, 'apisslport'), '8443');
  assert.equal(normalizePort('-8080', 8080, 'apiport'), '8080');
});

test('normalizePort rejects values above 65535 and falls back', () => {
  assert.equal(normalizePort('65536', 8443, 'apisslport'), '8443');
  assert.equal(normalizePort('99999', 8080, 'apiport'), '8080');
});

test('apisslport=0 in conf is repaired to fallback port 8443', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {
      apiuser: 'apiserver',
      apipassword: 'secret',
      apissl: '1',
      apiport: '8080',
      apisslport: '0',
    },
    {
      embeddedCoreUseNonSSL: false,
      generatedApiPassword: 'unused',
    }
  );

  assert.equal(resolved.changed, true);
  assert.equal(resolved.connection.apiPortSSL, '8443');
  assert.equal(resolved.conf.apisslport, '8443');
});

test('valid explicitly configured custom port 7080 is preserved without fallback', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {
      apiuser: 'apiserver',
      apipassword: 'secret',
      apissl: '1',
      apiport: '8080',
      apisslport: '7080',
    },
    {
      embeddedCoreUseNonSSL: false,
      generatedApiPassword: 'unused',
    }
  );

  assert.equal(resolved.connection.apiPortSSL, '7080');
  assert.equal(resolved.conf.apisslport, '7080');
  assert.match(toKeyValues(resolved.conf), /apisslport=7080/);
});

test('non-numeric apisslport in conf is repaired to fallback port 8443', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {
      apiuser: 'apiserver',
      apipassword: 'secret',
      apisslport: 'notaport',
    },
    {
      embeddedCoreUseNonSSL: false,
      generatedApiPassword: 'unused',
    }
  );

  assert.equal(resolved.changed, true);
  assert.equal(resolved.connection.apiPortSSL, '8443');
  assert.equal(resolved.conf.apisslport, '8443');
});

test('apisslport above 65535 in conf is repaired to fallback port 8443', () => {
  const resolved = resolveEmbeddedCoreConnection(
    {
      apiuser: 'apiserver',
      apipassword: 'secret',
      apisslport: '99999',
    },
    {
      embeddedCoreUseNonSSL: false,
      generatedApiPassword: 'unused',
    }
  );

  assert.equal(resolved.connection.apiPortSSL, '8443');
  assert.equal(resolved.conf.apisslport, '8443');
});
