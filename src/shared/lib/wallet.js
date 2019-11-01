import fs from 'fs';
import EventEmitter from 'events';
import { createHashHistory } from 'history';
import { remote } from 'electron';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { defaultSettings } from 'lib/settings/universal';
import rpc from 'lib/rpc';
import { stopCore } from 'lib/core';
import { openModal } from 'lib/ui';
import { tritiumUpgradeTime } from 'consts/misc';
import TritiumUpgradeModal from 'components/TritiumUpgradeModal';

/**
 * Backs up wallet
 *
 * @export {function} The function
 * @param {string} backupFolder The folder to backup too.
 * @returns {Promise} RPC Promise of backup function.
 */
export function backupWallet(backupFolder) {
  const backupDir = backupFolder || defaultSettings.backupDirectory;

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const now = new Date()
    .toString()
    .slice(0, 24)
    .split(' ')
    .reduce((a, b) => {
      return a + '_' + b;
    })
    .replace(/:/g, '_');

  return rpc('backupwallet', [backupDir + '/NexusBackup_' + now + '.dat']);
}

export const closeWallet = async beforeExit => {
  const {
    settings: { manualDaemon },
  } = store.getState();

  store.dispatch({
    type: TYPE.CLOSE_WALLET,
  });

  if (!manualDaemon) {
    await stopCore();
  }

  if (beforeExit) beforeExit();
  remote.app.exit();
};

export const history = createHashHistory();

export const walletEvents = new EventEmitter();

walletEvents.once('pre-render', function() {
  remote.getCurrentWindow().on('close', async e => {
    const {
      settings: { minimizeOnClose },
    } = store.getState();

    // forceQuit is set when user clicks Quit option in the Tray context menu
    if (minimizeOnClose && !remote.getGlobal('forceQuit')) {
      mainWindow.hide();
      if (process.platform === 'darwin') {
        remote.app.dock.hide();
      }
    } else {
      await closeWallet();
    }
  });
});

walletEvents.once('post-render', function() {
  const {
    settings: { legacyMode },
  } = store.getState();

  const now = Date.now();
  if (now < tritiumUpgradeTime) {
    setTimeout(() => {
      if (legacyMode !== false) {
        openModal(TritiumUpgradeModal);
      }
    }, tritiumUpgradeTime - now);
  } else {
    if (legacyMode === undefined) {
      openModal(TritiumUpgradeModal);
    }
  }
});
