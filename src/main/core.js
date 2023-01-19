import child_process from 'child_process';
import spawn from 'cross-spawn';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';

import { assetsByPlatformDir } from 'consts/paths';

const coreBinaryName = `nexus-${process.platform}-${process.arch}${
  process.platform === 'win32' ? '.exe' : ''
}`;
const coreBinaryPath = path.join(assetsByPlatformDir, 'cores', coreBinaryName);

const exec = (command, options) =>
  new Promise((resolve, reject) => {
    child_process.exec(command, options, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });

/**
 * Check if core binary file exists
 *
 * @returns {boolean} Does the core exist at coreBinaryPath
 */
export function coreBinaryExists() {
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
 * @returns {string} PID
 * @memberof Core
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
      .find((output) => output.includes(coreBinaryPath));

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

/**
 * Returns true if the PID is found.
 * @returns { boolean } If the core is running.
 * @memberof Core
 */
export async function isCoreRunning() {
  const pid = await getCorePID();
  return !!pid;
}

/**
 * Start up the core with necessary parameters
 *
 * @memberof Core
 */
export function startCore(params) {
  log.info('Core Parameters: ' + (params && params.join(' ')));
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
 * Find the Core's PID and then kill the task.
 * @memberof Core
 */
export async function killCoreProcess() {
  const corePID = await getCorePID();
  log.info('Core Manager: Killing process ' + corePID);
  const { env } = process;
  env.KILL_PID = corePID;
  if (process.platform == 'win32') {
    await exec(`taskkill /F /PID ${corePID}`, [], { env });
  } else {
    await exec('kill -9 $KILL_PID', [], { env });
  }
}

/**
 * Execute either an API call or RPC call by using the shell to execute the core path plus a command.
 * @param {string} command API/RPC command to run
 * @returns {object} the result of the command
 * @memberof Core
 */
export async function executeCommand(command) {
  try {
    const result = await exec(`"${coreBinaryPath}" -noapiauth ${command}`);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
