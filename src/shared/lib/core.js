import { ipcRenderer } from 'electron';
import log from 'electron-log';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import rpc from 'lib/rpc';
import { loadNexusConf, saveCoreConfig } from 'lib/coreConfig';
import { callApi } from 'lib/tritiumApi';
import { updateSettings } from 'lib/settings';
import sleep from 'utils/promisified/sleep';

export const getLedgerInfo = async () => {
  try {
    const ledgerInfo = await callApi('ledger/get/info');
    store.dispatch({ type: TYPE.SET_LEDGER_INFO, payload: ledgerInfo });
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_LEDGER_INFO });
    console.error('ledger/get/info failed', err);
  }
};

export const getDifficulty = async () => {
  const diff = await rpc('getdifficulty', []);
  store.dispatch({ type: TYPE.GET_DIFFICULTY, payload: diff });
};

/**
 * Start Nexus Core
 */
export const startCore = async () => {
  // Check remote core mode
  const { settings } = store.getState();
  if (settings.manualDaemon) {
    log.info('Core Manager: Remote Core mode, skipping starting core');
    return;
  }
  // Check if core's already running
  if (await ipcRenderer.invoke('check-core-running')) {
    log.info(
      'Core Manager: Nexus Core Process already running. Skipping starting core'
    );
    saveCoreConfig(await loadNexusConf());
    return;
  }
  // Check if core exists
  if (!(await ipcRenderer.invoke('check-core-exists'))) {
    throw new Error('Core not found');
  }
  // if (settings.clearPeers) {
  //   if (fs.existsSync(path.join(conf.dataDir, 'addr.bak'))) {
  //     await deleteDirectory(path.join(conf.dataDir, 'addr.bak'));
  //   }
  //   if (fs.existsSync(path.join(conf.dataDir, 'addr'))) {
  //     fs.renameSync(
  //       path.join(conf.dataDir, 'addr'),
  //       path.join(conf.dataDir, 'addr.bak')
  //     );
  //   }
  //   updateSettingsFile({ clearPeers: false });
  // }

  // Load config
  const conf = await loadNexusConf();

  // Prepare parameters
  const params = [
    '-daemon',
    '-server',
    '-rpcthreads=4',
    '-fastsync',
    '-noterminateauth',
    '-ssl=1',
    '-apissl=1',
    '-rpcssl=1',
    '-p2pssl=1',
    `-datadir=${settings.coreDataDir}`,
    `-rpcsslport=${conf.portSSL}`,
    `-apisslport=${conf.apiPortSSL}`,
    `-rpcport=${conf.port}`,
    `-apiport=${conf.apiPort}`,
    `-verbose=${settings.verboseLevel}`,
  ];
  if (settings.testnetIteration && settings.testnetIteration !== '0') {
    params.push('-testnet=' + settings.testnetIteration);
    if (settings.privateTestnet) {
      params.push('-private=1');
    }
  }
  if (settings.forkBlocks) {
    params.push('-forkblocks=' + settings.forkBlocks);
    updateSettings({ forkBlocks: 0 });
  }
  if (settings.safeMode) {
    params.push('-safemode=1');
  }
  if (settings.walletClean) {
    params.push('-walletclean');
    updateSettings({ walletClean: false });
  }
  // Avatar is default so only add it if it is off.
  if (!settings.avatarMode) {
    params.push('-avatar=0');
  }
  if (settings.enableMining == true) {
    params.push('-mining=1');
    if (settings.ipMineWhitelist !== '') {
      settings.ipMineWhitelist.split(';').forEach((element) => {
        params.push(`-llpallowip=${element}`);
      });
    }
  }
  if (settings.enableStaking == true) params.push('-stake=1');
  if (settings.pooledStaking == true) params.push('-poolstaking=1');
  if (settings.liteMode == true) params.push('-no_wallet=1 -client=1');
  if (settings.multiUser == true) params.push('-multiuser=1');
  if (settings.allowAdvancedCoreOptions) {
    if (settings.advancedCoreParams) params.push(settings.advancedCoreParams);
  }

  // Start core
  await ipcRenderer.invoke('start-core', params);
  saveCoreConfig(conf);
  store.dispatch({
    type: TYPE.START_CORE_AUTO_CONNECT,
  });
};

/**
 * Stop Nexus Core
 */
export const stopCore = async (forRestart) => {
  log.info('Core Manager: Stop function called');
  const { manualDaemon } = store.getState().settings;
  store.dispatch({ type: TYPE.DISCONNECT_CORE });
  try {
    await callApi('system/stop');

    // Wait for core to gracefully stop for 10 seconds
    let coreStillRunning;
    for (let i = 0; i < 10; i++) {
      coreStillRunning = await ipcRenderer.invoke('check-core-running');
      if (coreStillRunning) {
        log.info(
          `Core Manager: Core still running after stop command for: ${i} seconds`
        );
      } else {
        log.info(`Core Manager: Core stopped gracefully.`);
        break;
      }
      await sleep(1000);
    }

    if (coreStillRunning) {
      await ipcRenderer.invoke('kill-core-process');
    }
  } catch (err) {}

  if (!forRestart && !manualDaemon) {
    store.dispatch({
      type: TYPE.STOP_CORE_AUTO_CONNECT,
    });
  }
};

/**
 * Restart Nexus Core
 */
export const restartCore = async () => {
  await stopCore(true);
  await startCore();
  store.dispatch({
    type: TYPE.START_CORE_AUTO_CONNECT,
  });
};
