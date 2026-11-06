'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const test = require('node:test');
const babel = require('@babel/core');
const { amountUnits, validateCoreAmount } = require('../../src/shared/utils/amount');
const { validateCoreRpcRequest } = require('../../src/main/ipc/contracts');
const { validateSendDraft } = require('../../src/main/ipc/moduleApiV2');
const { createSharedQuerySubscription } = require('../../src/shared/utils/sharedQuerySubscription');
const { createConfigOwner } = require('../../src/main/ipc/configOwner');

function loadModule(relativePath, overrides) {
  const filename = path.resolve(__dirname, '../..', relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    filename,
    presets: [
      [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
      ...(filename.endsWith('.ts') ? [require.resolve('@babel/preset-typescript')] : []),
    ],
  }).code;
  const originalRequire = createRequire(filename);
  const localRequire = (name) =>
    Object.prototype.hasOwnProperty.call(overrides, name)
      ? overrides[name]
      : originalRequire(name);
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports);
  return module.exports;
}

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-boundary-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('amounts preserve exact strings and enforce asset precision and uint64 units', () => {
  assert.equal(amountUnits('001.2300', 4), 12300n);
  assert.equal(amountUnits('184467440737.09551615', 8), 18446744073709551615n);
  assert.equal(validateCoreAmount(1e-8), 1e-8);
  assert.equal(validateCoreAmount(1.2e-7), 1.2e-7);
  assert.throws(() => validateCoreAmount(1e-9), TypeError);
  for (const [amount, decimals] of [
    ['1,5', 6], ['1e2', 6], ['1.2x', 6], ['1.', 6], ['.1', 6],
    ['-1', 6], ['0', 6], ['1.001', 2], ['184467440737.09551616', 8],
    ['1', undefined], ['1', 9],
  ]) {
    assert.throws(() => amountUnits(amount, decimals), TypeError, String(amount));
  }
  for (const amount of ['9007199254740993', '0.00000001', '001.2300']) {
    const request = validateCoreRpcRequest({
      endpoint: 'finance/debit/any',
      params: { pin: '1234', from: 'fromaddress', recipients: [{ address_to: 'toaddress', amount }] },
    });
    assert.equal(JSON.parse(JSON.stringify(request.params)).recipients[0].amount, amount);
  }
  for (const amount of ['1,5', '0', '1.000000001', '18446744073709551616', 9007199254740992]) {
    assert.throws(() => validateCoreRpcRequest({
      endpoint: 'finance/debit/token',
      params: { pin: '1234', from: 'fromaddress', recipients: [{ address_to: 'toaddress', amount }] },
    }));
  }
});

test('send precision follows the selected token or account metadata', () => {
  const { getSourcePrecision } = loadModule('src/shared/lib/send.ts', {
    react: {},
    'react-router': {},
    'lib/wallet': {},
    'lib/form': {},
    'lib/coreConfig': {},
    'lib/user': {},
    'utils/misc': {},
    'lib/store': { store: {} },
    'utils/memoize': { __esModule: true, default: (fn) => fn },
    'lib/api': {},
  });
  const balances = [{ decimals: 6 }, [{ token: 'token-1', decimals: 2 }]];
  assert.equal(getSourcePrecision({ account: { token: '0' } }, balances), 6);
  assert.equal(getSourcePrecision({ account: { token: 'token-1' } }, balances), 2);
  assert.equal(getSourcePrecision({ token: { decimals: 8 } }, balances), 8);
  assert.equal(getSourcePrecision({ account: { token: 'unknown' } }, balances), undefined);
  assert.equal(getSourcePrecision({ token: { decimals: 9 } }, balances), undefined);
  assert.equal(getSourcePrecision(null, undefined), undefined);
});

test('module send drafts never truncate amounts or accept unsafe numeric inputs', () => {
  for (const amount of ['00000001.2300', 1.5, 0]) {
    const draft = validateSendDraft({ recipients: [{ address: 'abc', amount }] });
    assert.equal(draft.recipients[0].amount, String(amount));
  }
  for (const amount of [
    '1'.repeat(65),
    '1e2',
    '1.000000001',
    '18446744073709551616',
    'not-an-amount',
    Number.MAX_SAFE_INTEGER + 1,
    Infinity,
    NaN,
  ]) {
    assert.throws(() => validateSendDraft({ recipients: [{ address: 'abc', amount }] }));
  }
});

test('settings failures preserve the original file and only missing files use defaults', (t) => {
  const directory = temporaryDirectory(t);
  const settingsPath = path.join(directory, 'settings.json');
  const settings = loadModule('src/main/settings.js', {
    './paths': {
      settingsFilePath: settingsPath,
      themeFilePath: path.join(directory, 'theme.json'),
      addressBookFilePath: path.join(directory, 'addressbook.json'),
      defaultCoreDataDir: directory,
      walletDataDir: directory,
    },
    macaddress: { networkInterfaces: () => ({}) },
  });
  assert.equal(settings.loadSettingsFromFile().liteMode, true);
  fs.writeFileSync(settingsPath, '{"locale":"fr","liteMode":false}');
  const originalRead = fs.readFileSync;
  try {
    fs.readFileSync = function (file, ...args) {
      if (file === settingsPath) throw Object.assign(new Error('transient read failure'), { code: 'EIO' });
      return originalRead.call(this, file, ...args);
    };
    assert.throws(() => settings.updateSettingsFile({ locale: 'en' }), /transient read failure/);
  } finally {
    fs.readFileSync = originalRead;
  }
  assert.equal(fs.readFileSync(settingsPath, 'utf8'), '{"locale":"fr","liteMode":false}');
  fs.writeFileSync(settingsPath, '{invalid');
  assert.throws(() => settings.updateSettingsFile({ locale: 'en' }), SyntaxError);
  assert.equal(fs.readFileSync(settingsPath, 'utf8'), '{invalid');
  fs.writeFileSync(settingsPath, '[]');
  assert.throws(() => settings.updateSettingsFile({ locale: 'en' }), /Invalid JSON object/);
});

test('shared query keeps one subscription until the last consumer leaves', () => {
  let starts = 0;
  let stops = 0;
  let active = 0;
  const subscribe = createSharedQuerySubscription(
    () => {
      starts++;
      active++;
      return () => { active--; };
    },
    () => { stops++; }
  );
  const first = subscribe();
  const second = subscribe();
  first();
  first();
  assert.equal(active, 1);
  second();
  assert.equal(active, 0);
  const third = subscribe();
  assert.equal(active, 1);
  third();
  assert.deepEqual([starts, stops, active], [2, 2, 0]);
});

test('invalidated config loads cannot publish and new loads wait for old work', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const events = [];
  const owner = createConfigOwner(async (value, assertCurrent) => {
    events.push(`start:${value}`);
    if (value === 'old') await gate;
    assertCurrent();
    events.push(`commit:${value}`);
    return value;
  });
  const old = owner.get('old');
  await Promise.resolve();
  owner.invalidate();
  const next = owner.get('new');
  const alsoNext = owner.get('new');
  release();
  await assert.rejects(old, /configuration changed/);
  assert.equal(await next, 'new');
  assert.equal(await alsoNext, 'new');
  assert.equal(await owner.get('ignored'), 'new');
  assert.deepEqual(events, ['start:old', 'start:new', 'commit:new']);
});

test('Core config read errors and invalidated writes never overwrite nexus.conf', async (t) => {
  const directory = temporaryDirectory(t);
  const configPath = path.join(directory, 'nexus.conf');
  const original = 'apiuser=existing\napipassword=existing-secret\napissl=1\napiport=8080\napisslport=8443';
  fs.writeFileSync(configPath, original);
  const settings = { coreDataDir: directory };
  let readFailure = true;
  let pauseWrite;
  let writeStarted;
  const started = new Promise((resolve) => { writeStarted = resolve; });
  const fsPromises = {
    ...fs.promises,
    async readFile(...args) {
      if (readFailure) throw Object.assign(new Error('read failed'), { code: 'EIO' });
      return fs.promises.readFile(...args);
    },
    async writeFile(...args) {
      if (pauseWrite) {
        writeStarted();
        await pauseWrite;
      }
      return fs.promises.writeFile(...args);
    },
  };
  const rpc = loadModule('src/main/coreRpc.js', {
    './settings': { loadSettingsFromFile: () => settings },
    'fs/promises': fsPromises,
  });
  await assert.rejects(rpc.getCoreConfiguration(), /read failed/);
  assert.equal(fs.readFileSync(configPath, 'utf8'), original);
  readFailure = false;
  let release;
  pauseWrite = new Promise((resolve) => { release = resolve; });
  settings.embeddedCoreApiPort = '9001';
  const stale = rpc.getCoreConfiguration();
  await started;
  settings.embeddedCoreApiPort = '9002';
  rpc.clearCoreConfigCache();
  const current = rpc.getCoreConfiguration();
  release();
  await assert.rejects(stale, /configuration changed/);
  assert.equal((await current).apiPort, '9002');
  assert.match(fs.readFileSync(configPath, 'utf8'), /apiport=9002/);
  assert.equal(fs.readdirSync(directory).filter((name) => name.endsWith('.tmp')).length, 0);
});

test('Core transport terminates truncated, slow and oversized responses and never retries debits', async (t) => {
  let count = 0;
  let received;
  const server = http.createServer((request, response) => {
    count++;
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      received = body && JSON.parse(body);
      if (request.url === '/finance/debit/any') {
        response.writeHead(200, { 'Content-Length': '100' });
        response.write('{"result":');
        setTimeout(() => response.destroy(), 20);
      } else if (request.url === '/finance/debit/token') {
        response.end(JSON.stringify({ result: { success: false } }));
      } else if (request.url === '/finance/debit/token-missing') {
        response.end(JSON.stringify({ result: {} }));
      } else if (request.url === '/finance/credit/any') {
        response.end('{invalid');
      } else if (request.url === '/system/get/slow') {
        response.writeHead(200);
        const timer = setInterval(() => response.write(' '), 10);
        response.on('close', () => clearInterval(timer));
      } else if (request.url === '/system/get/large') {
        response.writeHead(200);
        response.end(Buffer.alloc(32 * 1024 * 1024 + 1, 32));
      } else {
        response.end(JSON.stringify({ result: { ok: true } }));
      }
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const settings = {
    manualDaemon: true, manualDaemonIP: '127.0.0.1',
    manualDaemonApiSSL: false, manualDaemonApiPort: String(server.address().port),
  };
  const rpc = loadModule('src/main/coreRpc.js', { './settings': { loadSettingsFromFile: () => settings } });
  assert.deepEqual(await rpc.callCoreRpc({ endpoint: 'system/get/ok', timeout: 500 }), { ok: true });
  const before = count;
  await assert.rejects(
    rpc.callCoreRpc({
      endpoint: 'finance/debit/any',
      params: { recipients: [{ amount: '9007199254740993' }] },
      timeout: 500,
    }),
    (error) => error.code === 'CORE_OUTCOME_UNKNOWN' && /Check transaction history/.test(error.message)
  );
  assert.equal(count, before + 1);
  assert.equal(received.recipients[0].amount, '9007199254740993');
  await assert.rejects(
    rpc.callCoreRpc({ endpoint: 'finance/debit/token', timeout: 500 }),
    (error) => error.code !== 'CORE_OUTCOME_UNKNOWN' && /rejected the transaction/.test(error.message)
  );
  await assert.rejects(
    rpc.callCoreRpc({ endpoint: 'finance/debit/token-missing', timeout: 500 }),
    (error) => error.code === 'CORE_OUTCOME_UNKNOWN' && /did not confirm/.test(error.message)
  );
  await assert.rejects(
    rpc.callCoreRpcByUrl('/finance/credit/any'),
    (error) => error.code === 'CORE_OUTCOME_UNKNOWN' && /Check its state/.test(error.message)
  );
  await assert.rejects(rpc.callCoreRpc({ endpoint: 'system/get/slow', timeout: 80 }), /deadline/);
  await assert.rejects(rpc.callCoreRpc({ endpoint: 'system/get/large', timeout: 3000 }), /32 MiB/);
});
