import path from 'path';
import crypto from 'crypto';
import macaddress from 'macaddress';
import { homeDir, defaultCoreDataDir } from 'consts/paths';

const defaultBackupDir = path.join(homeDir, '/NexusBackups');

const secret =
  process.platform === 'darwin'
    ? process.env.USER + process.env.HOME + process.env.SHELL
    : JSON.stringify(macaddress.networkInterfaces(), null, 2);
const defaultPassword = crypto
  .createHmac('sha256', secret)
  .update('pass')
  .digest('hex');

export default {
  // App
  locale: null,
  minimizeOnClose: false,
  openOnStart: false,
  autoUpdate: true,
  allowPrerelease: false,
  sendUsageData: true,
  fiatCurrency: 'USD',
  minConfirmations: 3,
  backupDirectory: defaultBackupDir,
  devMode: false,
  verifyModuleSource: true,
  fakeTransactions: false,
  overviewDisplay: 'standard',
  hideOverviewBalances: false,
  displayFiatBalance: false,

  // Core
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
  testnetIteration: 0,
  privateTestnet: false,
  allowAdvancedCoreOptions: false,
  advancedCoreParams: '',
  manualDaemon: false,
  manualDaemonIP: '127.0.0.1',
  manualDaemonApiSSL: true,
  manualDaemonApiUser: 'apiserver',
  manualDaemonApiPassword: defaultPassword,
  manualDaemonApiIP: '127.0.0.1',
  manualDaemonApiPort: '8080',
  manualDaemonApiPortSSL: '7080',
  manualDaemonLogOutOnClose: false,
  embeddedCoreUseNonSSL: false,
  embeddedCoreApiPort: undefined,
  embeddedCoreApiPortSSL: undefined,

  // Style
  renderGlobe: true,
  addressStyle: 'segmented',

  // Modules
  disabledModules: [],
  allowSymLink: false,
  devModulePaths: [],

  // Others
  showUnusedNames: true,

  // Hidden settings
  acceptedAgreement: false,
  bootstrapSuggestionDisabled: false,
  liteModeNoticeDisabled: false,
  windowWidth: 1200,
  windowHeight: 800,
  windowX: undefined,
  windowY: undefined,
  forkBlocks: 0,
  walletClean: false,
  clearPeers: false,
  coreAPIPolicy: 0,
  // If false, show Create new user modal instead of Login
  // modal automatically when core is connected
  firstCreateNewUserShown: false,
  consoleCliSyntax: true,
  dontAskToStartStaking: false,
  lastCheckForUpdates: null,
};
