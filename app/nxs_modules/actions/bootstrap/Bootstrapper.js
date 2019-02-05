// External
import checkDiskSpace from 'check-disk-space';
import fs from 'fs';
import path from 'path';
import https from 'https';
import electron from 'electron';
import tarball from 'tarball-extract';
import moveFile from 'move-file';
import rimraf from 'rimraf';
// Internal
import configuration from 'api/configuration';
import { backupWallet } from 'api/wallet';

const recentDbUrl = 'https://nexusearth.com/bootstrap/tritium/tritium.tar.gz';
// 'https://nexusearth.com/bootstrap/LLD-Database/recent.tar.gz';

// Recent database download location
const fileLocation = path.join(
  configuration.GetAppDataDirectory(),
  'recent.tar.gz'
);

const dataDir = configuration.GetCoreDataDir();
const extractDest = path.join(dataDir, 'recent');

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
    const diskSpace = await checkDiskSpace(configuration.GetCoreDataDir());
    return diskSpace.free >= (gigsToCheck * 1000000000);
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
    const diskSpace = await checkDiskSpace(configuration.GetCoreDataDir());
    return diskSpace.free >= freeSpaceForBootStrap;
  }


  /**
   * Start the bootstrapper
   *
   * @param {*} { backupFolder, clearOverviewVariables }
   * @returns
   * @memberof Bootstrapper
   */
  async start({ backupFolder, clearOverviewVariables }) {
    try {
      this._progress('backing_up');
      await backupWallet(backupFolder);
      if (this._aborted) return;

      this._progress('stopping_core');
      await electron.remote.getGlobal('core').stop();
      if (this._aborted) return;

      clearOverviewVariables();
      // Remove the old file if exists

      if (fs.existsSync(fileLocation)) {
        fs.unlinkSync(fileLocation, err => {
          if (err) throw err;
        });
      }

      if (fs.existsSync(extractDest)) {
        console.log('removing the old file');
        rimraf.sync(extractDest);
        this._cleanUp();
      }

      this._progress('downloading', {});
      await this._downloadCompressedDb();
      if (this._aborted) return;

      this._progress('extracting');
      await this._extractDb();
      if (this._aborted) return;

      this._progress('finalizing');
      await this._moveExtractedContent();

      this._cleanUp();

      this._onFinish();
    } catch (err) {
      this._onError(err);
    } finally {
      electron.remote.getGlobal('core').start();
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
      console.log(fileLocation);
      const file = fs.createWriteStream(fileLocation);
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

          response.pipe(file);
          file.on('finish', function() {
            file.close(resolve);
          });
        })
        .on('error', reject)
        .on('timeout', function() {
          if (this.request) this.request.abort();
          reject(new Error('Request timeout!'));
        })
        .on('abort', function() {
          if (fs.existsSync(fileLocation)) {
            fs.unlink(fileLocation, err => {
              console.error(err);
            });
          }
          resolve();
        });
    });

    // Ensure this.request is always cleaned up
    try {
      return await promise;
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
    return new Promise((resolve, reject) => {
      tarball.extractTarball(fileLocation, extractDest, err => {
        if (err) reject(err);
        else resolve();
      });
    });
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
                  path.join(dataDir, element, deeperEle, evenDeeperEle)
                );
              }
            } else {
              moveFile.sync(
                path.join(extractDest, element, deeperEle),
                path.join(dataDir, element, deeperEle)
              );
            }
          }
        } else {
          moveFile.sync(
            path.join(extractDest, element),
            path.join(dataDir, element)
          );
        }
      }
    } catch (e) {
      console.log(e);
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
          console.error(err);
        });
      }

      if (fs.existsSync(extractDest)) {
        rimraf.sync(extractDest);
        //   // const recentContents = fs.readdirSync(extractDest);
        //   // recentContents
        //   //   .filter(child =>
        //   //     fs.statSync(path.join(extractDest, child)).isDirectory()
        //   //   )
        //   //   .forEach(subFolder => {
        //   //     fs.readdirSync(path.join(extractDest, subFolder))
        //   //       .filter(grandchild =>
        //   //         fs
        //   //           .statSync(path.join(extractDest, subFolder, grandchild))
        //   //           .isDirectory()
        //   //       )
        //   //       .forEach(subSubFolder => {
        //   //         rimraf.sync(path.join(extractDest, subFolder, subSubFolder));
        //   //       });
        //   //     rimraf.sync(path.join(extractDest, subFolder));
        //   //   });
        //   // rimraf.sync(extractDest);
      }
    }, 0);
  }
}
