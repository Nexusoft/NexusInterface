import crypto from 'crypto';
import macaddress from 'macaddress';
import config from 'api/configuration';
import normalizePath from 'utils/normalizePath';

const settingsFileName = 'settings.json';

const defaultBackupDir = normalizePath(config.GetHomeDir() + '/NexusBackups');

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
  experimentalWarningDisabled: false,
  encryptionWarningDisabled: false,
  bootstrapSuggestionDisabled: false,
  windowWidth: 1020,
  windowHeight: 700,
  forkBlocks: 0,
};

function readSettings() {
  return config.ReadJson(settingsFileName);
}

function writeSettings(settings) {
  return config.WriteJson(settingsFileName, filterValidSettings(settings));
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
