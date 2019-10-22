/**
 * Settings functionalities that can be used by both
 * renderer process and main process code
 */

import path from 'path';
import crypto from 'crypto';
import macaddress from 'macaddress';
import { walletDataDir } from 'consts/paths';
import { homeDir } from 'consts/paths';
import { coreDataDir } from 'consts/paths';
import { readJson, writeJson } from 'utils/json';

const settingsFileName = 'settings.json';
const settingsFilePath = path.join(walletDataDir, settingsFileName);

const defaultBackupDir = path.join(homeDir, '/NexusBackups');

const secret =
  process.platform === 'darwin'
    ? process.env.USER + process.env.HOME + process.env.SHELL
    : JSON.stringify(macaddress.networkInterfaces(), null, 2);
const defaultPassword = crypto
  .createHmac('sha256', secret)
  .update('pass')
  .digest('hex');

export const defaultSettings = {
  // App
  locale: null,
  minimizeOnClose: false,
  autoUpdate: true,
  sendUsageData: true,
  fiatCurrency: 'USD',
  minConfirmations: 3,
  backupDirectory: defaultBackupDir,
  devMode: false,
  verifyModuleSource: true,
  fakeTransactions: false,
  overviewDisplay: 'standard',
  displayFiatBalance: false,

  // Core
  enableMining: false,
  enableStaking: true,
  verboseLevel: 0,
  avatarMode: true,
  ipMineWhitelist: '',
  manualDaemon: false,
  manualDaemonUser: 'rpcserver',
  manualDaemonPassword: defaultPassword,
  manualDaemonIP: '127.0.0.1',
  manualDaemonPort: '9336',
  manualDaemonApiUser: 'apiserver',
  manualDaemonApiPassword: defaultPassword,
  manualDaemonApiIP: '127.0.0.1',
  manualDaemonApiPort: '8080',
  manualDaemonDataDir: coreDataDir,

  // Style
  renderGlobe: true,
  addressStyle: 'segmented',

  // Modules
  disabledModules: [],
  allowSymLink: false,

  // Hidden settings
  acceptedAgreement: false,
  experimentalWarningDisabled: false,
  encryptionWarningDisabled: false,
  bootstrapSuggestionDisabled: false,
  windowWidth: 1200,
  windowHeight: 800,
  windowX: undefined,
  windowY: undefined,
  forkBlocks: 0,
  walletClean: false,
  legacyMode: false, // only for alpha release
  tritiumModeNoticeDisabled: false,
  alphaTestNet: 33,
};

function filterValidSettings(settings) {
  const validSettings = {};
  Object.keys(settings || {}).map(key => {
    if (defaultSettings.hasOwnProperty(key)) {
      validSettings[key] = settings[key];
    } else {
      console.error(`Invalid setting \`${key}\``);
    }
  });
  return validSettings;
}

function readSettings() {
  return filterValidSettings(readJson(settingsFilePath));
}

function writeSettings(settings) {
  return writeJson(settingsFilePath, filterValidSettings(settings));
}

export function loadSettingsFromFile() {
  const customSettings = readSettings();
  return { ...defaultSettings, ...customSettings };
}

export function updateSettingsFile(updates) {
  const settings = readSettings();
  return writeSettings({ ...settings, ...updates });
}
