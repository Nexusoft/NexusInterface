import crypto from 'crypto';
import fs from 'fs';
import macaddress from 'macaddress';
import os from 'os';
import path from 'path';

import {
  addressBookFilePath,
  defaultCoreDataDir,
  settingsFilePath,
  themeFilePath,
  walletDataDir,
} from './paths';

const persistedSettingKeys = new Set([
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
  'windowWidth',
  'windowHeight',
  'windowX',
  'windowY',
  'revertBlocks',
  'walletClean',
  'clearPeers',
  'coreAPIPolicy',
  'firstCreateNewUserShown',
  'consoleCliSyntax',
  'dontAskToStartStaking',
  'lastCheckForUpdates',
]);

function createDefaultPassword() {
  const machineIdentity =
    process.platform === 'darwin'
      ? `${process.env.USER || ''}${process.env.HOME || ''}${
          process.env.SHELL || ''
        }`
      : JSON.stringify(macaddress.networkInterfaces(), null, 2);
  return crypto
    .createHmac('sha256', machineIdentity)
    .update('pass')
    .digest('hex');
}

export function getDefaultSettings() {
  return {
    locale: 'en',
    minimizeOnClose: false,
    openOnStart: false,
    autoUpdate: true,
    allowPrerelease: false,
    sendUsageData: true,
    fiatCurrency: 'USD',
    minConfirmations: 3,
    backupDirectory: path.join(os.homedir(), 'NexusBackups'),
    devMode: false,
    verifyModuleSource: true,
    fakeTransactions: false,
    overviewDisplay: 'standard',
    hideOverviewBalances: false,
    displayFiatBalance: false,
    liteMode: false,
    safeMode: true,
    enableMining: false,
    enableStaking: true,
    pooledStaking: false,
    multiUser: false,
    verboseLevel: 0,
    avatarMode: true,
    ipMineWhitelist: '',
    coreDataDir: defaultCoreDataDir,
    embeddedCoreBinaryPath: '',
    testnetIteration: 0,
    privateTestnet: false,
    allowAdvancedCoreOptions: false,
    advancedCoreParams: '',
    manualDaemon: false,
    manualDaemonIP: '127.0.0.1',
    manualDaemonApiSSL: true,
    manualDaemonApiUser: 'apiserver',
    manualDaemonApiPassword: createDefaultPassword(),
    manualDaemonApiIP: '127.0.0.1',
    manualDaemonApiPort: '8080',
    manualDaemonApiPortSSL: '7080',
    manualDaemonLogOutOnClose: false,
    embeddedCoreUseNonSSL: false,
    embeddedCoreApiPort: undefined,
    embeddedCoreApiPortSSL: undefined,
    renderGlobe: true,
    addressStyle: 'segmented',
    disabledModules: [],
    allowSymLink: false,
    devModulePaths: [],
    showUnusedNames: true,
    acceptedAgreement: false,
    bootstrapSuggestionDisabled: false,
    liteModeNoticeDisabled: false,
    windowWidth: 1200,
    windowHeight: 800,
    windowX: undefined,
    windowY: undefined,
    revertBlocks: 0,
    walletClean: false,
    clearPeers: false,
    coreAPIPolicy: 0,
    firstCreateNewUserShown: false,
    consoleCliSyntax: true,
    dontAskToStartStaking: false,
    lastCheckForUpdates: undefined,
  };
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
  fs.renameSync(temporaryPath, filePath);
}

export function loadSettingsFromFile() {
  const userSettings = readJson(settingsFilePath, {
    liteMode: true,
    liteModeNoticeDisabled: true,
  });
  const allowedUserSettings = Object.fromEntries(
    Object.entries(userSettings || {}).filter(([key]) =>
      persistedSettingKeys.has(key)
    )
  );
  return { ...getDefaultSettings(), ...allowedUserSettings };
}

export function updateSettingsFile(updates) {
  const currentSettings = readJson(settingsFilePath, {});
  const allowedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => persistedSettingKeys.has(key))
  );
  writeJson(settingsFilePath, { ...currentSettings, ...allowedUpdates });
  return loadSettingsFromFile();
}

export function getRendererSettings() {
  const settings = loadSettingsFromFile();
  const { manualDaemonApiPassword: _password, ...safeSettings } = settings;
  return safeSettings;
}

export function loadTheme() {
  return readJson(themeFilePath, {});
}

export function saveTheme(theme) {
  writeJson(themeFilePath, theme);
  return theme;
}

export function readAddressBook() {
  const persisted = readJson(addressBookFilePath, { addressBook: {} });
  return persisted?.addressBook || persisted?.addressbook || {};
}

export function writeAddressBook(addressBook) {
  writeJson(addressBookFilePath, { addressBook });
  return addressBook;
}

export function getManagedPath(name) {
  switch (name) {
    case 'walletData':
      return walletDataDir;
    case 'coreData':
      return loadSettingsFromFile().coreDataDir;
    default:
      throw new Error(`Unsupported managed path: ${name}`);
  }
}
