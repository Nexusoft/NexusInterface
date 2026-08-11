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
  const preload = read('src', 'main', 'preload.js');

  assert.match(renderer, /nodeIntegration:\s*false/);
  assert.match(renderer, /contextIsolation:\s*true/);
  // Default remains sandboxed; NEXUS_DISABLE_SANDBOX=1 only takes effect in
  // development/debug builds, not in packaged production builds.
  assert.match(
    renderer,
    /NEXUS_DISABLE_SANDBOX[\s\S]{0,200}NODE_ENV.*development/
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
});

test('renderer build fails rather than externalizing Node or Electron imports', () => {
  const webpackConfig = read(
    'configs',
    'webpack.config.base.renderer.babel.js'
  );

  assert.match(webpackConfig, /node:\s*false/);
  assert.match(webpackConfig, /electron:\s*false/);
  assert.match(webpackConfig, /electronRenderer:\s*false/);
  assert.match(webpackConfig, /conditionNames:.*browser/);
});

test('embedded Core start always supplies API auth and probes already-running Core', () => {
  const core = read('src', 'main', 'core.js');
  const coreRpc = read('src', 'main', 'coreRpc.js');
  const rendererCore = read('src', 'shared', 'lib', 'core.ts');
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
  // Menu/IPC quit must hard-exit: window close is always preventDefault'd so
  // app.quit() alone cannot terminate after allowingFinalQuit is set.
  assert.match(
    main,
    /registerOperation\(\s*CHANNELS\.app\.quit,\s*undefined,\s*async \(\) => \{\s*await shutdownEmbeddedCoreAndAllowQuit\(\);\s*app\.exit\(0\);\s*\}\)/
  );
  // Renderer stop must still force-kill when system/stop fails.
  assert.match(rendererCore, /window\.nexusElectron\.core\.kill\(\)/);
  assert.match(
    rendererCore,
    /Graceful stop request failed[\s\S]*core\.kill\(\)/
  );
  // Wallet close relies on main-process exit to stop Core (no double wait).
  assert.match(wallet, /app\.exit\(\)/);
  assert.doesNotMatch(wallet, /await stopCore\(\)/);
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
  assert.match(main, /ipc\.core\.enter/);
  assert.match(main, /ipc\.core\.exit/);
  assert.match(main, /CORE_TRACE_CHANNELS/);
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

test('updater GitHub release version variable is spelled correctly', () => {
  const updater = read('src', 'shared', 'lib', 'updater', 'index.tsx');
  assert.match(updater, /const latestVersion = result\.release\.tagName/);
  assert.doesNotMatch(updater, /latestVerion/);
});
