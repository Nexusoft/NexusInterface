//////////////////////////////////////////////////////
//
// Settings Manager
//
//////////////////////////////////////////////////////

import crypto from 'crypto';
import macaddress from 'macaddress';
import config from 'api/configuration';
import normalizePath from 'utils/normalizePath';

const defaultBackupDir = normalizePath(config.GetHomeDir() + '/NexusBackups');

const secret =
  process.platform === 'darwin'
    ? process.env.USER + process.env.HOME + process.env.SHELL
    : JSON.stringify(macaddress.networkInterfaces(), null, 2);
const defaultPassword = crypto
  .createHmac('sha256', secret)
  .update('pass')
  .digest('hex');

const defaultSettings = {
  // App
  locale: 'en',
  minimizeOnClose: false,
  autoUpdate: true,
  sendUsageData: true,
  fiatCurrency: 'USD',
  minConfirmations: 3,
  backupDirectory: defaultBackupDir,
  devMode: false,

  // Core
  enableMining: false,
  enableStaking: false,
  verboseLevel: 2,
  manualDaemon: false,
  manualDaemonUser: 'rpcserver',
  manualDaemonPassword: defaultPassword,
  manualDaemonIP: '127.0.0.1',
  manualDaemonPort: '9336',
  manualDaemonDataDir: config.GetCoreDataDir(),
  mapPortUsingUpnp: true,
  socks4Proxy: false,
  socks4ProxyIP: '127.0.0.1',
  socks4ProxyPort: '9050',
  detatchDatabaseOnShutdown: false,

  // Style
  renderGlobe: true,

  // Hidden settings
  acceptedAgreement: false,
  noExperimentalWarning: false,
  noBootstrapSuggestion: false,
  noEncryptionWarning: false,
  windowWidth: 1280,
  windowHeight: 1024,
};

//
// GetSettings: Get the application settings.json file from disk and return it
//
export function GetSettings() {
  return config.ReadJson('settings.json');
}

//
// SaveSettings: Save the application settings.json file
//

export function SaveSettings(settingsJson) {
  return config.WriteJson('settings.json', settingsJson);
}

export function GetSettingsWithDefault() {
  const customSettings = GetSettings();
  return { ...defaultSettings, ...customSettings };
}

export function UpdateSettings(updates) {
  const settings = GetSettings();
  return SaveSettings({ ...settings, ...updates });
}
