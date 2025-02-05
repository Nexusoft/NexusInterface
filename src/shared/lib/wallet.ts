import { atom } from 'jotai';
import { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useNavigate, NavigateFunction } from 'react-router';

import { store } from 'lib/store';
import { stopCore } from 'lib/core';
import { logOut } from 'lib/session';
import { settingsAtom } from 'lib/settings';

let _navigate: NavigateFunction | null = null;
export function navigate(...params: Parameters<NavigateFunction>) {
  return _navigate?.(...params);
}

export function NavigateExporter() {
  const navigate = useNavigate();
  useEffect(() => {
    _navigate = navigate;
  }, [navigate]);
  return null;
}

export const walletClosingAtom = atom(false);
export const walletLockedAtom = atom(false);

export const closeWallet = async (beforeExit?: () => void) => {
  const { manualDaemon, manualDaemonLogOutOnClose } = store.get(settingsAtom);
  store.set(walletClosingAtom, true);

  if (!manualDaemon) {
    await stopCore();
  } else if (manualDaemonLogOutOnClose) {
    await logOut(); //TODO: Ask for pin/session
  }

  beforeExit?.();
  ipcRenderer.invoke('exit-app');
};

export function prepareWallet() {
  ipcRenderer.on('window-close', async () => {
    const { minimizeOnClose } = store.get(settingsAtom);

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
