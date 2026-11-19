import { atom } from 'jotai';
import { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import {
  useNavigate,
  NavigateFunction,
  NavigateOptions,
  To,
} from 'react-router';

import { store, subscribe } from 'lib/store';
import { stopCore } from 'lib/core';
import { coreConnectedAtom } from 'lib/coreInfo';
import { logOut, loggedInAtom } from 'lib/session';
import { settingsAtom } from 'lib/settings';

let _navigate: NavigateFunction | null = null;
export function navigate(to: To, options?: NavigateOptions) {
  return _navigate?.(to, options);
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
export const loggedOutWhileConnectedAtom = atom(
  (get) => get(coreConnectedAtom) && !get(loggedInAtom)
);

const updateQuitFallbackMs = 60000;

/**
 * Stop the core and exit. With quitInstead the given function quits the app
 * itself (update install), exit-app only runs if it has not after a while
 */
export const closeWallet = async (quitInstead?: () => Promise<unknown>) => {
  const { manualDaemon, manualDaemonLogOutOnClose } = store.get(settingsAtom);
  store.set(walletClosingAtom, true);

  if (!manualDaemon) {
    await stopCore();
  } else if (manualDaemonLogOutOnClose) {
    await logOut(); //TODO: Ask for pin/session
  }

  if (quitInstead) {
    try {
      await quitInstead();
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => ipcRenderer.invoke('exit-app'), updateQuitFallbackMs);
    return;
  }
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

  const preventReload = (ev: BeforeUnloadEvent) => {
    ev.returnValue = true;
  };
  subscribe(walletLockedAtom, (lockedState) => {
    if (lockedState) {
      window.addEventListener('beforeunload', preventReload);
    } else {
      window.removeEventListener('beforeunload', preventReload);
    }
  });

  subscribe(loggedOutWhileConnectedAtom, (loggedOutWhileConnected) => {
    // Stop locking the wallet when user is logged out while still being connected
    if (loggedOutWhileConnected) {
      store.set(walletLockedAtom, false);
    }
  });
}
