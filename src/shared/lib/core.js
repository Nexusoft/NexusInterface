import { ipcRenderer } from 'electron';
import log from 'electron-log';

import * as TYPE from 'consts/actionTypes';
import store, { jotaiStore } from 'store';
import { loadNexusConf, coreConfigAtom } from 'lib/coreConfig';
import { coreInfoPausedAtom } from './coreInfo';
import { callAPI } from 'lib/api';
import { updateSettings, settingsAtom } from 'lib/settings';
import sleep from 'utils/promisified/sleep';
import { minimumCoreAPIPolicy, preRelease } from 'consts/misc';
import { defaultCoreDataDir } from 'consts/paths';
import fs from 'fs';
import { rm as deleteDirectory } from 'fs/promises';
import * as path from 'path';

/**
 * Start Nexus Core
 */
export const startCore = async () => {
  // Check remote core mode
  const settings = jotaiStore.get(settingsAtom);
  if (settings.manualDaemon) {
    log.info('Core Manager: Remote Core mode, skipping starting core');
    return;
  }

  // Check if core exists
  if (!(await ipcRenderer.invoke('check-core-exists'))) {
    throw new Error('Core not found');
  }

  // Load config
  const conf = await loadNexusConf();
  jotaiStore.set(coreConfigAtom, conf);

  // Check if core's already running
  if (await ipcRenderer.invoke('check-core-running')) {
    log.info(
      'Core Manager: Nexus Core Process already running. Skipping starting core'
    );
    return;
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

  // Prepare parameters
  const params = [
    '-daemon',
    '-server',
    '-fastsync',
    '-noterminateauth',
    '-ssl=1',
    '-apissl=1',
    '-p2pssl=1',
    `-datadir=${settings.coreDataDir}`,
    `-apisslport=${conf.apiPortSSL}`,
    `-apiport=${conf.apiPort}`,
    `-verbose=${preRelease ? 3 : settings.verboseLevel}`,
  ];

  if (LOCK_TESTNET) {
    params.push(
      '-connect=testnet1.interactions-nexus.io',
      '-connect=testnet2.interactions-nexus.io',
      '-connect=testnet3.interactions-nexus.io',
      '-nodns=1',
      `-testnet=${LOCK_TESTNET}`
    );
  } else {
    if (settings.testnetIteration && settings.testnetIteration !== '0') {
      params.push('-testnet=' + settings.testnetIteration);
      if (settings.privateTestnet) {
        params.push('-private=1');
      }
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
  if (settings.liteMode == true) params.push('-client=1');
  if (settings.multiUser == true) params.push('-multiusername=1');
  if (settings.allowAdvancedCoreOptions) {
    if (settings.advancedCoreParams) params.push(settings.advancedCoreParams);
  }

  if (
    !LOCK_TESTNET &&
    !settings.testnetIteration &&
    (!settings.coreAPIPolicy || settings.coreAPIPolicy < minimumCoreAPIPolicy)
  ) {
    updateSettings({ coreAPIPolicy: minimumCoreAPIPolicy });
    const corePath =
      conf.coreDataDir || settings.coreDataDir || defaultCoreDataDir;
    if (fs.existsSync(path.join(corePath, '_API'))) {
      await deleteDirectory(path.join(corePath, '_API'), {
        recursive: true,
        force: true,
      });
    }
  }

  // Start core
  await ipcRenderer.invoke('start-core', params);
  jotaiStore.set(coreInfoPausedAtom, false);
};

/**
 * Stop Nexus Core
 */
export const stopCore = async (forRestart) => {
  log.info('Core Manager: Stop function called');
  const { manualDaemon } = jotaiStore.get(settingsAtom);
  store.dispatch({ type: TYPE.DISCONNECT_CORE });
  try {
    await callAPI('system/stop');

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
    jotaiStore.set(coreInfoPausedAtom, true);
  }
};

/**
 * Restart Nexus Core
 */
export const restartCore = async () => {
  await stopCore(true);
  await startCore();
  jotaiStore.set(coreInfoPausedAtom, false);
};
