import React from 'react';
import { remote } from 'electron';
import log from 'electron-log';
import path from 'path';
import UIController from 'components/UIController';
import BackgroundTask from 'components/BackgroundTask';

const autoUpdater = remote.getGlobal('autoUpdater');

export default async function setupAutoUpdater(store) {
  const {
    settings: { settings },
  } = store.getState();

  autoUpdater.logger = log;
  autoUpdater.currentVersion = APP_VERSION;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(
      __dirname,
      '..',
      'dev-app-update.yml'
    );
  }
  autoUpdater.on('error', (...args) => {
    console.log('error', args);
  });

  autoUpdater.on('update-available', (...args) => {
    console.log('update-available', args);
  });

  autoUpdater.on('download-progress', (...args) => {
    console.log('download-progress', args);
  });

  autoUpdater.on('update-downloaded', (...args) => {
    console.log('update-downloaded', args);
  });

  if (settings.autoUpdate) {
    autoCheck();
  }
}

let stopAutoChecking = false;

async function autoCheck() {
  if (stopAutoChecking) return;
  const result = await autoUpdater.checkForUpdates();
  if (result.downloadPromise) {
    await result.downloadPromise;
    UIController.showBackgroundTask(AutoUpdateBackgroundTask, {
      version: result.updateInfo.version,
      quitAndInstall: autoUpdater.quitAndInstall,
    });
  }
  // Check for updates every 2 hours
  setTimeout(autoCheck, 120 * 60 * 1000);
}

class AutoUpdateBackgroundTask extends React.Component {
  confirmInstall = () => {
    this.closeTask();
    UIController.openConfirmDialog({
      question: 'Quit and install update now?',
      yesLabel: 'Quit and install',
      yesCallback: this.props.quitAndInstall,
      noLabel: 'Install it later',
      noCallback: () => {
        UIController.showBackgroundTask(AutoUpdateBackgroundTask, this.props);
        stopAutoChecking = true;
      },
    });
  };

  render() {
    return (
      <BackgroundTask
        assignClose={close => (this.closeTask = close)}
        onClick={this.confirmInstall}
      >
        New wallet version v{this.props.version} available!
      </BackgroundTask>
    );
  }
}
