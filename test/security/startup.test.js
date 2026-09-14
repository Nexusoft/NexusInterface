'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const read = (...segments) =>
  fs.readFileSync(path.join(root, ...segments), 'utf8');

test('window startup configuration keeps wallet and keyboard renderers isolated', () => {
  const renderer = read('src', 'main', 'renderer.js');
  const keyboard = read('src', 'main', 'keyboard.js');
  const paths = read('src', 'main', 'paths.js');
  const preload = read('src', 'main', 'preload.js');
  const main = read('src', 'main', 'main.js');

  assert.match(renderer, /nodeIntegration:\s*false/);
  assert.match(renderer, /contextIsolation:\s*true/);
  assert.match(
    paths,
    /export const isDevelopment =\s*!app\.isPackaged && process\.env\.NODE_ENV === 'development'/
  );
  assert.match(renderer, /import \{ assetsDir, isDevelopment \} from '.\/paths'/);
  assert.match(keyboard, /import \{ isDevelopment \} from '.\/paths'/);
  assert.doesNotMatch(paths, /process\.env\.NODE_ENV === 'development'\s*\?/);
  assert.doesNotMatch(keyboard, /process\.env\.NODE_ENV === 'development'/);
  assert.doesNotMatch(preload, /NODE_ENV:\s*process\.env\.NODE_ENV/);
  assert.match(preload, /nexus-development/);
  // Default remains sandboxed; the override is unavailable to packaged apps.
  assert.match(renderer, /const allowSandboxOverride =\s*!app\.isPackaged/);
  assert.match(
    renderer,
    /sandbox:\s*!\(\s*allowSandboxOverride\s*&&\s*process\.env\.NEXUS_DISABLE_SANDBOX/
  );
  // The sandbox expression must guard with a dev/debug check so production
  // builds cannot have sandbox disabled by an environment variable alone.
  assert.doesNotMatch(
    renderer,
    /sandbox:\s*process\.env\.NEXUS_DISABLE_SANDBOX === '1' \? false : true/
  );
  assert.match(renderer, /enableRemoteModule:\s*false/);
  assert.match(keyboard, /nodeIntegration:\s*false/);
  assert.match(keyboard, /contextIsolation:\s*true/);
  assert.match(keyboard, /sandbox:\s*true/);
  assert.match(preload, /contextBridge\.exposeInMainWorld/);
  assert.match(preload, /preload\.init/);
  assert.doesNotMatch(preload, /from ['"]electron['"].*clipboard|clipboard.*from ['"]electron['"]/);
  assert.doesNotMatch(preload, /@aptabase\/electron\/renderer/);
  assert.match(renderer, /setWindowOpenHandler\(\(\) => \(\{ action: 'deny' \}\)\)/);
  assert.match(renderer, /will-navigate/);
  assert.match(renderer, /will-redirect/);
  assert.doesNotMatch(renderer, /await mainWindow\.loadURL/);
  assert.match(renderer, /mainWindow\.loadURL\(htmlPath\)\.catch/);
  assert.doesNotMatch(renderer, /await installExtensions/);
  assert.match(renderer, /additionalArguments:[\s\S]*--nexus-development/);
  assert.match(main, /mainWindow = createWindow\(settings\)/);
  assert.ok(
    renderer.indexOf('hardenModuleWebviews(mainWindow)') <
      renderer.indexOf('mainWindow.loadURL(htmlPath)')
  );
  assert.match(main, /event\.senderFrame === windowContents\.mainFrame/);
  assert.match(main, /isTrustedWindowUrl\(event\.senderFrame\?\.url/);
  const appSettings = read('src', 'App', 'Settings', 'App', 'index.tsx');
  assert.doesNotMatch(appSettings, /updateHandlers\(['"]devMode['"]\)/);
});

test('renderer build fails rather than externalizing Node or Electron imports', () => {
  const webpackConfig = read(
    'configs',
    'webpack.config.base.renderer.babel.js'
  );
  const dllConfig = read('configs', 'webpack.config.dll.dev.babel.js');
  const bootstrap = read('assets', 'static', 'app-bootstrap.js');

  assert.match(webpackConfig, /node:\s*false/);
  assert.match(webpackConfig, /electron:\s*false/);
  assert.match(webpackConfig, /electronRenderer:\s*false/);
  assert.match(webpackConfig, /conditionNames:.*browser/);
  assert.match(bootstrap, /renderer\.dev\.dll\.js/);
  assert.match(dllConfig, /devtool:\s*['"]cheap-module-source-map['"]/);
  assert.doesNotMatch(dllConfig, /devtool:\s*['"]eval/);
});

test('embedded Core start always supplies API auth and probes already-running Core', () => {
  const core = read('src', 'main', 'core.js');
  const coreRpc = read('src', 'main', 'coreRpc.js');
  const rendererCore = read('src', 'shared', 'lib', 'core.ts');
  const coreSettings = read('src', 'App', 'Settings', 'Core', 'index.tsx');
  const embeddedCoreSettings = read(
    'src',
    'App',
    'Settings',
    'Core',
    'EmbeddedCoreSettings.tsx'
  );
  const liteModeNotice = read('src', 'App', 'Overlays', 'LiteModeNotice.tsx');
  const staking = read('src', 'App', 'UserPage', 'Staking.tsx');
  const main = read('src', 'main', 'main.js');
  const coreConf = read('src', 'main', 'ipc', 'coreConf.js');
  const wallet = read('src', 'shared', 'lib', 'wallet.ts');

  // API credentials must live in nexus.conf (0600), never on the Core CLI —
  // process listings would otherwise leak -apiuser/-apipassword.
  assert.doesNotMatch(core, /`-apiuser=\$\{configuration\.apiUser\}`/);
  assert.doesNotMatch(core, /`-apipassword=\$\{configuration\.apiPassword\}`/);
  assert.doesNotMatch(core, /-apiuser=\$\{configuration\.apiUser\}/);
  assert.doesNotMatch(core, /-apipassword=\$\{configuration\.apiPassword\}/);
  // Non-secret bind flags are still passed on the CLI.
  assert.match(core, /apissl=\$\{apiSSL \? '1' : '0'\}/);
  assert.match(core, /apisslport=\$\{configuration\.apiPortSSL\}/);
  assert.match(core, /probeCoreApi/);
  assert.match(core, /apiReachable/);
  assert.match(core, /waitForCoreApi|CORE_API_READY_TIMEOUT_MS/);
  assert.match(core, /stopEmbeddedCore/);
  // Never kill an unrelated Core that merely shares the binary name/path.
  assert.match(core, /commandUsesDataDir/);
  assert.match(core, /let walletManagedCorePid = null/);
  assert.match(core, /let walletManagedCoreDataDir = null/);
  assert.match(core, /requiresTrackedPid = !!dataDir && \/\\s\/\.test\(dataDir\)/);
  assert.match(core, /walletManagedCorePid = coreProcess\.pid/);
  assert.match(core, /walletManagedCoreDataDir = dataDirParam/);
  assert.match(core, /unmanaged-core-api-unreachable/);
  assert.match(core, /getCorePID\(\{\s*dataDir:\s*settings\.coreDataDir\s*\}\)/);
  assert.match(coreRpc, /probeCoreApi/);
  assert.match(coreRpc, /resolveEmbeddedCoreConnection/);
  // Credentials are ensured in conf before Core start.
  assert.match(coreConf, /apiuser:\s*'apiserver'|apiuser:/);
  assert.match(coreConf, /apipassword:/);
  // Core only honors apisslport in nexus.conf — never write only apiportssl.
  assert.match(coreConf, /apisslport:\s*desiredPortSSL/);
  assert.match(coreConf, /delete config\.apiportssl/);
  // Invalid/zero ports must be normalized to the deterministic fallback.
  assert.match(coreConf, /normalizePort/);
  // SSL default fallback is 8443 (Core mainnet default), not 7080.
  assert.match(coreConf, /normalizePort[\s\S]*8443|8443[\s\S]*normalizePort/);
  // Main process must stop Core on quit/exit so orphans are not left behind.
  assert.match(main, /stopEmbeddedCore|ensureEmbeddedCoreStopped|shutdownEmbeddedCoreAndAllowQuit/);
  assert.match(main, /before-quit/);
  assert.doesNotMatch(
    main,
    /shutdownEmbeddedCoreAndAllowQuit\(\)\.finally\([\s\S]*app\.exit\(0\)/
  );
  assert.match(
    main,
    /shutdownEmbeddedCoreAndAllowQuit\(\)[\s\S]*\.then\(\(\) => app\.exit\(0\)\)[\s\S]*\.catch/
  );
  assert.doesNotMatch(
    read('src', 'main', 'core.js'),
    /executeCommand[\s\S]*console\.error\(err\)/
  );
  // Menu/IPC quit must hard-exit: window close is always preventDefault'd so
  // app.quit() alone cannot terminate after allowingFinalQuit is set.
  assert.match(
    main,
    /registerOperation\(\s*CHANNELS\.app\.quit,\s*undefined,\s*async \(\) => \{\s*await shutdownEmbeddedCoreAndAllowQuit\(\);\s*app\.exit\(0\);\s*\}\)/
  );
  // Renderer delegates the complete graceful-stop/kill/confirmation sequence
  // to the serialized main-process lifecycle operation.
  assert.match(rendererCore, /window\.nexusElectron\.core\.stop\(\)/);
  assert.match(main, /coreLifecycle\.run\(['"]stop['"]/);
  assert.match(core, /core\.stop\.confirmed/);
  assert.match(core, /core\.stop\.unconfirmed/);
  // Wallet close relies on main-process exit to stop Core (no double wait).
  assert.match(wallet, /app\.exit\(\)/);
  assert.doesNotMatch(wallet, /await stopCore\(\)/);
  assert.match(
    wallet,
    /try \{[\s\S]*await logOut\(\)[\s\S]*await window\.nexusElectron\.app\.exit\(\)[\s\S]*catch \(error\)[\s\S]*walletClosingAtom,\s*false[\s\S]*coreInfoPausedAtom,\s*false[\s\S]*Unable to close Nexus Wallet[\s\S]*Please try again/
  );
  // Renderer must not short-circuit before main can probe/restart a mismatched Core.
  assert.match(rendererCore, /window\.nexusElectron\.core\.start\(\)/);
  assert.doesNotMatch(
    rendererCore,
    /if \(status\.running\) \{\s*console\.info\([\s\S]*Skipping starting core/
  );
  // Startup/probe failures must be returned and surfaced, not only logged.
  assert.match(core, /apiError:\s*ready\.ok \? undefined : ready\.error/);
  assert.match(core, /core\.api\.wait\.timeout|core\.api\.wait\.ready/);
  assert.match(rendererCore, /setCoreConnectionError|apiReachable === false/);
  assert.match(
    rendererCore,
    /restartResult\?\.apiReachable === false[\s\S]*setCoreConnectionError/
  );
  assert.match(
    coreSettings,
    /submit:\s*async[\s\S]*await updateSettings\(updates\)[\s\S]*onSuccess:[\s\S]*restartCore\(\)\.catch/
  );
  assert.doesNotMatch(coreSettings, /await stopCore\(\)/);
  assert.doesNotMatch(coreSettings, /window\.nexusElectron\.settings\.update/);
  assert.match(
    embeddedCoreSettings,
    /await updateSettings\(\{ clearPeers: true \}\);[\s\S]*await restartCore\(\)/
  );
  assert.match(
    embeddedCoreSettings,
    /await updateSettings\(\{ clearPeers: true \}\);[\s\S]*await resyncLiteCore\(\)/
  );
  assert.match(
    liteModeNotice,
    /await updateSettings\([\s\S]*await restartCore\(\)/
  );
  assert.match(
    staking,
    /await updateSettings\([\s\S]*await restartCore\(\)/
  );
});

test('renderer surfaces Core connection failures instead of silent spinner', () => {
  const index = read('src', 'index.js');
  const coreInfo = read('src', 'shared', 'lib', 'coreInfo.ts');
  const coreStatus = read('src', 'shared', 'components', 'CoreStatus.ts');
  const rendererCore = read('src', 'shared', 'lib', 'core.ts');

  assert.match(index, /renderer\.bootstrap\.start/);
  assert.match(index, /renderer\.bootstrap\.startCore\.error/);
  assert.match(index, /renderer\.bridge\.selftest\.core_get_status/);
  assert.match(coreInfo, /coreConnectionErrorAtom/);
  assert.match(coreInfo, /core\.rpc\.system_get_info\.failed/);
  assert.match(coreInfo, /setCoreConnectionError/);
  assert.match(coreStatus, /coreConnectionErrorAtom/);
  assert.match(coreStatus, /Unable to connect to Nexus Core/);
  assert.match(rendererCore, /core\.start\.requested/);
  assert.match(rendererCore, /apiReachable === false/);
  // Intentional stop must pause polling before kill so shutdown errors stay quiet.
  assert.match(
    rendererCore,
    /if \(!forRestart\) \{\s*store\.set\(coreInfoPausedAtom,\s*true\);\s*clearCoreConnectionError\(\);/
  );
});

test('Core output subscription starts even when already connected', () => {
  const coreOutput = read('src', 'shared', 'lib', 'coreOutput.ts');
  const mainOutput = read('src', 'main', 'coreOutput.js');

  // Change-only store.sub is not enough; module load must sync immediately.
  assert.match(coreOutput, /syncCoreOutputWatch/);
  assert.match(coreOutput, /syncCoreOutputWatch\(\)/);
  assert.match(coreOutput, /subscribe\(coreConnectedAtom,\s*syncCoreOutputWatch\)/);
  assert.match(coreOutput, /core\.output\.subscribe/);
  assert.match(mainOutput, /core\.output\.path_missing|core\.output\.path_ready/);
  assert.match(mainOutput, /core\.output\.subscribe/);
});

test('main process emits structured Core lifecycle diagnostics', () => {
  const core = read('src', 'main', 'core.js');
  const coreRpc = read('src', 'main', 'coreRpc.js');
  const main = read('src', 'main', 'main.js');

  assert.match(core, /core\.start\.requested/);
  assert.match(core, /core\.spawned/);
  assert.match(core, /core\.api\.ready|core\.api\.wait\.timeout/);
  assert.match(coreRpc, /core\.probe\.begin|core\.probe\.failed|core\.probe\.ok/);
  assert.match(coreRpc, /summarizeConfig/);
  assert.match(
    coreRpc,
    /endpoint:\s*redactSensitiveText\(endpoint\.split\('\?'\)\[0\]\)/
  );
  assert.match(coreRpc, /message:\s*redactSensitiveText\(message\)/);
  assert.match(main, /ipc\.core\.enter/);
  assert.match(main, /ipc\.core\.exit/);
  assert.match(main, /CORE_TRACE_CHANNELS/);
  assert.match(
    main,
    /endpoint = assertAllowedCoreRpcEndpoint\(request\.endpoint\)/
  );
  assert.match(
    main,
    /endpoint = validateCoreConsoleRpcUrl\(request\)\.split\(\/\[\/\?\]\//
  );
  assert.match(
    main,
    /const message = redactSensitiveText\([\s\S]*log\.warn\('ipc\.core\.exit'/
  );
});

test('default backup directory uses os.homedir instead of HOME-only env', () => {
  const settings = read('src', 'main', 'settings.js');
  assert.match(settings, /import os from 'os'/);
  assert.match(settings, /path\.join\(os\.homedir\(\),\s*'NexusBackups'\)/);
  assert.doesNotMatch(
    settings,
    /backupDirectory:\s*path\.join\(process\.env\.HOME/
  );
});

test('language selection persists locale once before reload', () => {
  const selectLanguage = read('src', 'App', 'Overlays', 'SelectLanguage.tsx');
  assert.match(
    selectLanguage,
    /await window\.nexusElectron\.settings\.update\(\{\s*locale:\s*selection\s*\}\)/
  );
  assert.doesNotMatch(selectLanguage, /updateSettings\(\{\s*locale:/);
});

test('renderer settings persistence serializes versioned batches', () => {
  const settings = read('src', 'shared', 'lib', 'settings', 'index.ts');

  assert.match(settings, /let persistenceQueue = Promise\.resolve\(\)/);
  assert.match(
    settings,
    /const targetSettings = store\.get\(userSettingsAtom\)[\s\S]*const targetVersions = \{ \.\.\.settingVersions \}[\s\S]*Object\.entries\(targetSettings\)[\s\S]*queuedSettings[\s\S]*queuedSettings = targetSettings[\s\S]*if \(!Object\.keys\(batchUpdates\)\.length\) \{[\s\S]*targetAlreadyPersisted[\s\S]*persistenceQueue\.then\([\s\S]*persistenceQueue = persistenceQueue[\s\S]*Object\.entries\(batchUpdates\)[\s\S]*await window\.nexusElectron\.settings\.update\(updates\)[\s\S]*persistedSettings =[\s\S]*persistenceQueue\.then\([\s\S]*waiters\.forEach\(\(\{ resolve \}\) => resolve\(\)\)/
  );
  assert.match(
    settings,
    /settingVersions\[settingsKey\] !== targetVersions\[settingsKey\][\s\S]*persistedSettings\[settingsKey\] === value[\s\S]*currentSettings\[settingsKey\] !== value[\s\S]*delete rolledBackSettings\[settingsKey\][\s\S]*queuedSettings\[settingsKey\] === value[\s\S]*reconciledQueuedSettings[\s\S]*queuedSettings = reconciledQueuedSettings[\s\S]*store\.set\(userSettingsAtom, rolledBackSettings\)[\s\S]*throw error[\s\S]*waiters\.forEach\(\(\{ reject \}\) => reject\(error\)\)/
  );
  assert.doesNotMatch(settings, /do \{[\s\S]*\} while/);
});

test('updater GitHub release version variable is spelled correctly', () => {
  const updater = read('src', 'shared', 'lib', 'updater', 'index.tsx');
  assert.match(updater, /const latestVersion = result\.release\.tagName/);
  assert.doesNotMatch(updater, /latestVerion/);
});
