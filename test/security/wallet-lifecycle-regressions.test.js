'use strict';

const assert = require('node:assert/strict');
const { EventEmitter, once } = require('node:events');
const http = require('node:http');
const net = require('node:net');
const { promisify } = require('node:util');
const test = require('node:test');
const loadModule = require('../helpers/load-module');
const { isCoreApiOwnedByProcess } = require('../../src/main/coreApiOwnership');

const configuration = {
  ip: '127.0.0.1', apiSSL: false, apiPort: '8080', apiPortSSL: '8443',
  apiUser: 'wallet', apiPassword: 'test-password',
};

function coreFixture(options = {}) {
  let now = 0;
  let running = options.running ?? true;
  let probes = 0;
  let spawns = 0;
  let rpcStops = 0;
  const signals = [];
  const settings = {
    coreDataDir: '/wallet/data', embeddedCoreBinaryPath: '/wallet/nexus',
    coreAPIPolicy: 1,
  };
  const core = loadModule('src/main/core.js', {
    './paths': { assetsByPlatformDir: '/assets' },
    './settings': { loadSettingsFromFile: () => settings },
    './coreRpc': {
      clearCoreConfigCache() {},
      getCoreConfiguration: async () => configuration,
      probeCoreApi: async () => {
        probes++;
        return options.probe?.(probes) || { ok: false, error: 'API starting' };
      },
      callCoreRpcOnConnectedSocket: async ({ assertConnection }) => {
        await assertConnection();
        rpcStops++;
        running = false;
      },
    },
    './coreApiOwnership': { isCoreApiOwnedByProcess: async () => options.apiOwned ?? false },
    'electron-log': { info() {}, warn() {}, error() {} },
    fs: {
      constants: { X_OK: 1 },
      statSync() {
        if (options.missingBinary) throw Object.assign(new Error('missing'), { code: 'ENOENT' });
        return { isFile: () => true };
      },
      accessSync() {},
      promises: {
        readFile: async () => Buffer.from(
          `/wallet/nexus\0-datadir=${options.otherDataDir || '/wallet/data'}\0`
        ),
      },
    },
    child_process: {
      execFile: (_file, _args, _options, callback) =>
        callback(null, running
          ? `1234 /wallet/nexus -datadir=${options.otherDataDir || '/wallet/data'}\n`
          : '', ''),
    },
    'cross-spawn': () => {
      spawns++;
      const child = new EventEmitter();
      child.pid = 5678;
      child.unref = () => {};
      queueMicrotask(() => options.spawnError
        ? child.emit('error', options.spawnError)
        : child.emit('spawn'));
      return child;
    },
  }, {
    process: {
      platform: 'linux', arch: 'x64', env: {},
      kill(pid, signal) { signals.push([pid, signal]); running = false; },
    },
    Date: { now: () => now },
    setTimeout: (callback, delay) => { now += delay; queueMicrotask(callback); },
    console: { error() {} },
  });

  return {
    core, signals,
    counts: () => ({ probes, spawns, rpcStops }),
  };
}

test('existing Core gets readiness retries, not a restart after a transient failure', async () => {
  const fixture = coreFixture({ probe: (attempt) => ({ ok: attempt >= 3 }) });
  const result = await fixture.core.startConfiguredCore();
  assert.equal(result.reason, 'already-running');
  assert.equal(result.apiReachable, true);
  assert.deepEqual(fixture.counts(), { probes: 3, spawns: 0, rpcStops: 0 });
  assert.deepEqual(fixture.signals, []);
});

test('updater recovery tracks the wallet-managed Core, not another Core process', async () => {
  const managed = coreFixture();
  const unrelated = coreFixture({ otherDataDir: '/other/data' });
  assert.equal(await managed.core.isEmbeddedCoreRunning(), true);
  assert.equal(await unrelated.core.isEmbeddedCoreRunning(), false);
});

test('an API readiness timeout never kills or replaces an existing managed Core', async () => {
  const fixture = coreFixture();
  const result = await fixture.core.startConfiguredCore();
  assert.equal(result.reason, 'managed-core-api-unreachable');
  assert.equal(result.apiReachable, false);
  assert.ok(fixture.counts().probes > 1);
  assert.equal(fixture.counts().spawns, 0);
  assert.deepEqual(fixture.signals, []);
});

test('missing binary does not prevent discovery or a normal no-Core shutdown', async () => {
  const fixture = coreFixture({ missingBinary: true, running: false });
  assert.equal(await fixture.core.isCoreRunning(), false);
  assert.deepEqual(await fixture.core.stopEmbeddedCore(), { stopped: true, reason: 'not-running' });
  await assert.rejects(fixture.core.startConfiguredCore(), /not found/);
});

test('asynchronous Core spawn errors reject startup without an unhandled child error', async () => {
  const error = Object.assign(new Error('spawn EACCES'), { code: 'EACCES' });
  const fixture = coreFixture({ running: false, spawnError: error });
  await assert.rejects(fixture.core.startConfiguredCore(), (received) => received === error);
  assert.equal(fixture.counts().spawns, 1);
  assert.equal(fixture.counts().probes, 0);
});

test('shutdown never sends system/stop to an API port owned by another process', async () => {
  const fixture = coreFixture({ apiOwned: false });
  assert.equal((await fixture.core.stopEmbeddedCore()).stopped, true);
  assert.equal(fixture.counts().rpcStops, 0);
  assert.deepEqual(fixture.signals, [[1234, 'SIGTERM']]);
});

test('a connected Core shutdown RPC cannot switch to a replacement listener', async (t) => {
  let originalRequests = 0;
  let replacementRequests = 0;
  const original = http.createServer((_request, response) => {
    originalRequests++;
    response.end(JSON.stringify({ result: true }));
  });
  let replacement;
  const closeServer = (server) => new Promise((resolve) => {
    if (!server?.listening) return resolve();
    server.close(resolve);
    server.closeAllConnections();
  });
  t.after(async () => {
    await Promise.all([closeServer(original), closeServer(replacement)]);
  });
  original.listen(0, '127.0.0.1');
  await once(original, 'listening');
  const port = original.address().port;
  const rpc = coreRpcFixture();
  const connected = once(original, 'connection');
  const result = await rpc.callCoreRpcOnConnectedSocket({
    endpoint: 'system/stop',
    config: { ...rpc.config, apiPort: String(port) },
    timeout: 2000,
    assertConnection: async () => {
      await connected;
      original.close();
      replacement = http.createServer((_request, response) => {
        replacementRequests++;
        response.end(JSON.stringify({ result: true }));
      });
      replacement.listen(port, '127.0.0.1');
      await once(replacement, 'listening');
    },
  });
  assert.equal(result, true);
  assert.equal(originalRequests, 1);
  assert.equal(replacementRequests, 0);
});

test('shutdown preserves the normal graceful API stop when port ownership is confirmed', async () => {
  const fixture = coreFixture({ apiOwned: true });
  assert.equal((await fixture.core.stopEmbeddedCore()).reason, 'graceful');
  assert.equal(fixture.counts().rpcStops, 1);
  assert.deepEqual(fixture.signals, []);
});

test('Linux API ownership matches live listener socket inodes to the selected PID', {
  skip: process.platform !== 'linux',
}, async (t) => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const config = { ...configuration, apiPort: String(server.address().port) };
  assert.equal(await isCoreApiOwnedByProcess(config, process.pid), true);
  assert.equal(await isCoreApiOwnedByProcess(config, process.ppid), false);
  assert.equal(await isCoreApiOwnedByProcess({ ...config, ip: '192.0.2.1' }, process.pid), false);
});

for (const platform of ['darwin', 'win32']) {
  test(`${platform} API ownership rejects another Core on the configured port`, async () => {
    let owner = 4321;
    const execute = () => {};
    execute[promisify.custom] = async () => ({
      stdout: platform === 'darwin'
        ? `p${owner}\nf5\nn127.0.0.1:8080\n`
        : JSON.stringify([{ LocalAddress: '127.0.0.1', OwningProcess: owner }]),
    });
    const policy = loadModule('src/main/coreApiOwnership.js', {
      child_process: { execFile: execute },
    }, { process: { platform, env: {} } });
    assert.equal(await policy.isCoreApiOwnedByProcess(configuration, 1234), false);
    owner = 1234;
    assert.equal(await policy.isCoreApiOwnedByProcess(configuration, 1234), true);
  });
}

function updaterFixture(platform = process.platform) {
  const updater = new EventEmitter();
  const native = new EventEmitter();
  const module = loadModule('src/main/updater.js', {
    electron: { autoUpdater: native },
    'electron-updater': { autoUpdater: updater },
    'electron-log': {},
    './paths': { assetsParentDir: '/assets' },
  }, { APP_VERSION: '3.2.0-beta.3', process: { platform, env: {} } });
  return { ...module, updater, native };
}

function coreRpcFixture() {
  const config = {
    ip: '127.0.0.1',
    apiSSL: false,
    apiPort: '8080',
    apiPortSSL: '8443',
    apiUser: '',
    apiPassword: '',
  };
  const rpc = loadModule('src/main/coreRpc.js', {
    './settings': { loadSettingsFromFile: () => ({ manualDaemon: true }) },
    './ipc/coreTransport': {
      getCoreTransportOptions: () => ({ apiSSL: false, rejectUnauthorized: true }),
      validateCoreRpcPath: (value) => value,
    },
    './ipc/coreRpcRegistry': { redactSensitiveText: (value) => value },
    './ipc/configOwner': {
      createConfigOwner: () => ({ invalidate() {}, get: async () => config }),
    },
    './ipc/coreConf': {
      fromKeyValues: () => ({}),
      parseBooleanFlag: () => false,
      resolveEmbeddedCoreConnection: () => ({ connection: config }),
      updateKeyValues: () => '',
    },
  });
  return { ...rpc, config };
}

test('prerelease updates keep automatic downloads enabled', () => {
  const fixture = updaterFixture();
  fixture.initializeUpdater({ allowPrerelease: false });
  assert.equal(fixture.updater.autoDownload, true);
  assert.equal(fixture.updater.allowPrerelease, true);
  assert.equal(fixture.updater.channel, 'beta');
  assert.equal(fixture.updater.allowDowngrade, false);
});

for (const [platform, expectedSource, unexpectedSource] of [
  ['darwin', 'native', 'updater'],
  ['win32', 'updater', 'native'],
  ['linux', 'updater', 'native'],
]) {
  test(`${platform} installation waits for its updater readiness event`, async () => {
    const fixture = updaterFixture(platform);
    let ready = false;
    fixture.updater.quitAndInstall = () => {};
    const installation = fixture.installUpdate(() => { ready = true; });
    await Promise.resolve();
    assert.equal(ready, false);
    fixture[unexpectedSource].emit('before-quit-for-update');
    assert.equal(ready, false);
    fixture[expectedSource].emit('before-quit-for-update');
    await installation;
    assert.equal(ready, true);
    assert.equal(fixture.native.listenerCount('before-quit-for-update'), 0);
    assert.equal(fixture.updater.listenerCount('before-quit-for-update'), 0);
    assert.equal(fixture.updater.listenerCount('error'), 0);
  });
}

test('installation surfaces synchronous and asynchronous installer errors and removes listeners', async () => {
  for (const [platform, source] of [['darwin', 'native'], ['win32', 'updater']]) {
    for (const synchronous of [true, false]) {
      const fixture = updaterFixture(platform);
      const error = new Error('installer failed');
      fixture.updater.quitAndInstall = () => {
        if (synchronous) throw error;
        queueMicrotask(() => fixture.updater.emit('error', error));
      };
      await assert.rejects(
        fixture.installUpdate(() => assert.fail('must not quit')),
        /installer failed/
      );
      assert.equal(fixture[source].listenerCount('before-quit-for-update'), 0);
      assert.equal(fixture.updater.listenerCount('error'), 0);
    }
  }
});

test('installer failure restores an embedded Core that was stopped for the update', async () => {
  const fixture = updaterFixture();
  const events = [];
  const installerError = new Error('installer failed');
  await assert.rejects(
    fixture.installUpdateWithCoreRecovery(
      true,
      async () => events.push('stop-core'),
      async () => {
        events.push('install');
        throw installerError;
      },
      async () => events.push('restart-core')
    ),
    (error) => error === installerError
  );
  assert.deepEqual(events, ['stop-core', 'install', 'restart-core']);
});

test('failed update shutdown restores the renderer instead of leaving its closing overlay', async () => {
  const values = new Map();
  const dialogs = [];
  const updater = loadModule('src/shared/lib/updater/index.tsx', {
    'lib/store': { store: { set: (key, value) => values.set(key, value) } },
    'lib/ui': {},
    'lib/settings': {},
    './AutoUpdateBackgroundTask': {},
    'lib/wallet': { walletClosingAtom: 'closing' },
    'lib/coreInfo': { coreInfoPausedAtom: 'paused' },
    'lib/modules': {},
    'lib/dialog': { openErrorDialog: (dialog) => dialogs.push(dialog) },
  }, {
    window: { nexusElectron: { updater: { quitAndInstall: async () => { throw new Error('Core still running'); } } } },
  });
  await updater.quitAndInstall();
  assert.equal(values.get('closing'), false);
  assert.equal(values.get('paused'), false);
  assert.equal(dialogs[0].note, 'Core still running');
});

async function remoteCoreFixture(t, multiuser, terminateError) {
  const terminations = [];
  const server = http.createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk;
    let result;
    let error;
    if (request.url === '/system/get/info') result = { multiuser };
    if (request.url === '/sessions/list/local') result = [{ session: 'one' }, { session: 'two' }];
    if (request.url === '/sessions/terminate/local') {
      terminations.push(body ? JSON.parse(body) : undefined);
      error = terminateError;
      result = { success: true };
    }
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(error ? { error } : { result }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const settings = {
    manualDaemon: true, manualDaemonLogOutOnClose: true,
    manualDaemonApiSSL: false, manualDaemonApiPort: String(server.address().port),
  };
  const rpc = loadModule('src/main/coreRpc.js', {
    './settings': { loadSettingsFromFile: () => settings },
  });
  return { rpc, terminations, settings };
}

test('main-process quit cleanup ends remote sessions in single- and multi-user modes', async (t) => {
  for (const multiuser of [false, true]) {
    const fixture = await remoteCoreFixture(t, multiuser);
    await fixture.rpc.terminateRemoteSessionsOnQuit();
    assert.deepEqual(fixture.terminations, multiuser
      ? [{ session: 'one' }, { session: 'two' }]
      : [undefined]);
    fixture.settings.manualDaemonLogOutOnClose = false;
    await fixture.rpc.terminateRemoteSessionsOnQuit();
    assert.equal(fixture.terminations.length, multiuser ? 2 : 1);
  }
});

test('remote logout accepts no-session responses but propagates authentication failures', async (t) => {
  const loggedOut = await remoteCoreFixture(t, false, { code: -11, message: 'Session not found' });
  await loggedOut.rpc.terminateRemoteSessionsOnQuit();
  const rejected = await remoteCoreFixture(t, true, { code: -333, message: 'Authentication failed' });
  await assert.rejects(rejected.rpc.terminateRemoteSessionsOnQuit(), /Authentication failed/);
});
