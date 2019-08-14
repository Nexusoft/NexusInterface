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
import { startCore, stopCore } from 'actions/core';
import { setBootstrapStatus } from 'actions/bootstrap';
import {
  showNotification,
  openErrorDialog,
  openSuccessDialog,
} from 'actions/overlays';
import extractTarball from 'utils/promisified/extractTarball';
import sleep from 'utils/promisified/sleep';
import { throttled } from 'utils/misc';

const fileLocation = path.join(walletDataDir, 'recent.tar.gz');
const extractDest = path.join(coreDataDir, 'recent');
const recentDbUrlLegacy =
  'https://nexusearth.com/bootstrap/LLD-Database/recent.tar.gz';
const recentDbUrlTritium =
  'https://nexusearth.com/bootstrap/tritium/bootstrap.tar.gz'; // Tritium Bootstrap URL

let aborting = false;
let downloadRequest = null;

export const bootstrapEvents = new EventEmitter();

/**
 * Register bootstrap events listeners
 *
 * @export
 * @param {*} { dispatch }
 */
export function initializeBootstrapEvents({ dispatch }) {
  bootstrapEvents.on('abort', () =>
    dispatch(
      showNotification(__('Bootstrap process has been aborted'), 'error')
    )
  );
  bootstrapEvents.on('error', err =>
    dispatch(
      openErrorDialog({
        message: __('Error bootstrapping recent database'),
        note: err.message || 'Unknown error',
      })
    )
  );
  bootstrapEvents.on('success', () =>
    dispatch(
      openSuccessDialog({
        message: __('Recent database has been successfully bootstrapped'),
      })
    )
  );
}

/**
 * Check if there's enough free disk space to bootstrap
 *
 * @export
 * @returns
 */
export async function checkFreeSpaceForBootstrap() {
  const diskSpace = await checkDiskSpace(coreDataDir);
  return diskSpace.free >= 15 * 1000 * 1000 * 1000; // 15 GB
}

/**
 * Start bootstrap process
 *
 * @export
 * @param {*} { dispatch, getState }
 * @returns
 */
export async function startBootstrap({ dispatch, getState }) {
  const setStatus = (step, details) =>
    dispatch(setBootstrapStatus(step, details));

  try {
    const {
      core: { info },
      settings: { backupDirectory },
    } = getState();
    const recentDbUrl =
      info.version.includes('0.3') || parseFloat(info.version) >= 3
        ? recentDbUrlTritium
        : recentDbUrlLegacy;

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
    await dispatch(stopCore());

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

    await dispatch(stopCore());
    setStatus('restarting_core');
    await dispatch(startCore());

    setStatus('rescanning');
    await rescan();

    cleanUp();

    bootstrapEvents.emit('success');
    return true;
  } catch (err) {
    bootstrapEvents.emit('error', err);
  } finally {
    const lastStep = getState().bootstrap.step;
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
      await dispatch(startCore());
    }
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
