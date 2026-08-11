'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  assertAdvancedCoreParams,
  assertAbsoluteFilesystemPath,
  assertExternalUrl,
  assertRelativeModulePath,
  validateClipboardText,
  validateCoreRpcRequest,
  validateCoreRpcUrl,
  validateModuleDownloadRequest,
  validateNoArguments,
  validateSettingsUpdate,
  validateTrackEventRequest,
} = require('../../src/main/ipc/contracts');

test('external URLs require an allowlisted HTTPS host', () => {
  assert.equal(
    assertExternalUrl('https://github.com/NamecoinGithub/NexusInterface'),
    'https://github.com/NamecoinGithub/NexusInterface'
  );
  assert.equal(
    assertExternalUrl('mailto:security@nexus.io', 'Contact URL', {
      mailto: true,
    }),
    'mailto:security@nexus.io'
  );

  for (const value of [
    'http://github.com/Nexus',
    'https://github.com.evil.example/Nexus',
    'https://github.com@evil.example/Nexus',
    'javascript:alert(1)',
    'file:///etc/passwd',
  ]) {
    assert.throws(() => assertExternalUrl(value), TypeError);
  }
});

test('module paths reject traversal and platform-specific absolute paths', () => {
  assert.equal(assertRelativeModulePath('assets/icon.svg'), 'assets/icon.svg');
  for (const value of [
    '../secret',
    'assets/../../secret',
    '/etc/passwd',
    '\\\\server\\share',
    'C:\\Windows\\system32',
    'assets/\0icon.svg',
  ]) {
    assert.throws(() => assertRelativeModulePath(value), TypeError);
  }
});

test('IPC request validators reject malformed and unexpected requests', () => {
  assert.deepEqual(
    validateCoreRpcRequest({ endpoint: 'system/stop', params: {} }),
    { endpoint: 'system/stop', params: {} }
  );
  assert.deepEqual(
    validateModuleDownloadRequest({
      moduleName: 'wallet_tools',
      owner: 'NamecoinGithub',
      repo: 'NexusInterface',
      releaseId: 'latest',
    }),
    {
      moduleName: 'wallet_tools',
      owner: 'NamecoinGithub',
      repo: 'NexusInterface',
      releaseId: 'latest',
    }
  );

  for (const request of [
    { endpoint: '../system/stop' },
    { endpoint: 'system//stop' },
    { endpoint: 'System/stop' },
    { endpoint: 'system/stop', params: [] },
    { endpoint: 'evil/get/info' },
    { endpoint: 'shell/exec' },
  ]) {
    assert.throws(() => validateCoreRpcRequest(request), TypeError);
  }
  assert.throws(
    () =>
      validateModuleDownloadRequest({
        moduleName: '../wallet',
        owner: 'owner',
        repo: 'repo',
        releaseId: 1,
      }),
    TypeError
  );
  assert.equal(validateNoArguments(undefined), undefined);
  assert.throws(() => validateNoArguments({}), TypeError);
});

test('Core RPC URL validation enforces relative paths and namespaces', () => {
  assert.equal(validateCoreRpcUrl('system/get/info'), 'system/get/info');
  assert.equal(validateCoreRpcUrl('/finance/list/any'), 'finance/list/any');
  assert.equal(
    validateCoreRpcUrl('finance/get/any?name=default'),
    'finance/get/any?name=default'
  );
  assert.equal(
    validateCoreRpcUrl('names/get/name/user:alice'),
    'names/get/name/user:alice'
  );

  for (const value of [
    'http://127.0.0.1/system/get/info',
    '../system/get/info',
    'system/../../etc/passwd',
    'evil/get/info',
    'System/get/info',
    'system/get/info#frag',
    'system/get/info?redirect=https://evil.example',
    '',
  ]) {
    assert.throws(() => validateCoreRpcUrl(value), TypeError);
  }
});

test('settings updates reject dangerous Core overrides and relative paths', () => {
  assert.deepEqual(
    validateSettingsUpdate({
      locale: 'en',
      allowAdvancedCoreOptions: true,
      advancedCoreParams: '-verbose=4 -llpallowip=1.2.3.4',
    }),
    {
      locale: 'en',
      allowAdvancedCoreOptions: true,
      advancedCoreParams: '-verbose=4 -llpallowip=1.2.3.4',
    }
  );

  // Positive case must use a host-platform absolute path: POSIX absolute paths
  // are intentionally rejected on Windows by assertAbsoluteFilesystemPath.
  const absoluteCoreDataDir =
    process.platform === 'win32'
      ? 'C:\\Users\\user\\.Nexus'
      : '/home/user/.Nexus';
  assert.equal(
    assertAbsoluteFilesystemPath(absoluteCoreDataDir, 'coreDataDir'),
    absoluteCoreDataDir
  );
  assert.equal(
    assertAdvancedCoreParams('-mining=1 -stake=1'),
    '-mining=1 -stake=1'
  );

  for (const updates of [
    { coreDataDir: 'relative/path' },
    { coreDataDir: '../.Nexus' },
    { coreDataDir: '~/.Nexus' },
    { coreDataDir: '~' },
    { backupDirectory: 'backups' },
    { backupDirectory: '~/NexusBackups' },
    { advancedCoreParams: '-datadir=/tmp/pwn' },
    { advancedCoreParams: '-apiuser=evil -apipassword=secret' },
    { advancedCoreParams: '-conf=/tmp/evil.conf' },
    { advancedCoreParams: '-walletclean' },
    { advancedCoreParams: '-testnet=1' },
    { advancedCoreParams: '-private=1' },
    { advancedCoreParams: '-connect=evil.example' },
    { advancedCoreParams: '-nodns=0' },
    { advancedCoreParams: '-noapiauth' },
    { advancedCoreParams: '-noapiauth=1' },
    { advancedCoreParams: '-revertblocks=10' },
    { advancedCoreParams: 'not-a-flag' },
    { advancedCoreParams: '-verbose=1; rm -rf /' },
    { allowAdvancedCoreOptions: 'yes' },
    { walletClean: 1 },
    { revertBlocks: -1 },
    { embeddedCoreBinaryPath: 'nexus' },
  ]) {
    assert.throws(() => validateSettingsUpdate(updates), TypeError);
  }

  // Foreign absolute syntax must not pass on the host platform.
  if (process.platform === 'win32') {
    assert.throws(
      () => assertAbsoluteFilesystemPath('/home/user/.Nexus', 'coreDataDir'),
      TypeError
    );
    // coreDataDir must reject UNC/SMB and device namespaces (credential write target).
    for (const unc of [
      '\\\\server\\share\\NexusData',
      '//server/share/NexusData',
      '\\\\.\\C:\\NexusData',
      '\\\\?\\C:\\NexusData',
      '\\\\?\\UNC\\server\\share\\NexusData',
    ]) {
      assert.throws(
        () => assertAbsoluteFilesystemPath(unc, 'coreDataDir'),
        TypeError
      );
      assert.throws(
        () => validateSettingsUpdate({ coreDataDir: unc }),
        TypeError
      );
    }
    // backupDirectory may accept UNC shares (network backups) but not devices.
    assert.equal(
      assertAbsoluteFilesystemPath('\\\\server\\share\\Backups', 'backupDirectory', {
        allowUnc: true,
      }),
      '\\\\server\\share\\Backups'
    );
    assert.deepEqual(
      validateSettingsUpdate({ backupDirectory: '\\\\server\\share\\Backups' }),
      { backupDirectory: '\\\\server\\share\\Backups' }
    );
    assert.throws(
      () =>
        assertAbsoluteFilesystemPath('\\\\.\\C:\\Backups', 'backupDirectory', {
          allowUnc: true,
        }),
      TypeError
    );
  } else {
    assert.throws(
      () => assertAbsoluteFilesystemPath('C:\\NexusData', 'coreDataDir'),
      TypeError
    );
    assert.throws(
      () => assertAbsoluteFilesystemPath('\\\\server\\share\\data', 'coreDataDir'),
      TypeError
    );
  }
});

test('clipboard and analytics validators enforce bounds', () => {
  assert.equal(validateClipboardText('address'), 'address');
  assert.throws(() => validateClipboardText('x'.repeat(1000001)), TypeError);

  assert.deepEqual(validateTrackEventRequest({ eventName: 'login' }), {
    eventName: 'login',
    props: undefined,
  });
  assert.deepEqual(
    validateTrackEventRequest({
      eventName: 'send',
      props: { amount: 1, token: 'NXS' },
    }),
    { eventName: 'send', props: { amount: 1, token: 'NXS' } }
  );
  for (const request of [
    { eventName: '' },
    { eventName: 'bad name' },
    { eventName: 'login', props: [] },
    {
      eventName: 'login',
      props: Object.fromEntries(
        Array.from({ length: 17 }, (_, index) => [`k${index}`, index])
      ),
    },
  ]) {
    assert.throws(() => validateTrackEventRequest(request), TypeError);
  }
});
