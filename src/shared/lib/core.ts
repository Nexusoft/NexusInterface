import { store } from 'lib/store';
import { coreConfigAtom } from 'lib/coreConfig';
import {
  clearCoreConnectionError,
  coreInfoPausedAtom,
  setCoreConnectionError,
} from 'lib/coreInfo';
import { settingsAtom } from 'lib/settings';

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
 * Main owns the complete graceful-stop, force-kill, and confirmation sequence
 * under the lifecycle lock.
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
    const result = (await window.nexusElectron.core.stop()) as {
      stopped?: boolean;
      reason?: string;
    };
    if (!result?.stopped) {
      throw new Error(
        `Nexus Core shutdown could not be confirmed${
          result?.reason ? ` (${result.reason})` : ''
        }`
      );
    }
  } catch (error) {
    if (!forRestart) store.set(coreInfoPausedAtom, false);
    setCoreConnectionError(error);
    throw error;
  }
};

/**
 * Restart Nexus Core
 */
export const restartCore = async () => {
  try {
    const restartResult =
      (await window.nexusElectron.core.restart()) as CoreStartResult;
    store.set(
      coreConfigAtom,
      await window.nexusElectron.core.getConfiguration()
    );
    if (restartResult?.apiReachable === false) {
      setCoreConnectionError(
        restartResult.apiError ||
          'Nexus Core started but the API is not reachable yet'
      );
    } else {
      clearCoreConnectionError();
    }
    store.set(coreInfoPausedAtom, false);
    return true;
  } catch (error) {
    store.set(coreInfoPausedAtom, false);
    setCoreConnectionError(error);
    console.error('core.restart.failed', error);
    throw error;
  }
};

export const resyncLiteCore = async () => {
  store.set(coreInfoPausedAtom, true);
  clearCoreConnectionError();
  try {
    return await window.nexusElectron.core.resyncLiteDatabase();
  } catch (error) {
    setCoreConnectionError(error);
    throw error;
  } finally {
    store.set(coreInfoPausedAtom, false);
  }
};
