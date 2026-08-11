'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const read = (...segments) =>
  fs.readFileSync(path.join(root, ...segments), 'utf8');

const {
  API_VERSION,
  CAPABILITIES,
  DEFAULT_CAPABILITIES,
  ERROR_CODES,
  METHODS,
  normalizeManifestCapabilities,
  sanitizeWalletContext,
  validateInvokeRequest,
  validateModuleOpenUrl,
  validateSendDraft,
} = require('../../src/main/ipc/moduleApiV2');

test('NEXUS v2 contract exports a frozen method/capability map', () => {
  assert.equal(API_VERSION, 2);
  assert.ok(DEFAULT_CAPABILITIES.includes(CAPABILITIES.WALLET_CONTEXT));
  assert.ok(DEFAULT_CAPABILITIES.includes(CAPABILITIES.WALLET_REQUEST_SEND));
  assert.equal(
    DEFAULT_CAPABILITIES.includes(CAPABILITIES.LEGACY_API),
    false
  );
  assert.equal(METHODS.WALLET_GET_CONTEXT, 'wallet.getContext');
});

test('invoke validation accepts only documented methods and plain payloads', () => {
  const notify = validateInvokeRequest({
    method: 'ui.notify',
    payload: { content: 'hi', type: 'info' },
  });
  assert.equal(notify.method, 'ui.notify');
  assert.equal(notify.payload.content, 'hi');

  assert.throws(
    () => validateInvokeRequest({ method: 'utilities.apiCall', payload: {} }),
    (error) => error.code === ERROR_CODES.UNKNOWN_METHOD
  );

  assert.throws(
    () =>
      validateInvokeRequest({
        method: 'ui.notify',
        payload: { content: 'x', evil: true },
      }),
    TypeError
  );
});

test('external URL policy allows http(s)/mailto and blocks dangerous schemes', () => {
  assert.equal(
    validateModuleOpenUrl('https://nexus.io/docs'),
    'https://nexus.io/docs'
  );
  assert.equal(
    validateModuleOpenUrl('http://example.com/path'),
    'http://example.com/path'
  );
  assert.equal(
    validateModuleOpenUrl('mailto:security@nexus.io'),
    'mailto:security@nexus.io'
  );

  for (const value of [
    'file:///etc/passwd',
    'javascript:alert(1)',
    'data:text/html,hi',
    'ftp://example.com',
    '/relative',
  ]) {
    assert.throws(() => validateModuleOpenUrl(value), TypeError);
  }
});

test('send drafts require recipients and reject unknown fields', () => {
  const draft = validateSendDraft({
    recipients: [{ address: 'abc', amount: '1' }],
  });
  assert.equal(draft.recipients[0].address, 'abc');

  assert.throws(
    () => validateSendDraft({ recipients: [{ address: 'a', pin: '1234' }] }),
    TypeError
  );
  assert.throws(() => validateSendDraft({ recipients: [] }), TypeError);
});

test('manifest capabilities default safely and reject production legacy.api', () => {
  assert.deepEqual(
    normalizeManifestCapabilities(undefined),
    [...DEFAULT_CAPABILITIES]
  );
  assert.throws(
    () => normalizeManifestCapabilities(['legacy.api'], { development: false }),
    TypeError
  );
  assert.deepEqual(
    normalizeManifestCapabilities(['legacy.api', 'storage'], {
      development: true,
    }),
    ['legacy.api', 'storage']
  );
  assert.throws(
    () => normalizeManifestCapabilities(['wallet.destroyWorld']),
    TypeError
  );
});

test('wallet context sanitizer strips address book and secrets', () => {
  const sanitized = sanitizeWalletContext({
    walletVersion: '3.2.0-beta.2',
    theme: { primary: '#0f0' },
    settings: {
      locale: 'en',
      fiatCurrency: 'USD',
      addressStyle: 'segwit',
      manualDaemonApiPassword: 'secret',
    },
    coreInfo: { connections: 8, synchronized: true, version: '5.1' },
    userStatus: { session: 'sess-1', genesis: 'g' },
    addressBook: { Alice: 'nx1...' },
    moduleState: { tab: 1 },
    storageData: { k: 'v' },
  });

  assert.equal(sanitized.apiVersion, 2);
  assert.equal(sanitized.settings.locale, 'en');
  assert.equal(sanitized.core.connections, 8);
  assert.equal(sanitized.session.loggedIn, true);
  assert.equal('addressBook' in sanitized, false);
  assert.equal(sanitized.settings.manualDaemonApiPassword, undefined);
  assert.deepEqual(sanitized.moduleState, { tab: 1 });
});

test('module webview hardening enforces isolation preferences', () => {
  const security = read('src', 'main', 'webviewSecurity.js');
  const broker = read('src', 'main', 'moduleBroker.js');
  assert.match(security, /contextIsolation\s*=\s*true/);
  assert.match(security, /nodeIntegration\s*=\s*false/);
  assert.match(security, /sandbox\s*=\s*true/);
  assert.doesNotMatch(security, /NEXUS_DISABLE_MODULE_SANDBOX/);
  assert.match(security, /loadModuleGuestIdentity/);
  assert.match(security, /registerModuleGuest/);
  assert.match(security, /setWindowOpenHandler/);
  assert.match(security, /setPermissionRequestHandler/);
  assert.doesNotMatch(security, /contextIsolation\s*=\s*false/);
  // Guest identity is loaded during entry authorization; registration is sync.
  assert.match(broker, /export async function loadModuleGuestIdentity/);
  assert.match(broker, /export function registerModuleGuest/);
  assert.doesNotMatch(broker, /export async function registerModuleGuest/);
  // Policies must be bound to the guest session, not a global FIFO queue.
  assert.match(security, /pendingPoliciesBySession/);
  assert.match(security, /session\.fromPartition/);
  assert.match(security, /webPreferences\.partition/);
  assert.doesNotMatch(security, /pendingPolicies\.shift\(/);
  assert.doesNotMatch(security, /pendingPolicies\.push\(/);
});

test('module preload is a minimal contextBridge surface without React or ipc leaks', () => {
  const bridge = read('src', 'module', 'preload', 'bridge.ts');
  const index = read('src', 'module', 'preload', 'index.ts');
  const webpack = read('configs', 'webpack.config.base.preload.babel.js');

  assert.match(bridge, /contextBridge\.exposeInMainWorld\(\s*['"]NEXUS['"]/);
  assert.match(bridge, /module-api:invoke/);
  assert.doesNotMatch(bridge, /from ['"]react['"]/);
  assert.doesNotMatch(bridge, /from ['"]@emotion\//);
  assert.doesNotMatch(bridge, /global\.NEXUS\s*=/);
  assert.doesNotMatch(index, /from ['"]react['"]/);
  assert.match(webpack, /electron-preload/);
  assert.match(webpack, /src\/module\/preload\/index\.ts/);
});

test('host module relay rejects generic privileged legacy channels', () => {
  const host = read('src', 'shared', 'lib', 'modules', 'webview.tsx');
  assert.match(host, /api-call/);
  assert.match(host, /secure-api-call/);
  assert.match(host, /Rejected privileged legacy module channel/);
  assert.doesNotMatch(host, /case 'api-call':\s*\n\s*apiCall/);
  assert.doesNotMatch(host, /callAPI\(/);
  assert.doesNotMatch(host, /confirmPin/);
  assert.doesNotMatch(host, /addressBookAtom/);
});

test('host context push fails closed without renderer fallback to guest', () => {
  const host = read('src', 'shared', 'lib', 'modules', 'webview.tsx');
  assert.match(host, /pushModuleContext/);
  // Unsanitized coreInfo/userStatus must never be sent directly to the guest.
  assert.doesNotMatch(host, /active\.send\(\s*['"]module-api:context-changed['"]/);
  assert.match(host, /Fail closed/);
});

test('proxyRequest remains disabled for modules', () => {
  const modules = read('src', 'main', 'modules.js');
  assert.match(modules, /proxyRequest is disabled/);
  assert.doesNotMatch(
    modules,
    /export async function proxyRequest\([\s\S]*axios\(/
  );
});

test('file server uses per-module allowlists and security headers', () => {
  const server = read('src', 'main', 'fileServer.js');
  assert.match(server, /Content-Security-Policy/);
  assert.match(server, /authorizedAssets/);
  assert.match(server, /assertRelativeModulePath/);
  assert.match(server, /assertSafeModuleName/);
  assert.match(server, /resolveAssetAbsolute/);
  assert.match(server, /realpathSync/);
  assert.match(server, /isRateLimited/);
  assert.match(server, /RATE_LIMIT_MAX/);
  // Must not bind all interfaces; module assets are local-only.
  assert.match(server, /listen\(\s*0\s*,\s*['"]127\.0\.0\.1['"]/);
  assert.match(server, /http:\/\/127\.0\.0\.1:\$\{port\}/);
  assert.doesNotMatch(server, /express\.static\(modulesDir\)/);
});

test('module directory install copies files without following symlinks', () => {
  const modules = read('src', 'main', 'modules.js');
  const safeCopy = read('src', 'main', 'ipc', 'safeCopy.js');
  assert.match(modules, /installModuleDirectory/);
  assert.match(safeCopy, /readRegularFileNoFollow/);
  assert.match(safeCopy, /O_NOFOLLOW/);
  assert.match(safeCopy, /flag:\s*['"]wx['"]/);
  assert.match(safeCopy, /proc\/self\/fd/);
  assert.match(safeCopy, /\/dev\/fd/);
  assert.match(safeCopy, /assertNoSymlinkComponents/);
  assert.match(safeCopy, /supportsFdRelativeOpen|directoryFdPath/);
  assert.match(safeCopy, /COPY_CONCURRENCY\s*=\s*1/);
  assert.match(safeCopy, /new Set\(/);
  assert.match(safeCopy, /trustedSource/);
  assert.match(safeCopy, /readFileHandleBounded/);
  assert.match(
    safeCopy,
    /descriptor-relative opens on this platform/
  );
  assert.doesNotMatch(safeCopy, /materializeAppOwnedSourceSnapshot/);
  assert.match(
    modules,
    /package the module as a \.zip archive/
  );
  assert.doesNotMatch(
    modules,
    /const copyOne = \(file\) => fsp\.copyFile/
  );
});

test('documentation and fixtures for isolation exist', () => {
  for (const rel of [
    'docs/security/module-webview-isolation.md',
    'docs/Modules/nexus-v2-migration.md',
    'docs/security/module-webview-isolation-report.md',
    'fixtures/modules/nexus-v2-smoke/nxs_package.json',
    'fixtures/modules/nexus-v2-smoke/app.js',
    'fixtures/modules/malicious-isolation-probe/probe.js',
    'src/shared/modules/nexusApiV2.ts',
    'src/main/moduleBroker.js',
  ]) {
    assert.ok(
      fs.existsSync(path.join(root, rel)),
      `missing ${rel}`
    );
  }

  const smoke = JSON.parse(
    read('fixtures', 'modules', 'nexus-v2-smoke', 'nxs_package.json')
  );
  assert.ok(Array.isArray(smoke.capabilities));
  assert.ok(smoke.capabilities.includes('wallet.requestSend'));

  const probe = read(
    'fixtures',
    'modules',
    'malicious-isolation-probe',
    'probe.js'
  );
  assert.match(probe, /typeof require/);
  assert.match(probe, /file:\/\/\/etc\/passwd/);
});

test('WebView renderer no longer imports fs/path/process for launch', () => {
  const webview = read('src', 'App', 'Modules', 'WebView.tsx');
  assert.match(webview, /contextIsolation=yes/);
  assert.match(webview, /nodeIntegration=no/);
  assert.match(webview, /nexusElectron\.modules\.getEntry/);
  assert.doesNotMatch(webview, /\bfs\b/);
  assert.doesNotMatch(webview, /from ['"]path['"]/);
  assert.doesNotMatch(webview, /process\.cwd/);
  assert.doesNotMatch(webview, /contextIsolation=no/);
});
