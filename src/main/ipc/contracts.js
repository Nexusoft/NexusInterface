'use strict';

/**
 * This is the single source of truth for IPC operation names and request
 * validation. It intentionally contains no Electron or Node privileged APIs so
 * it can be imported by the main process, preload, and contract tests.
 */

const CHANNELS = Object.freeze({
  paths: Object.freeze({
    getBootstrap: 'paths:get-bootstrap',
  }),
  settings: Object.freeze({
    getInitial: 'settings:get-initial',
    update: 'settings:update',
    getAddressBook: 'settings:get-address-book',
    saveAddressBook: 'settings:save-address-book',
  }),
  theme: Object.freeze({
    getInitial: 'theme:get-initial',
    update: 'theme:update',
    selectWallpaper: 'theme:select-wallpaper',
    importFromDialog: 'theme:import-from-dialog',
    exportToDialog: 'theme:export-to-dialog',
  }),
  dialogs: Object.freeze({
    selectBackupDirectory: 'dialogs:select-backup-directory',
    selectCoreBinary: 'dialogs:select-core-binary',
    selectModuleArchive: 'dialogs:select-module-archive',
    selectModuleDirectory: 'dialogs:select-module-directory',
    selectDevModuleDirectory: 'dialogs:select-dev-module-directory',
  }),
  core: Object.freeze({
    getStatus: 'core:get-status',
    getConfiguration: 'core:get-configuration',
    start: 'core:start',
    kill: 'core:kill',
    resyncLiteDatabase: 'core:resync-lite-database',
    executeConsoleCommand: 'core:execute-console-command',
    subscribeOutput: 'core:subscribe-output',
    unsubscribeOutput: 'core:unsubscribe-output',
  }),
  coreRpc: Object.freeze({
    call: 'core-rpc:call',
    callByUrl: 'core-rpc:call-by-url',
  }),
  bootstrap: Object.freeze({
    start: 'bootstrap:start',
    abort: 'bootstrap:abort',
  }),
  modules: Object.freeze({
    list: 'modules:list',
    inspectInstallSource: 'modules:inspect-install-source',
    install: 'modules:install',
    addDevelopment: 'modules:add-development',
    remove: 'modules:remove',
    downloadAndInstall: 'modules:download-and-install',
    abortDownload: 'modules:abort-download',
    prepareFiles: 'modules:prepare-files',
    getEntry: 'modules:get-entry',
    readStorage: 'modules:read-storage',
    writeStorage: 'modules:write-storage',
    getFeatured: 'modules:get-featured',
    checkUpdates: 'modules:check-updates',
    openFailureLocation: 'modules:open-failure-location',
    pushModuleContext: 'modules:push-module-context',
  }),
  updater: Object.freeze({
    check: 'updater:check',
    quitAndInstall: 'updater:quit-and-install',
    setAllowPrerelease: 'updater:set-allow-prerelease',
    migrateToMainnet: 'updater:migrate-to-mainnet',
    getMarketData: 'updater:get-market-data',
  }),
  fileAssets: Object.freeze({
    readModuleIcon: 'file-assets:read-module-icon',
    fetchExternalIcon: 'file-assets:fetch-external-icon',
    loadRecoveryWords: 'file-assets:load-recovery-words',
    lookupGeoIp: 'file-assets:lookup-geo-ip',
    lookupPublicGeoIp: 'file-assets:lookup-public-geo-ip',
    loadTranslation: 'file-assets:load-translation',
  }),
  app: Object.freeze({
    isForceQuit: 'app:is-force-quit',
    quit: 'app:quit',
    exit: 'app:exit',
    hideWindow: 'app:hide-window',
    hideDock: 'app:hide-dock',
    setOpenOnStart: 'app:set-open-on-start',
    popupContextMenu: 'app:popup-context-menu',
    setMenu: 'app:set-menu',
    openVirtualKeyboard: 'app:open-virtual-keyboard',
    openExternal: 'app:open-external',
    openManagedPath: 'app:open-managed-path',
    writeClipboard: 'app:write-clipboard',
    trackEvent: 'app:track-event',
  }),
});

const EVENTS = Object.freeze({
  bootstrapStatus: 'bootstrap:status',
  coreOutput: 'core:output',
  modules: Object.freeze({
    downloadProgress: 'modules:download-progress',
  }),
  windowClose: 'window-close',
  usageTrackingError: 'usage-tracking-error-relay',
  keyboardInputChange: 'keyboard-input-change',
  keyboardClosed: 'keyboard-closed',
  updater: Object.freeze({
    error: 'updater:error',
    checking: 'updater:checking-for-update',
    available: 'updater:update-available',
    unavailable: 'updater:update-not-available',
    downloadProgress: 'updater:download-progress',
    downloaded: 'updater:update-downloaded',
  }),
});

const ALLOWED_EXTERNAL_HOSTS = new Set([
  'api.dex-trade.com',
  'api.github.com',
  'bootstrap.nexus.io',
  'crypto.nexus.io',
  'github.com',
  'ipwho.is',
  'nexus-featured-modules.netlify.app',
  'nexus.io',
  'raw.githubusercontent.com',
  't.me',
]);

// First path segment of Core API endpoints the renderer/modules may request.
// Unknown namespaces are rejected even when the path shape is otherwise valid.
const ALLOWED_CORE_RPC_NAMESPACES = new Set([
  'assets',
  'finance',
  'ledger',
  'market',
  'names',
  'network',
  'objects',
  'profiles',
  'register',
  'sessions',
  'supply',
  'system',
  'tokens',
  'users',
]);

const MAX_CLIPBOARD_TEXT_LENGTH = 1000000;

const ALLOWED_THEME_FIELDS = new Set([
  'wallpaper',
  'background',
  'foreground',
  'primary',
  'primaryAccent',
  'danger',
  'dangerAccent',
  'globeColor',
  'globePillarColor',
  'globeArchColor',
  'wallpaperSize',
  'wallpaperBackgroundColor',
  'featuredTokenName',
]);

const ALLOWED_SETTINGS_FIELDS = new Set([
  'locale',
  'minimizeOnClose',
  'openOnStart',
  'autoUpdate',
  'allowPrerelease',
  'sendUsageData',
  'fiatCurrency',
  'minConfirmations',
  'backupDirectory',
  'devMode',
  'verifyModuleSource',
  'fakeTransactions',
  'overviewDisplay',
  'hideOverviewBalances',
  'displayFiatBalance',
  'liteMode',
  'safeMode',
  'enableMining',
  'enableStaking',
  'pooledStaking',
  'multiUser',
  'verboseLevel',
  'avatarMode',
  'ipMineWhitelist',
  'coreDataDir',
  'embeddedCoreBinaryPath',
  'testnetIteration',
  'privateTestnet',
  'allowAdvancedCoreOptions',
  'advancedCoreParams',
  'manualDaemon',
  'manualDaemonIP',
  'manualDaemonApiSSL',
  'manualDaemonApiUser',
  'manualDaemonApiPassword',
  'manualDaemonApiIP',
  'manualDaemonApiPort',
  'manualDaemonApiPortSSL',
  'manualDaemonLogOutOnClose',
  'embeddedCoreUseNonSSL',
  'embeddedCoreApiPort',
  'embeddedCoreApiPortSSL',
  'renderGlobe',
  'addressStyle',
  'disabledModules',
  'allowSymLink',
  'devModulePaths',
  'showUnusedNames',
  'acceptedAgreement',
  'bootstrapSuggestionDisabled',
  'liteModeNoticeDisabled',
  'revertBlocks',
  'walletClean',
  'clearPeers',
  'coreAPIPolicy',
  'firstCreateNewUserShown',
  'consoleCliSyntax',
  'dontAskToStartStaking',
  'lastCheckForUpdates',
]);

function fail(message) {
  throw new TypeError(message);
}

function assertRecord(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${name} must be an object`);
  }
  return value;
}

function assertString(value, name, { min = 0, max = 4096 } = {}) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail(`${name} must be a string between ${min} and ${max} characters`);
  }
  return value;
}

function assertBoolean(value, name) {
  if (typeof value !== 'boolean') fail(`${name} must be a boolean`);
  return value;
}

function validateNoArguments(value, operationName = 'Operation') {
  if (value !== undefined) {
    fail(`${operationName} does not accept arguments`);
  }
  return undefined;
}

function assertSafeModuleName(value, name = 'Module name') {
  const moduleName = assertString(value, name, { min: 1, max: 80 });
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(moduleName)) {
    fail(`${name} contains unsupported characters`);
  }
  return moduleName;
}

function assertRelativeModulePath(value, name = 'Module file') {
  const relativePath = assertString(value, name, { min: 1, max: 1024 });
  if (
    relativePath.includes('\0') ||
    relativePath.startsWith('/') ||
    relativePath.startsWith('\\') ||
    /^[a-z]:/i.test(relativePath) ||
    relativePath.split(/[\\/]+/).includes('..')
  ) {
    fail(`${name} must be a relative module path`);
  }
  return relativePath;
}

function assertExternalUrl(value, name = 'URL', { mailto = false } = {}) {
  const rawUrl = assertString(value, name, { min: 1, max: 2048 });
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    fail(`${name} must be an absolute URL`);
  }

  if (mailto && parsed.protocol === 'mailto:') return parsed.toString();
  if (parsed.protocol !== 'https:') {
    fail(`${name} protocol is not allowed`);
  }
  if (!ALLOWED_EXTERNAL_HOSTS.has(parsed.hostname.toLowerCase())) {
    fail(`${name} host is not allowed`);
  }
  return parsed.toString();
}

/**
 * Flags that the wallet already manages or that would let a compromised
 * renderer override Core security boundaries if accepted via advanced params.
 */
const FORBIDDEN_ADVANCED_CORE_FLAGS = new Set([
  'datadir',
  'conf',
  'pid',
  'apiuser',
  'apipassword',
  'apiport',
  'apisslport',
  'apissl',
  'ssl',
  'daemon',
  'server',
  'walletclean',
  // Wallet-managed launch flags; advanced params are appended at spawn and must
  // not disable API auth or bypass the bounded revertBlocks setting.
  'noapiauth',
  'revertblocks',
  'rpcuser',
  'rpcpassword',
  'rpcport',
  // Network selection is wallet-managed (and locked in LOCK_TESTNET builds).
  // Advanced params are appended after fixed -connect/-nodns/-testnet/-private
  // arguments, so these must not be injectable from settings.
  'connect',
  'nodns',
  'testnet',
  'private',
]);

/**
 * Host-platform absolute path check. Intentionally does not treat foreign
 * syntax (e.g. `C:\...` or UNC on POSIX) as absolute, because Node would
 * resolve those as relative paths on the running OS.
 */
function isHostAbsoluteFilesystemPath(raw) {
  if (typeof process !== 'undefined' && process.platform === 'win32') {
    // Local drive paths and UNC. Device namespaces are filtered separately.
    return /^[a-zA-Z]:[\\/]/.test(raw) || /^[/\\]{2}/.test(raw);
  }
  return raw.startsWith('/');
}

function isWindowsDeviceNamespacePath(raw) {
  // \\.\pipe\..., \\?\C:\..., \\?\UNC\server\share, and //?/ forms.
  return /^[/\\]{2}[.?][/\\]/.test(raw);
}

function isWindowsUncPath(raw) {
  return /^[/\\]{2}/.test(raw) && !isWindowsDeviceNamespacePath(raw);
}

/**
 * Validate an absolute filesystem path for settings.
 *
 * @param {unknown} value
 * @param {string} name
 * @param {{ allowUnc?: boolean }} [options]
 *   When `allowUnc` is true (backup destinations only), Windows UNC share paths
 *   such as `\\server\share\dir` are accepted. `coreDataDir` and other paths
 *   that may receive generated credentials must keep `allowUnc` false so a
 *   compromised renderer cannot redirect writes onto an SMB share (NTLM/hash
 *   exposure). Device namespaces (`\\.\`, `\\?\`) are never accepted.
 */
function assertAbsoluteFilesystemPath(value, name, options = {}) {
  const allowUnc = options.allowUnc === true;
  const raw = assertString(value, name, { min: 1, max: 4096 });
  if (raw.includes('\0')) {
    fail(`${name} is invalid`);
  }
  // Settings persistence does not expand `~`; Core/bootstrap consume the value
  // directly, so home-relative shell syntax must be rejected here.
  if (raw === '~' || raw.startsWith('~/') || raw.startsWith('~\\')) {
    fail(`${name} must be an absolute path`);
  }
  if (!isHostAbsoluteFilesystemPath(raw)) {
    fail(`${name} must be an absolute path`);
  }
  if (typeof process !== 'undefined' && process.platform === 'win32') {
    if (isWindowsDeviceNamespacePath(raw)) {
      fail(`${name} must be a local absolute path`);
    }
    if (!allowUnc && isWindowsUncPath(raw)) {
      fail(`${name} must be a local absolute path`);
    }
  }
  if (raw.split(/[\\/]/).includes('..')) {
    fail(`${name} must not contain '..' segments`);
  }
  return raw;
}

function assertAdvancedCoreParams(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const raw = assertString(value, 'Advanced Core params', {
    min: 1,
    max: 2048,
  });
  if (/[\r\n\0;|&`$<>]/.test(raw)) {
    fail('Advanced Core params contain unsupported characters');
  }

  const parts = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    parts.push(match[1] ?? match[2] ?? match[3]);
  }
  if (!parts.length) {
    fail('Advanced Core params must contain at least one flag');
  }
  if (parts.length > 32) {
    fail('Advanced Core params exceed the maximum allowed flag count');
  }

  for (const part of parts) {
    if (!part.startsWith('-')) {
      fail('Advanced Core params must be dash flags');
    }
    const body = part.replace(/^-+/, '');
    const eq = body.indexOf('=');
    const name = (eq === -1 ? body : body.slice(0, eq)).toLowerCase();
    if (!name || !/^[a-z][a-z0-9_-]*$/i.test(name)) {
      fail('Advanced Core flag name is invalid');
    }
    if (FORBIDDEN_ADVANCED_CORE_FLAGS.has(name)) {
      fail(`Advanced Core flag -${name} is not allowed`);
    }
  }
  return raw;
}

function validateSettingsUpdate(value) {
  const updates = assertRecord(value, 'Settings update');
  const entries = Object.entries(updates);
  if (!entries.length || entries.length > 16) {
    fail('Settings update must contain between 1 and 16 fields');
  }
  const validated = {};
  for (const [key, fieldValue] of entries) {
    if (!ALLOWED_SETTINGS_FIELDS.has(key)) {
      fail(`Unsupported settings field: ${key}`);
    }
    if (
      fieldValue !== undefined &&
      fieldValue !== null &&
      !['string', 'number', 'boolean'].includes(typeof fieldValue) &&
      !Array.isArray(fieldValue)
    ) {
      fail(`Unsupported settings value for ${key}`);
    }
    if (typeof fieldValue === 'string' && fieldValue.length > 4096) {
      fail(`Settings value for ${key} is too long`);
    }
    if (
      key === 'manualDaemonIP' &&
      (typeof fieldValue !== 'string' ||
        !/^(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$|^\[[0-9a-fA-F:]+\]$|^[0-9a-fA-F:]+$/.test(
          fieldValue
        ))
    ) {
      fail('Manual daemon host is invalid');
    }
    if (
      ['manualDaemonApiPort', 'manualDaemonApiPortSSL', 'embeddedCoreApiPort', 'embeddedCoreApiPortSSL'].includes(
        key
      ) &&
      fieldValue !== undefined &&
      fieldValue !== '' &&
      (!/^\d{1,5}$/.test(String(fieldValue)) ||
        Number(fieldValue) < 1 ||
        Number(fieldValue) > 65535)
    ) {
      fail(`Settings port for ${key} is invalid`);
    }
    if (
      key === 'manualDaemonApiUser' &&
      (typeof fieldValue !== 'string' || fieldValue.length > 256)
    ) {
      fail('Manual daemon API user is invalid');
    }
    if (
      key === 'manualDaemonApiPassword' &&
      (typeof fieldValue !== 'string' || fieldValue.length > 1024)
    ) {
      fail('Manual daemon API password is invalid');
    }
    if (
      Array.isArray(fieldValue) &&
      (fieldValue.length > 100 ||
        fieldValue.some(
          (item) => typeof item !== 'string' || item.length > 1024
        ))
    ) {
      fail(`Settings array value for ${key} is invalid`);
    }
    if (
      [
        'allowAdvancedCoreOptions',
        'walletClean',
        'clearPeers',
        'manualDaemon',
        'manualDaemonApiSSL',
        'embeddedCoreUseNonSSL',
        'privateTestnet',
        'enableMining',
        'enableStaking',
        'pooledStaking',
        'multiUser',
        'liteMode',
        'safeMode',
        'avatarMode',
      ].includes(key)
    ) {
      assertBoolean(fieldValue, key);
    }
    if (key === 'advancedCoreParams') {
      validated[key] = assertAdvancedCoreParams(fieldValue);
      continue;
    }
    if (key === 'coreDataDir') {
      // Must stay local: loadEmbeddedConfig writes API credentials into
      // <coreDataDir>/nexus.conf. UNC/SMB targets would expose NTLM material.
      validated[key] = assertAbsoluteFilesystemPath(fieldValue, key, {
        allowUnc: false,
      });
      continue;
    }
    if (key === 'backupDirectory') {
      // Folder-dialog selected network backups may legitimately be UNC shares.
      validated[key] = assertAbsoluteFilesystemPath(fieldValue, key, {
        allowUnc: true,
      });
      continue;
    }
    if (key === 'embeddedCoreBinaryPath') {
      if (fieldValue === '' || fieldValue === undefined || fieldValue === null) {
        validated[key] = '';
        continue;
      }
      validated[key] = assertAbsoluteFilesystemPath(
        fieldValue,
        'embeddedCoreBinaryPath',
        { allowUnc: false }
      );
      continue;
    }
    if (key === 'revertBlocks') {
      const raw = fieldValue === '' || fieldValue === undefined ? 0 : fieldValue;
      const num = typeof raw === 'number' ? raw : Number(String(raw));
      if (!Number.isInteger(num) || num < 0 || num > 1_000_000) {
        fail('revertBlocks must be an integer between 0 and 1000000');
      }
      validated[key] = num;
      continue;
    }
    validated[key] = fieldValue;
  }
  return validated;
}

function validateThemeUpdate(value) {
  const updates = assertRecord(value, 'Theme update');
  const entries = Object.entries(updates);
  if (!entries.length || entries.length > ALLOWED_THEME_FIELDS.size) {
    fail('Theme update contains an invalid number of fields');
  }
  const validated = {};
  for (const [key, fieldValue] of entries) {
    if (!ALLOWED_THEME_FIELDS.has(key)) {
      fail(`Unsupported theme field: ${key}`);
    }
    if (typeof fieldValue !== 'string' || fieldValue.length > 2048) {
      fail(`Theme field ${key} must be a string of at most 2048 characters`);
    }
    validated[key] = fieldValue;
  }
  return validated;
}

function assertAllowedCoreRpcEndpoint(endpoint, name = 'Core RPC endpoint') {
  const value = assertString(endpoint, name, {
    min: 3,
    max: 96,
  });
  if (!/^[a-z]+(?:\/[a-z0-9_-]+){1,4}$/.test(value)) {
    fail(`${name} is invalid`);
  }
  const namespace = value.split('/')[0];
  if (!ALLOWED_CORE_RPC_NAMESPACES.has(namespace)) {
    fail(`${name} namespace is not allowed`);
  }
  return value;
}

function validateCoreRpcRequest(value) {
  const request = assertRecord(value, 'Core RPC request');
  const endpoint = assertAllowedCoreRpcEndpoint(request.endpoint);
  const params =
    request.params === undefined ? undefined : assertRecord(request.params, 'Core RPC params');
  if (params && JSON.stringify(params).length > 64 * 1024) {
    fail('Core RPC parameters are too large');
  }
  return { endpoint, params };
}

function validateCoreRpcUrl(value) {
  const raw = assertString(value, 'Core RPC URL', { min: 1, max: 2048 });
  const normalizedPath = raw.replace(/^\/+/, '');
  if (!normalizedPath) {
    fail('Core RPC URL is invalid');
  }
  if (
    normalizedPath.includes('://') ||
    normalizedPath.includes('\\') ||
    normalizedPath.includes('#')
  ) {
    fail('Core RPC URL must be a relative API path');
  }

  const [pathOnly, ...queryParts] = normalizedPath.split('?');
  if (queryParts.length > 1) {
    fail('Core RPC URL is invalid');
  }
  if (!pathOnly) {
    fail('Core RPC URL is invalid');
  }
  if (queryParts[0] !== undefined) {
    // Allow console-style query strings, but reject nested URLs or traversal.
    if (
      queryParts[0].includes('://') ||
      queryParts[0].includes('\\') ||
      queryParts[0].includes('/../') ||
      queryParts[0].includes('%2e%2e')
    ) {
      fail('Core RPC URL query is invalid');
    }
  }

  const segments = pathOnly.split('/').filter(Boolean);
  if (!segments.length || segments.length > 8) {
    fail('Core RPC URL is invalid');
  }
  for (const segment of segments) {
    let decoded;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      fail('Core RPC URL is invalid');
    }
    if (
      !decoded ||
      decoded === '.' ||
      decoded === '..' ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      decoded.includes('\0')
    ) {
      fail('Core RPC URL must be a relative API path');
    }
  }

  // Console callers may use richer path/query shapes than structured call(),
  // but the first segment must still be an approved lowercase Core API
  // namespace (same policy as validateCoreRpcRequest).
  if (!ALLOWED_CORE_RPC_NAMESPACES.has(segments[0])) {
    fail('Core RPC URL namespace is not allowed');
  }
  return normalizedPath;
}

function validateClipboardText(value) {
  return assertString(value, 'Clipboard text', {
    min: 0,
    max: MAX_CLIPBOARD_TEXT_LENGTH,
  });
}

function validateTrackEventRequest(value) {
  const request = assertRecord(value, 'Analytics event');
  const eventName = assertString(request.eventName, 'Analytics event name', {
    min: 1,
    max: 128,
  });
  if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(eventName)) {
    fail('Analytics event name is invalid');
  }
  let props;
  if (request.props !== undefined) {
    const properties = assertRecord(request.props, 'Analytics properties');
    const entries = Object.entries(properties);
    if (entries.length > 16) {
      fail('Analytics properties contain too many fields');
    }
    props = {};
    for (const [key, fieldValue] of entries) {
      assertString(key, 'Analytics property name', { min: 1, max: 64 });
      if (
        !['string', 'number', 'boolean'].includes(typeof fieldValue) ||
        (typeof fieldValue === 'string' && fieldValue.length > 256)
      ) {
        fail('Analytics property value is invalid');
      }
      props[key] = fieldValue;
    }
  }
  return { eventName, props };
}

function validateCoreConsoleCommand(value) {
  const command = assertString(value, 'Core console command', {
    min: 1,
    max: 4096,
  }).trim();
  if (!command || /[\r\n\0]/.test(command)) {
    fail('Core console command is invalid');
  }
  return command;
}

function validateModuleFiles(value) {
  if (!Array.isArray(value) || !value.length || value.length > 10000) {
    fail('Module files must be a non-empty array of at most 10000 paths');
  }
  return value.map((file) => assertRelativeModulePath(file));
}

function validateModuleStorageRequest(value) {
  const request = assertRecord(value, 'Module storage request');
  return {
    name: assertSafeModuleName(request.name),
    data:
      request.data === undefined
        ? undefined
        : assertRecord(request.data, 'Module storage data'),
  };
}

function validateModuleDownloadRequest(value) {
  const request = assertRecord(value, 'Module download request');
  return {
    moduleName: assertSafeModuleName(request.moduleName),
    owner: assertString(request.owner, 'Repository owner', { min: 1, max: 80 }),
    repo: assertString(request.repo, 'Repository name', { min: 1, max: 100 }),
    releaseId:
      request.releaseId === 'latest'
        ? 'latest'
        : Number.isSafeInteger(request.releaseId) && request.releaseId > 0
        ? request.releaseId
        : fail('Release id must be "latest" or a positive integer'),
  };
}

function validateMenuTemplate(value) {
  if (!Array.isArray(value) || value.length > 100) {
    fail('Menu template must contain at most 100 items');
  }
  return value;
}

function result(value) {
  return { ok: true, value };
}

function error(code, message) {
  return { ok: false, error: { code, message } };
}

module.exports = {
  ALLOWED_CORE_RPC_NAMESPACES,
  ALLOWED_EXTERNAL_HOSTS,
  CHANNELS,
  EVENTS,
  FORBIDDEN_ADVANCED_CORE_FLAGS,
  MAX_CLIPBOARD_TEXT_LENGTH,
  assertAbsoluteFilesystemPath,
  assertAdvancedCoreParams,
  assertAllowedCoreRpcEndpoint,
  assertBoolean,
  assertExternalUrl,
  assertRecord,
  assertRelativeModulePath,
  assertSafeModuleName,
  assertString,
  error,
  result,
  validateClipboardText,
  validateCoreConsoleCommand,
  validateCoreRpcRequest,
  validateCoreRpcUrl,
  validateMenuTemplate,
  validateModuleDownloadRequest,
  validateModuleFiles,
  validateModuleStorageRequest,
  validateNoArguments,
  validateSettingsUpdate,
  validateThemeUpdate,
  validateTrackEventRequest,
};
