import fs from 'fs';
import { ipcRenderer } from 'electron';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { stopCore } from 'lib/core';
import { logOut } from 'lib/session';

let _navigate = null;
export function navigate(...params) {
  return _navigate?.(...params);
}

export function setNavigate(func) {
  _navigate = func;
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
