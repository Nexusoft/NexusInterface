// External
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
import extractTarball from 'utils/promisified/extractTarball';
import sleep from 'utils/promisified/sleep';

let recentDbUrl = '';
const recentDbUrlLegacy =
  'https://nexusearth.com/bootstrap/LLD-Database/recent.tar.gz';
//
const recentDbUrlTritium =
  'https://nexusearth.com/bootstrap/tritium/bootstrap.tar.gz'; // Tritium Bootstrap URL
// Recent database download location
const fileLocation = path.join(walletDataDir, 'recent.tar.gz');

const extractDest = path.join(coreDataDir, 'recent');

/**
 * Low Level Functions for the Bootstrapper
 *
 * @export
 * @class Bootstrapper
 */
export default class Bootstrapper {
  /**
   * PRIVATE PROPERTIES
   */
  _onProgress = () => {};
  _onAbort = () => {};
  _onError = () => {};
  _onFinish = () => {};

  _aborted = false;
  _currentProgress = {
    step: null,
    details: {},
  };

  /**
   * PUBLIC METHODS
   */

  /**
   * Check If the User has enough space
   *
   * @static
   * @param {*} gigsToCheck
   * @returns
   * @memberof Bootstrapper
   */
  static async checkFreeSpace(gigsToCheck) {
    const diskSpace = await checkDiskSpace(coreDataDir);
    return diskSpace.free >= gigsToCheck * 1000000000;
  }
  /**
   * Check if the user has enough space for bootstrapping
   *
   * @static
   * @returns
   * @memberof Bootstrapper
   */
  static async checkBootStrapFreeSpace() {
    const freeSpaceForBootStrap = 20000000000; //20gb
    const diskSpace = await checkDiskSpace(coreDataDir);
    return diskSpace.free >= freeSpaceForBootStrap;
  }

  /**
   * Start the bootstrapper
   *
   * @param {*} { backupFolder, startCore, stopCore }
   * @returns
   * @memberof Bootstrapper
   */
  async start({ backupFolder, startCore, stopCore }) {
    try {
      const getinfo = await rpc('getinfo', []);

      if (getinfo.version.includes('0.3') || parseFloat(getinfo.version) >= 3) {
        recentDbUrl = recentDbUrlTritium;
      } else {
        recentDbUrl = recentDbUrlLegacy;
      }
      if (this._aborted) return;

      this._progress('backing_up');
      await backupWallet(backupFolder);
      if (this._aborted) return;

      // Remove the old file if exists

      if (fs.existsSync(fileLocation)) {
        fs.unlinkSync(fileLocation, err => {
          if (err) throw err;
        });
      }

      if (fs.existsSync(extractDest)) {
        console.log('Removing the old file');
        rimraf.sync(extractDest, {}, () => console.log('done'));
        this._cleanUp();
      }

      this._progress('downloading', {});
      await this._downloadCompressedDb();
      if (this._aborted) return;

      this._progress('extracting');
      await this._extractDb();
      if (this._aborted) return;

      this._progress('stopping_core');
      await stopCore();
      if (this._aborted) return;

      this._progress('moving_db');
      await this._moveExtractedContent();

      this._progress('restarting_core');
      await startCore();

      this._progress('rescanning');
      await this._rescan();

      this._cleanUp();

      this._onFinish();
    } catch (err) {
      this._onError(err);
    } finally {
      if (
        ['stopping_core', 'moving_db', 'restarting_core'].includes(
          this._currentProgress
        )
      ) {
        await startCore();
      }
    }
  }

  /**
   * Register Events to the bootstrapper
   *
   * @param {*} events
   * @memberof Bootstrapper
   */
  registerEvents(events) {
    this._onProgress = events.onProgress || this._onProgress;
    this._onAbort = events.onAbort || this._onAbort;
    this._onError = events.onError || this._onError;
    this._onFinish = events.onFinish || this._onFinish;
  }

  /**
   * Abort the Bootstrapper
   *
   * @memberof Bootstrapper
   */
  abort() {
    this._aborted = true;
    if (this.request) this.request.abort();
    this._onAbort();
  }

  /**
   * Return Current Progress
   *
   * @returns
   * @memberof Bootstrapper
   */
  currentProgress() {
    return this._currentProgress;
  }

  /**
   * PRIVATE METHODS
   */
  /**
   * Show progress
   *
   * @param {*} step
   * @param {*} details
   * @memberof Bootstrapper
   */
  _progress(step, details) {
    this._currentProgress = { step, details };
    this._onProgress(step, details);
  }

  /**
   * Download The Database
   *
   * @returns
   * @memberof Bootstrapper
   */
  async _downloadCompressedDb() {
    const promise = new Promise((resolve, reject) => {
      this.request = https
        .get(recentDbUrl)
        .setTimeout(60000)
        .on('response', response => {
          const totalSize = parseInt(response.headers['content-length'], 10);
          let downloaded = 0;

          response.on('data', chunk => {
            downloaded += chunk.length;
            this._progress('downloading', { downloaded, totalSize });
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
          if (this.request) this.request.abort();
          reject(new Error('Request timeout!'));
        })
        .on('abort', function() {
          if (fs.existsSync(fileLocation)) {
            fs.unlink(fileLocation, err => {
              if (err) console.error(err);
            });
          }
          resolve();
        });
    });

    // Ensure this.request is always cleaned up
    try {
      return promise;
    } finally {
      this.request = null;
    }
  }

  /**
   * Extract the Database
   *
   * @returns
   * @memberof Bootstrapper
   */
  async _extractDb() {
    return await extractTarball(fileLocation, extractDest);
  }

  /**
   * Move the Extracted Database
   *
   * @memberof Bootstrapper
   */
  async _moveExtractedContent() {
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
      console.log('Moveing Extracted Content Error', e);
    }
  }

  async _rescan() {
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
      }
    }
  }

  /**
   * Clean Up
   *
   * @memberof Bootstrapper
   */
  _cleanUp() {
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
}
