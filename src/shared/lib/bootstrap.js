// External
import EventEmitter from 'events';
import checkDiskSpace from 'check-disk-space';
import fs from 'fs';
import path from 'path';
import https from 'https';
import moveFile from 'move-file';
import rimraf from 'rimraf';

// Internal
import { coreDataDir } from 'consts/paths';
import { walletDataDir } from 'consts/paths';
import { backupWallet } from 'lib/wallet';
import rpc from 'lib/rpc';
import store from 'store';
import { startCore, stopCore } from 'lib/core';
import {
  showNotification,
  openErrorDialog,
  openSuccessDialog,
  openModal,
} from 'lib/ui';
import confirm from 'utils/promisified/confirm';
import extractTarball from 'utils/promisified/extractTarball';
import sleep from 'utils/promisified/sleep';
import { throttled } from 'utils/universal';
import * as TYPE from 'consts/actionTypes';
import { walletEvents } from 'lib/wallet';
import { updateSettings } from 'lib/settings';
import BootstrapModal from 'components/BootstrapModal';

__ = __context('Bootstrap');

const fileLocation = path.join(walletDataDir, 'recent.tar.gz');
const extractDest = path.join(coreDataDir, 'recent');
const recentDbUrlTritium = 'https://nexus.io/bootstrap/tritium/tritium.tar.gz'; // Tritium Bootstrap URL

let aborting = false;
let downloadRequest = null;

/**
 * Check if there's enough free disk space to bootstrap
 *
 * @export
 * @returns
 */
async function checkFreeSpaceForBootstrap() {
  const diskSpace = await checkDiskSpace(coreDataDir);
  return diskSpace.free >= 15 * 1000 * 1000 * 1000; // 15 GB
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
      core: { info },
      settings: { backupDirectory },
    } = store.getState();
    const recentDbUrl = recentDbUrlTritium;

    aborting = false;
    setStatus('backing_up');
    await backupWallet(backupDirectory);
    if (aborting) {
      bootstrapEvents.emit('abort');
      return false;
    }

    // Remove the old file if exists
    if (fs.existsSync(fileLocation)) {
      fs.unlinkSync(fileLocation, err => {
        if (err) throw err;
      });
    }
    if (fs.existsSync(extractDest)) {
      console.log('Removing the old file');
      rimraf.sync(extractDest, {}, () => console.log('done'));
      cleanUp();
    }

    setStatus('stopping_core');
    await stopCore();

    setStatus('downloading', {});
    // A flag to prevent bootstrap status being set back to downloading
    // when download is already done or aborted
    let downloading = true;
    const downloadProgress = throttled(details => {
      if (downloading) setStatus('downloading', details);
    }, 1000);
    await downloadDb(recentDbUrl, downloadProgress);
    downloading = false;
    if (aborting) {
      bootstrapEvents.emit('abort');
      return false;
    }

    setStatus('extracting');
    await extractDb();
    if (aborting) {
      bootstrapEvents.emit('abort');
      return false;
    }

    setStatus('moving_db');
    await moveExtractedContent();
    if (aborting) {
      bootstrapEvents.emit('abort');
      return false;
    }

    await stopCore();
    setStatus('restarting_core');
    await startCore();

    setStatus('rescanning');
    await rescan();

    cleanUp();

    bootstrapEvents.emit('success');
    return true;
  } catch (err) {
    bootstrapEvents.emit('error', err);
  } finally {
    const lastStep = store.getState().bootstrap.step;
    aborting = false;
    setStatus('idle');
    if (
      [
        'stopping_core',
        'downloading',
        'extracting',
        'moving_db',
        'restarting_core',
      ].includes(lastStep)
    ) {
      await startCore();
    }
  }
}

/**
 *
 *
 * @param {*} recentDbUrl
 * @param {*} downloadProgress
 * @returns
 */
async function downloadDb(recentDbUrl, downloadProgress) {
  const promise = new Promise((resolve, reject) => {
    let timerId;
    downloadRequest = https
      .get(recentDbUrl)
      .setTimeout(60000)
      .on('response', response => {
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloaded = 0;

        response.on('data', chunk => {
          downloaded += chunk.length;
          timerId = downloadProgress({ downloaded, totalSize });
        });

        response.pipe(
          fs
            .createWriteStream(fileLocation, { autoClose: true })
            .on('error', e => {
              reject(e);
            })
            .on('close', () => {
              resolve();
            })
        );
      })
      .on('error', e => reject(e))
      .on('timeout', function() {
        if (downloadRequest) downloadRequest.abort();
        reject(new Error('Request timeout!'));
      })
      .on('abort', function() {
        clearTimeout(timerId);
        if (fs.existsSync(fileLocation)) {
          fs.unlink(fileLocation, err => {
            if (err) console.error(err);
          });
        }
        resolve();
      });
  });

  // Ensure downloadRequest is always cleaned up
  try {
    return await promise;
  } finally {
    downloadRequest = null;
  }
}

/**
 * Extract the Database
 *
 * @returns
 */
function extractDb() {
  return extractTarball(fileLocation, extractDest);
}

/**
 * Move the Extracted Database
 *
 */
async function moveExtractedContent() {
  const recentContents = fs.readdirSync(extractDest);
  try {
    for (let element of recentContents) {
      if (fs.statSync(path.join(extractDest, element)).isDirectory()) {
        const newcontents = fs.readdirSync(path.join(extractDest, element));
        for (let deeperEle of newcontents) {
          if (
            fs
              .statSync(path.join(extractDest, element, deeperEle))
              .isDirectory()
          ) {
            const newerContents = fs.readdirSync(
              path.join(extractDest, element, deeperEle)
            );
            for (let evenDeeperEle of newerContents) {
              moveFile.sync(
                path.join(extractDest, element, deeperEle, evenDeeperEle),
                path.join(coreDataDir, element, deeperEle, evenDeeperEle)
              );
            }
          } else {
            moveFile.sync(
              path.join(extractDest, element, deeperEle),
              path.join(coreDataDir, element, deeperEle)
            );
          }
        }
      } else {
        moveFile.sync(
          path.join(extractDest, element),
          path.join(coreDataDir, element)
        );
      }
    }
    console.log('Moved Successfully');
  } catch (e) {
    console.log('Moving Extracted Content Error', e);
    throw e;
  }
}

/**
 * Rescan wallet
 *
 * @returns
 */
async function rescan() {
  let count = 1;
  // Sometimes the core RPC server is not yet ready after restart, so rescan may fail
  // Retry up to 5 times in 5 seconds
  while (count <= 5) {
    try {
      await rpc('rescan', []);
      return;
    } catch (err) {
      console.error('Rescan failed', err);
      count++;
      if (count < 5) await sleep(1000);
      else throw err;
    }
  }
}

/**
 * Clean up files
 *
 * @returns
 */
function cleanUp() {
  // Clean up asynchornously
  setTimeout(() => {
    if (fs.existsSync(fileLocation)) {
      fs.unlink(fileLocation, err => {
        if (err) {
          console.error(err);
        }
      });
    }

    if (fs.existsSync(extractDest)) {
      rimraf.sync(extractDest, {}, () => console.log('done'));
    }
  }, 0);
  return;
}

const setBootstrapStatus = (step, details) => {
  store.dispatch({
    type: TYPE.BOOTSTRAP_STATUS,
    payload: { step, details },
  });
};

/**
 * Register bootstrap events listeners
 *
 * @export
 */
walletEvents.once('post-render', function() {
  bootstrapEvents.on('abort', () =>
    showNotification(__('Bootstrap process has been aborted'), 'error')
  );
  bootstrapEvents.on('error', err => {
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
});

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
