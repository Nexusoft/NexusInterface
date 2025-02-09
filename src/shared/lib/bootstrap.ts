// External
import EventEmitter from 'events';
import checkDiskSpace from 'check-disk-space';
import fs from 'fs';
import path from 'path';
import http, { ClientRequest } from 'http';
import unzip from 'unzip-stream';
import { atom } from 'jotai';

// Internal
import { store, subscribe } from 'lib/store';
import { startCore, stopCore } from 'lib/core';
import { coreInfoQuery, isSynchronized } from './coreInfo';
import { showNotification, openModal } from 'lib/ui';
import { confirm, openErrorDialog, openSuccessDialog } from 'lib/dialog';
import { rm as deleteDirectory } from 'fs/promises';
import { throttled } from 'utils/universal';
import move from 'utils/move';
import { updateSettings, settingAtoms, settingsAtom } from 'lib/settings';
import BootstrapModal from 'components/BootstrapModal';

__ = __context('Bootstrap');

export type BootstrapStep =
  | 'idle'
  | 'prompting'
  | 'backing_up'
  | 'preparing'
  | 'downloading'
  | 'extracting'
  | 'stopping_core'
  | 'moving_db'
  | 'restarting_core'
  | 'rescanning'
  | 'cleaning_up';

export interface BootstrapDownloadDetails {
  downloaded: number;
  totalSize?: number;
}

export interface BootstrapStatus {
  step: BootstrapStep;
  details?: BootstrapDownloadDetails;
}

const minFreeSpace = 15 * 1000 * 1000 * 1000; // 15 GB
const getExtractDir = () => {
  const coreDataDir = store.get(settingAtoms.coreDataDir);
  return path.join(coreDataDir, 'recent');
};
const recentDbUrlTritium = 'http://bootstrap.nexus.io/tritium.zip';

let aborting = false;
let downloadRequest: ClientRequest | null = null;

export const bootstrapStatusAtom = atom<BootstrapStatus>({
  step: 'idle',
  details: undefined,
});

/**
 * Check if there's enough free disk space to bootstrap
 */
async function checkFreeSpaceForBootstrap() {
  const extractDir = getExtractDir();
  const diskSpace = await checkDiskSpace(extractDir);
  return diskSpace.free >= minFreeSpace;
}

/**
 * Start bootstrap process
 */
async function startBootstrap() {
  try {
    const coreDataDir = store.get(settingAtoms.coreDataDir);
    const extractDir = getExtractDir();

    aborting = false;

    // Remove the old file if exists
    setStatus('preparing');
    await cleanUp(extractDir);

    // Stop core if it's synchronizing to avoid downloading the db twice at the same time
    if (!isSynchronized()) {
      setStatus('stopping_core');
      await stopCore();
    }

    setStatus('downloading', { downloaded: 0 });
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
    await move(extractDir, coreDataDir);
    if (aborting) {
      bootstrapEvents.emit('abort');
      return false;
    }

    setStatus('restarting_core');
    await startCore();

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
  return false;
}

/**
 * Downloads the recent database from the given URL, extracts it to the given
 * directory and returns the path to the extracted directory.
 *
 * @param {Object} options - Options to pass to the function
 * @param {Function} options.downloadProgress - A function that will be called
 *   with the progress of the download
 * @param {String} options.extractDir - The directory to extract the database to
 * @returns {Promise<String | null>} A promise that resolves to the path to the
 *   extracted directory if the download and extraction is successful, or
 *   `null` if the download is aborted.
 */
function downloadDb({
  downloadProgress,
  extractDir,
}: {
  downloadProgress: (details: BootstrapDownloadDetails) => NodeJS.Timeout;
  extractDir: string;
}) {
  let timerId: NodeJS.Timeout;
  return new Promise<string | null>((resolve, reject) => {
    downloadRequest = http
      .get(recentDbUrlTritium, { insecureHTTPParser: true })
      .setTimeout(180000)
      .on('response', (response) => {
        const totalSize = parseInt(
          response.headers['content-length'] || '',
          10
        );

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
            await deleteDirectory(extractDir, { recursive: true, force: true });
          } catch (err) {
            console.error(err);
          }
        }
        resolve(null);
      });
  }).finally(() => {
    // Ensure downloadRequest is always cleaned up
    downloadRequest = null;
    clearTimeout(timerId);
  });
}

/**
 * Clean up files
 */
async function cleanUp(extractDir: string) {
  if (fs.existsSync(extractDir)) {
    await deleteDirectory(extractDir, { recursive: true, force: true });
  }
}

const setStatus = (step: BootstrapStep, details?: BootstrapDownloadDetails) => {
  store.set(bootstrapStatusAtom, { step, details });
};

subscribe(coreInfoQuery.valueAtom, async (coreInfo) => {
  const coreConnected = !!coreInfo;
  const { bootstrapSuggestionDisabled, manualDaemon } = store.get(settingsAtom);
  const bootstrapStatus = store.get(bootstrapStatusAtom);

  if (coreConnected) {
    if (
      !bootstrapSuggestionDisabled &&
      bootstrapStatus.step === 'idle' &&
      !manualDaemon &&
      !coreInfo?.litemode &&
      coreInfo?.syncing !== false &&
      coreInfo.syncing.completed < 50 &&
      coreInfo.syncing.completed >= 0 &&
      !coreInfo?.private &&
      !coreInfo?.testnet
    ) {
      bootstrap({ suggesting: true });
    }
  }
});

/**
 * Public API
 * =============================================================================
 */

export const bootstrapEvents = new EventEmitter();

/**
 * Download recent database from tritium bootstrap server, extract it to
 * the given directory and restart Nexus Core.
 *
 * @param {Object} options - Options to pass to the function
 * @param {boolean} options.suggesting - Whether this is a suggestion or not.
 *   If it is a suggestion, a confirmation dialog will be shown and the
 *   user will have the option to decline the suggestion.
 * @returns {Promise<void>} A promise that resolves when the bootstrap
 *   process is complete.
 */
export async function bootstrap(options?: { suggesting?: boolean }) {
  const { suggesting } = options || {};
  // Only one instance at the same time
  const status = store.get(bootstrapStatusAtom);
  if (status.step !== 'idle') return;

  setStatus('prompting');

  const coreInfo = store.get(coreInfoQuery.valueAtom);
  const testPriv = coreInfo?.private || coreInfo?.testnet;
  // if Private or on Testnet, prevent bootstrapping
  if (testPriv) {
    openErrorDialog({
      message: __('Can not Bootstrap on Testnet/Private networks.'),
    });
    setStatus('idle');
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
    setStatus('idle');
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
      updateSettings({ bootstrapSuggestionDisabled: true });
    }
    setStatus('idle');
  }
}

/**
 * Aborts the current bootstrap process by setting the aborting flag to true
 * and aborting the active download request if it exists.
 */
export function abortBootstrap() {
  aborting = true;
  if (downloadRequest) downloadRequest.abort();
}

/**
 * Register bootstrap events listeners
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
