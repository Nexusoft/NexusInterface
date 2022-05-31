import fs from 'fs';
import { ipcRenderer } from 'electron';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { defaultSettings } from 'lib/settings/universal';
import rpc from 'lib/rpc';
import { stopCore } from 'lib/core';
import { logOut } from 'lib/user';

let _navigate = null;
export function navigate(...params) {
  return _navigate?.(...params);
}

export function setNavigate(func) {
  _navigate = func;
}

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

export const closeWallet = async (beforeExit) => {
  const {
    settings: { manualDaemon, manualDaemonLogOutOnClose },
  } = store.getState();

  store.dispatch({
    type: TYPE.CLOSE_WALLET,
  });

  if (!manualDaemon) {
    await stopCore();
  } else if (manualDaemonLogOutOnClose) {
    await logOut(); //TODO: Ask for pin/session
  }

  if (beforeExit) beforeExit();
  ipcRenderer.invoke('exit-app');
};

export function prepareWallet() {
  ipcRenderer.on('window-close', async () => {
    const {
      settings: { minimizeOnClose },
    } = store.getState();

    // forceQuit is set when user clicks Quit option in the Tray context menu
    if (minimizeOnClose) {
      const forceQuit = await ipcRenderer.invoke('is-force-quit');
      if (!forceQuit) {
        ipcRenderer.invoke('hide-window');
        if (process.platform === 'darwin') {
          ipcRenderer.invoke('hide-dock');
        }
        return;
      }
    }

    await closeWallet();
  });
}
