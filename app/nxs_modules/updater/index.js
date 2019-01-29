// External
import { remote } from 'electron';
import log from 'electron-log';
import path from 'path';
import EventEmitter from 'events';

// Internal
import UIController from 'components/UIController';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';

class Updater extends EventEmitter {
  constructor() {
    super();
    this._autoUpdater.on('error', err => {
      this._updateState('idle');
    });
    this._autoUpdater.on('checking-for-update', () => {
      this._updateState('checking');
    });
    this._autoUpdater.on('update-available', () => {
      this._updateState('downloading');
    });
    this._autoUpdater.on('update-not-available', () => {
      this._updateState('idle');
    });
    this._autoUpdater.on('download-progress', () => {
      this._updateState('downloading');
    });
    this._autoUpdater.on('update-downloaded', () => {
      this._updateState('downloaded');
    });
  }

  get state() {
    return this._state;
  }

  get autoUpdater() {
    return this._autoUpdater;
  }

  setup = () => {
    this._autoUpdater.logger = log;
    this._autoUpdater.currentVersion = APP_VERSION;
    this._autoUpdater.autoDownload = true;
    this._autoUpdater.autoInstallOnAppQuit = false;
    if (process.env.NODE_ENV === 'development') {
      this._autoUpdater.updateConfigPath = path.join(
        __dirname,
        '..',
        'dev-app-update.yml'
      );
    }
    this._autoUpdater.on('error', err => {
      console.error(err);
    });

    this._autoUpdater.on('update-available', updateInfo => {
      UIController.showNotification(
        `New wallet version ${updateInfo.version} available. Downloading...`,
        'success'
      );
    });

    this._autoUpdater.on('update-downloaded', updateInfo => {
      this.stopAutoUpdate();
      UIController.showBackgroundTask(AutoUpdateBackgroundTask, {
        version: updateInfo.version,
        quitAndInstall: this._autoUpdater.quitAndInstall,
      });
    });
  };

  autoUpdate = async () => {
    if (this._autoUpdateStopped) return;
    const result = await this._autoUpdater.checkForUpdates();
    if (result.downloadPromise) {
      await result.downloadPromise;
    }
    // Check for updates every 2 hours
    this._autoUpdateTimeout = setTimeout(this.autoUpdate, 120 * 60 * 1000);
  };

  stopAutoUpdate = () => {
    this._autoUpdateStopped = true;
    clearTimeout(this._autoUpdateTimeout);
  };

  _state = 'idle';
  _autoUpdater = remote.getGlobal('autoUpdater');
  _autoUpdateStopped = false;
  _autoUpdateTimeout = null;

  _updateState = newState => {
    if (this._state !== newState) {
      this._state = newState;
      this.emit('state-change', newState);
    }
  };
}

export default new Updater();
