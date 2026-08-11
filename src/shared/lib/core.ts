import { store } from 'lib/store';
import { coreConfigAtom } from 'lib/coreConfig';
import {
  clearCoreConnectionError,
  coreInfoPausedAtom,
  setCoreConnectionError,
} from 'lib/coreInfo';
import { callAPI } from 'lib/api';
import { settingsAtom } from 'lib/settings';
import sleep from 'utils/sleep';

export type CoreStartResult = {
  started?: boolean;
  reason?: string;
  apiReachable?: boolean;
  apiError?: string;
  pid?: number;
};

/**
 * Start Nexus Core
 */
export const startCore = async () => {
  console.info('core.start.requested');
  try {
    // Check remote core mode
    const settings = store.get(settingsAtom);
    if (settings.manualDaemon) {
      console.info('Core Manager: Remote Core mode, skipping starting core');
      // Still load public connection metadata for UI consumers.
      store.set(
        coreConfigAtom,
        await window.nexusElectron.core.getConfiguration()
      );
      store.set(coreInfoPausedAtom, false);
      clearCoreConnectionError();
      return;
    }

    const status = (await window.nexusElectron.core.getStatus()) as {
      exists?: boolean;
      running?: boolean;
      status?: { error?: string };
    };
    console.info('core.start.status', {
      exists: !!status.exists,
      running: !!status.running,
      error: status.status?.error,
    });
    if (!status.exists) {
      throw new Error(status.status?.error || 'Nexus Core binary not found');
    }

    // Always delegate to main. If a Core process is already running, main probes
    // the configured local API and restarts Core when P2P is up but the API bind
    // / auth / port does not match the wallet configuration.
    const startResult = (await window.nexusElectron.core.start()) as CoreStartResult;
    console.info('core.start.result', {
      started: !!startResult?.started,
      reason: startResult?.reason,
      apiReachable: startResult?.apiReachable,
      apiError: startResult?.apiError,
      pid: startResult?.pid,
    });
    if (status.running && startResult?.reason === 'already-running') {
      console.info(
        'Core Manager: Nexus Core Process already running with a reachable API'
      );
    } else if (startResult?.started) {
      console.info('Core Manager: Nexus Core start requested by wallet');
    }

    if (startResult?.apiReachable === false) {
      const message =
        startResult.apiError ||
        'Nexus Core started but the API is not reachable yet';
      console.error('core.api.wait.timeout', message);
      setCoreConnectionError(message);
    } else {
      clearCoreConnectionError();
    }

    store.set(
      coreConfigAtom,
      await window.nexusElectron.core.getConfiguration()
    );
    store.set(coreInfoPausedAtom, false);
  } catch (error) {
    setCoreConnectionError(error);
    console.error('core.start.failed', error);
    throw error;
  }
};

/**
 * Stop Nexus Core
 *
 * IMPORTANT: A disconnected Core cannot receive system/stop. The previous
 * implementation wrapped the whole sequence in try/catch, so a failed API
 * stop skipped the force-kill path and left an orphaned nexus process that
 * required an OS-level kill. Always fall through to process kill when the
 * Core binary is still running.
 */
export const stopCore = async (forRestart?: boolean) => {
  console.info('Core Manager: Stop function called');
  const { manualDaemon } = store.get(settingsAtom);

  // Pause info polling before shutdown so transient ECONNREFUSED during stop
  // is not recorded as a connection failure in the UI.
  if (!forRestart) {
    store.set(coreInfoPausedAtom, true);
    clearCoreConnectionError();
  }

  if (manualDaemon) {
    return;
  }

  try {
    await callAPI('system/stop');
  } catch (err) {
    console.info(
      'Core Manager: Graceful stop request failed; checking if process is still running',
      err
    );
  }

  // Wait for core to gracefully stop for 10 seconds, then force-kill.
  let coreStillRunning = false;
  for (let i = 0; i < 10; i++) {
    try {
      const coreStatus = (await window.nexusElectron.core.getStatus()) as {
        running?: boolean;
      };
      coreStillRunning = !!coreStatus.running;
    } catch {
      // Status IPC failure should not prevent a kill attempt.
      coreStillRunning = true;
    }
    if (coreStillRunning) {
      console.info(
        `Core Manager: Core still running after stop command for: ${i} seconds`
      );
    } else {
      console.info(`Core Manager: Core stopped gracefully.`);
      break;
    }
    await sleep(1000);
  }

  if (coreStillRunning) {
    try {
      await window.nexusElectron.core.kill();
    } catch (err) {
      console.error('Core Manager: Failed to kill Core process', err);
    }
  }
};

/**
 * Restart Nexus Core
 */
export const restartCore = async () => {
  await stopCore(true);
  await startCore();
  store.set(coreInfoPausedAtom, false);
};
