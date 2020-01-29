import spawn from 'cross-spawn';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

import {
  loadSettingsFromFile,
  updateSettingsFile,
} from 'lib/settings/universal';
import { customConfig, loadNexusConf } from 'lib/coreConfig';
import exec from 'utils/promisified/exec';
import sleep from 'utils/promisified/sleep';
import deleteDirectory from 'utils/promisified/deleteDirectory';
import { assetsByPlatformDir } from 'consts/paths';

const coreBinaryName = `nexus-${process.platform}-${process.arch}${
  process.platform === 'win32' ? '.exe' : ''
}`;
const coreBinaryPath = path.join(assetsByPlatformDir, 'cores', coreBinaryName);

/**
 * Check if core binary file exists
 *
 * @returns
 */
function coreBinaryExists() {
  log.info('Checking if core binary exists: ' + coreBinaryPath);
  try {
    fs.accessSync(coreBinaryPath);
    log.info('Core binary exists');
    return true;
  } catch (e) {
    log.info('Core binary does not exist: ' + coreBinaryPath);
    return false;
  }
}

/**
 * Get Process ID of core process if core is running
 *
 * @returns
 */
async function getCorePID() {
  const modEnv = process.env;
  modEnv.Nexus_Daemon = coreBinaryName;
  let PID;

  if (process.platform == 'win32') {
    PID = (
      await exec(
        `tasklist /NH /v /fi "IMAGENAME eq ${coreBinaryName}" /fo CSV`,
        [],
        { env: modEnv }
      )
    )
      .toString()
      .split(',')[1];
    PID = PID && Number(PID.replace(/"/gm, ''));
  } else if (process.platform == 'darwin') {
    PID = (
      await exec('ps -A', [], {
        env: modEnv,
      })
    )
      .toString()
      .split('\n')
      .find(output => output.includes(coreBinaryPath));

    PID =
      PID &&
      Number(
        PID.trim()
          .split(' ')[0]
          .toString()
          .replace(/^\s+|\s+$/gm, '')
      );
  } else {
    PID = (
      await exec('ps -o pid --no-headers -p 1 -C ${Nexus_Daemon}', [], {
        env: modEnv,
      })
    )
      .toString()
      .split('\n')[1];
    PID =
      PID &&
      Number(
        PID.replace(/^\s*/gm, '')
          .split(' ')[0]
          .toString()
          .replace(/^\s+|\s+$/gm, '')
      );
  }

  if (!PID || Number.isNaN(PID) || PID < 2) {
    return null;
  } else {
    return PID;
  }
}

let config = null;

export function getCoreConfig() {
  return config;
}

/**
 * Start up the core with necessary parameters
 *
 * @memberof Core
 */
export async function startCore() {
  const settings = loadSettingsFromFile();
  const corePID = await getCorePID();
  config = null;

  if (settings.manualDaemon == true) {
    log.info('Core Manager: Manual Core mode, skipping starting core');
    throw 'Manual Core mode';
  }

  if (corePID) {
    log.info(
      'Core Manager: Nexus Core Process already running. Skipping starting core'
    );
    config = customConfig(loadNexusConf());
    return null;
  }

  //Settings will override config
  //Need to be set if changed in the settings so it can be reloaded.
  const conf = (config = customConfig({
    ...loadNexusConf(),
    verbose: settings.verboseLevel,
    dataDir: settings.coreDataDir,
  }));

  if (!coreBinaryExists()) {
    log.info('Core Manager: Core not found, please run in manual deamon mode');
    throw 'Core not found';
  }

  if (!fs.existsSync(conf.dataDir)) {
    log.info(
      'Core Manager: Data Directory path not found. Creating folder: ' +
        conf.dataDir
    );
    fs.mkdirSync(conf.dataDir);
  }

  if (settings.clearPeers) {
    if (fs.existsSync(path.join(conf.dataDir, 'addr.bak'))) {
      await deleteDirectory(path.join(conf.dataDir, 'addr.bak'));
    }
    if (fs.existsSync(path.join(conf.dataDir, 'addr'))) {
      fs.renameSync(
        path.join(conf.dataDir, 'addr'),
        path.join(conf.dataDir, 'addr.bak')
      );
    }
    updateSettingsFile({ clearPeers: false });
  }

  const params = [
    '-daemon',
    '-server',
    '-rpcthreads=4',
    '-fastsync',
    `-datadir=${conf.dataDir}`,
    `-rpcport=${conf.port}`,
    `-verbose=${conf.verbose}`,
  ];

  //Check for Testnet
  if (settings.testnetIteration) {
    params.push('-testnet=' + settings.testnetIteration);
  }

  //After core forksblocks clear out that field.
  if (settings.forkBlocks) {
    params.push('-forkblocks=' + settings.forkBlocks);
    updateSettingsFile({ forkBlocks: 0 });
  }
  if (settings.walletClean) {
    params.push('-walletclean');
    updateSettingsFile({ walletClean: false });
  }
  //Avatar is default so only add it if it is off.
  if (!settings.avatarMode) {
    params.push('-avatar=0');
  }
  // Enable mining (default is 0)
  if (settings.enableMining == true) {
    params.push('-mining=1');
    if (settings.ipMineWhitelist !== '') {
      settings.ipMineWhitelist.split(';').forEach(element => {
        params.push(`-llpallowip=${element}`);
      });
    }
  }
  // Enable staking (default is 0)
  if (settings.enableStaking == true) params.push('-stake=1');

  params.push('private=1');
  params.push('generate=somepassword');
  params.push('dns=0');

  log.info('Core Parameters: ' + params.toString());
  log.info('Core Manager: Starting core');
  try {
    const coreProcess = spawn(coreBinaryPath, params, {
      shell: false,
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    if (coreProcess) {
      log.info(
        `Core Manager: Core has started (process id: ${coreProcess.pid})`
      );
      return coreProcess.pid;
    } else {
      throw 'Core failed to start';
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Stop the core from running by sending stop command or SIGTERM to the process
 *
 * @memberof Core
 */
export async function stopCore() {
  log.info('Core Manager: Stop function called');
  const settings = loadSettingsFromFile();

  let corePID;
  corePID = await getCorePID();
  if (!corePID) {
    log.info(`Core Manager: Core has already stopped.`);
    return false;
  }

  const conf = settings.manualDaemon
    ? customConfig({
        ip: settings.manualDaemonIP,
        port: settings.manualDaemonPort,
        user: settings.manualDaemonUser,
        password: settings.manualDaemonPassword,
        dataDir: settings.manualDaemonDataDir,
      })
    : config || customConfig(loadNexusConf());

  try {
    await axios.post(
      conf.host,
      { method: 'stop', params: [] },
      {
        auth:
          conf.user && conf.password
            ? {
                username: conf.user,
                password: conf.password,
              }
            : undefined,
      }
    );
  } catch (err) {
    log.error('Error stopping core');
    log.error(err);
  }

  // Check if the core really stopped

  for (let i = 0; i < 30; i++) {
    corePID = await getCorePID();

    if (corePID) {
      log.info(
        `Core Manager: Core still running after stop command for: ${i} seconds, CorePID: ${corePID}`
      );
    } else {
      log.info(`Core Manager: Core stopped gracefully.`);
      return true;
    }
    await sleep(1000);
  }

  // If core still doesn't stop after 30 seconds, kill the process
  log.info('Core Manager: Killing process ' + corePID);
  const { env } = process;
  env.KILL_PID = corePID;
  if (process.platform == 'win32') {
    await exec(`taskkill /F /PID ${corePID}`, [], { env });
  } else {
    await exec('kill -9 $KILL_PID', [], { env });
  }
  return false;
}

/**
 * Restart the core process
 *
 * @memberof Core
 */
export async function restartCore() {
  await stopCore();
  await startCore();
}
