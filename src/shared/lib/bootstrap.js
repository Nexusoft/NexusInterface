// External
import EventEmitter from 'events';
import checkDiskSpace from 'check-disk-space';
import fs from 'fs';
import path from 'path';
import http from 'http';
import moveFile from 'move-file';
import unzip from 'unzip-stream';

// Internal
import { backupWallet } from 'lib/wallet';
import rpc from 'lib/rpc';
import store, { observeStore } from 'store';
import { startCore, stopCore } from 'lib/core';
import { showNotification, openModal } from 'lib/ui';
import { confirm, openErrorDialog, openSuccessDialog } from 'lib/dialog';
import deleteDirectory from 'utils/promisified/deleteDirectory';
import { throttled } from 'utils/universal';
import * as TYPE from 'consts/actionTypes';
import { updateSettings } from 'lib/settings';
import BootstrapModal from 'components/BootstrapModal';
import { legacyMode } from 'consts/misc';
import { isSynchronized } from 'selectors';

__ = __context('Bootstrap');

const minFreeSpace = 15 * 1000 * 1000 * 1000; // 15 GB
const getExtractDir = () => {
  const {
    settings: { coreDataDir },
  } = store.getState();
  return path.join(coreDataDir, 'recent');
};
const recentDbUrlTritium = 'http://bootstrap.nexus.io/tritium.zip';

let aborting = false;
let downloadRequest = null;

/**
 * Check if there's enough free disk space to bootstrap
 *
 * @export
 * @returns
 */
async function checkFreeSpaceForBootstrap() {
  const extractDir = getExtractDir();
  const diskSpace = await checkDiskSpace(extractDir);
  return diskSpace.free >= minFreeSpace;
}

/**
 * Start bootstrap process
 *
 * @export
 * @returns
 */
async function startBootstrap() {
  const setStatus = (step, details) => setBootstrapStatus(step, details);

  try {
    const {
      settings: { backupDirectory },
      core: { systemInfo },
    } = store.getState();
    const extractDir = getExtractDir();

    aborting = false;

    if (!systemInfo?.nolegacy) {
      setStatus('backing_up');
      await backupWallet(backupDirectory);
      if (aborting) {
        bootstrapEvents.emit('abort');
        return false;
      }
    }

    // Remove the old file if exists
    setStatus('preparing');
    await cleanUp(extractDir);

    // Stop core if it's synchronizing to avoid downloading the db twice at the same time
    if (!isSynchronized(store.getState())) {
      setStatus('stopping_core');
      await stopCore();
    }

    setStatus('downloading', {});
    // A flag to prevent bootstrap status being set back to downloading
    // when download is already done or aborted
    let downloading = true;
    const downloadProgress = throttled((details) => {
      if (downloading) setStatus('downloading', details);
    }, 1000);
    await downloadDb({ downloadProgress, extractDir });
    downloading = false;
    if (aborting) {
      bootstrapEvents.emit('abort');
      return false;
    }

    setStatus('stopping_core');
    await stopCore();

    setStatus('moving_db');
    await moveExtractedContent(extractDir);
    if (aborting) {
      bootstrapEvents.emit('abort');
      return false;
    }

    setStatus('restarting_core');
    await startCore();

    if (await shouldRescan()) {
      setStatus('rescanning');
      try {
        await rpc('rescan', []);
      } catch (err) {
        console.error(err);
      }
    }

    setStatus('cleaning_up');
    await cleanUp(extractDir);

    bootstrapEvents.emit('success');
    return true;
  } catch (err) {
    bootstrapEvents.emit('error', err);
  } finally {
    aborting = false;
    setStatus('idle');
    // Ensure to start core after completion
    await startCore();
  }
}

/**
 *
 *
 * @param {*} recentDbUrl
 * @param {*} downloadProgress
 * @returns
 */
function downloadDb({ downloadProgress, extractDir }) {
  let timerId;
  return new Promise((resolve, reject) => {
    downloadRequest = http
      .get(recentDbUrlTritium)
      .setTimeout(180000)
      .on('response', (response) => {
        const totalSize = parseInt(response.headers['content-length'], 10);

        let downloaded = 0;

        response
          .on('data', (chunk) => {
            downloaded += chunk.length;
            timerId = downloadProgress({ downloaded, totalSize });
          })
          .on('close', () => {
            resolve(extractDir);
          })
          .on('error', (err) => {
            reject(err);
          })
          .pipe(unzip.Extract({ path: extractDir }));
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('timeout', function () {
        if (downloadRequest) downloadRequest.abort();
        reject(new Error('Request timeout! ' + Date.now()));
      })
      .on('abort', async () => {
        if (fs.existsSync(extractDir)) {
          try {
            await deleteDirectory(extractDir);
          } catch (err) {
            console.error(err);
          }
        }
        resolve();
      });
  }).finally(() => {
    // Ensure downloadRequest is always cleaned up
    downloadRequest = null;
    clearTimeout(timerId);
  });
}

/**
 * Move the Extracted Database
 *
 */
async function moveExtractedContent(extractDir) {
  const {
    settings: { coreDataDir },
  } = store.getState();
  const recentContents = fs.readdirSync(extractDir);
  try {
    for (let element of recentContents) {
      if (fs.statSync(path.join(extractDir, element)).isDirectory()) {
        const newcontents = fs.readdirSync(path.join(extractDir, element));
        for (let deeperEle of newcontents) {
          if (
            fs.statSync(path.join(extractDir, element, deeperEle)).isDirectory()
          ) {
            const newerContents = fs.readdirSync(
              path.join(extractDir, element, deeperEle)
            );
            for (let evenDeeperEle of newerContents) {
              moveFile.sync(
                path.join(extractDir, element, deeperEle, evenDeeperEle),
                path.join(coreDataDir, element, deeperEle, evenDeeperEle)
              );
            }
          } else {
            moveFile.sync(
              path.join(extractDir, element, deeperEle),
              path.join(coreDataDir, element, deeperEle)
            );
          }
        }
      } else {
        moveFile.sync(
          path.join(extractDir, element),
          path.join(coreDataDir, element)
        );
      }
    }
  } catch (e) {
    console.log('Moving Extracted Content Error', e);
    throw e;
  }
}

function shouldRescan() {
  return new Promise((resolve) => {
    if (legacyMode) return true;

    const {
      core: { systemInfo },
    } = store.getState();

    if (systemInfo) {
      resolve(!systemInfo.nolegacy);
    } else {
      // Core might not be ready right away. In that case,
      // wait until systemInfo is available
      const unobserve = observeStore(
        (state) => state.core.systemInfo,
        (systemInfo) => {
          if (systemInfo) {
            unobserve();
            resolve(!systemInfo.nolegacy);
            clearTimeout(timeoutId);
          }
        }
      );
      // Wait at most 5s
      const timeoutId = setTimeout(() => {
        unobserve();
        resolve(false);
      }, 5000);
    }
  });
}

/**
 * Clean up files
 *
 * @returns
 */
async function cleanUp(extractDir) {
  if (fs.existsSync(extractDir)) {
    await deleteDirectory(extractDir);
  }
}

const setBootstrapStatus = (step, details) => {
  store.dispatch({
    type: TYPE.BOOTSTRAP_STATUS,
    payload: { step, details },
  });
};

/**
 * Public API
 * =============================================================================
 */

export const bootstrapEvents = new EventEmitter();

/**
 * Bootstrap Modal element
 *
 * @export
 * @param {*} [{ suggesting }={}]
 * @returns
 */
export async function bootstrap({ suggesting } = {}) {
  // Only one instance at the same time
  const state = store.getState();
  if (state.bootstrap.step !== 'idle') return;

  setBootstrapStatus('prompting');

  const testPriv =
    state.core.systemInfo.private || state.core.systemInfo.testnet;
  // if Private or on Testnet, prevent bootstrapping
  if (testPriv) {
    openErrorDialog({
      message: __('Can not Bootstrap on Testnet/Private networks.'),
    });
    setBootstrapStatus('idle');
    return;
  }

  const enoughSpace = await checkFreeSpaceForBootstrap();
  if (!enoughSpace) {
    if (!suggesting) {
      openErrorDialog({
        message: __(
          'Not enough disk space! Minimum 15GB of free space is required.'
        ),
      });
    }
    setBootstrapStatus('idle');
    return;
  }

  const confirmed = await confirm({
    question: __('Download recent database?'),
    note: __(
      'Downloading a recent version of the database might reduce the time it takes to synchronize your wallet'
    ),
    labelYes: __("Yes, let's bootstrap it"),
    labelNo: __('No, let it sync'),
    skinNo: suggesting ? 'danger' : undefined,
    style: { width: 530 },
  });
  if (confirmed) {
    startBootstrap();
    openModal(BootstrapModal);
  } else {
    if (suggesting) {
      updateSettings({
        bootstrapSuggestionDisabled: true,
      });
    }
    setBootstrapStatus('idle');
  }
}

/**
 * Abort the bootstrap process
 *
 * @export
 */
export function abortBootstrap() {
  aborting = true;
  if (downloadRequest) downloadRequest.abort();
}

/**
 * Register bootstrap events listeners
 *
 * @export
 */
export function prepareBootstrap() {
  bootstrapEvents.on('abort', () =>
    showNotification(__('Bootstrap process has been aborted'), 'error')
  );
  bootstrapEvents.on('error', (err) => {
    console.error(err);
    openErrorDialog({
      message: __('Error bootstrapping recent database'),
      note: typeof err === 'string' ? err : err.message || __('Unknown error'),
    });
  });
  bootstrapEvents.on('success', () =>
    openSuccessDialog({
      message: __('Recent database has been successfully bootstrapped'),
    })
  );
}
