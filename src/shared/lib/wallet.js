import { atom } from 'jotai';
import { ipcRenderer } from 'electron';

import { jotaiStore } from 'store';
import { stopCore } from 'lib/core';
import { logOut } from 'lib/session';
import { settingsAtom } from './settings';

let _navigate = null;
export function navigate(...params) {
  return _navigate?.(...params);
}

export function setNavigate(func) {
  _navigate = func;
}

export const walletClosingAtom = atom(false);
export const walletLockedAtom = atom(false);

export const closeWallet = async (beforeExit) => {
  const { manualDaemon, manualDaemonLogOutOnClose } =
    jotaiStore.get(settingsAtom);
  jotaiStore.set(walletClosingAtom, true);

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
    const { minimizeOnClose } = jotaiStore.get(settingsAtom);

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
