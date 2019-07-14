import path from 'path';
import crypto from 'crypto';
import macaddress from 'macaddress';
import { walletDataDir } from 'consts/paths';
import { homeDir } from 'consts/paths';
import { coreDataDir } from 'consts/paths';
import { readJson, writeJson } from 'utils/fileSystem';

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
  locale: 'en',
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
  manualDaemon: false,
  manualDaemonUser: 'rpcserver',
  manualDaemonPassword: defaultPassword,
  manualDaemonIP: '127.0.0.1',
  manualDaemonPort: '9336',
  manualDaemonDataDir: coreDataDir,

  // Style
  renderGlobe: true,
  addressStyle: 'segmented',

  // Modules
  disabledModules: [],

  // Hidden settings
  acceptedAgreement: false,
  experimentalWarningDisabled: false,
  encryptionWarningDisabled: false,
  bootstrapSuggestionDisabled: false,
  windowWidth: 1020,
  windowHeight: 700,
  windowX: undefined,
  windowY: undefined,
  forkBlocks: 0,
};

function readSettings() {
  return readJson(settingsFilePath);
}

function writeSettings(settings) {
  return writeJson(settingsFilePath, filterValidSettings(settings));
}

export function filterValidSettings(settings) {
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

export function LoadSettings() {
  const customSettings = readSettings();
  return { ...defaultSettings, ...customSettings };
}

export function UpdateSettings(updates) {
  const settings = readSettings();
  return writeSettings({ ...settings, ...updates });
}
