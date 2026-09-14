import { atom } from 'jotai';
import { useEffect } from 'react';
import {
  useNavigate,
  NavigateFunction,
  NavigateOptions,
  To,
} from 'react-router';

import { store, subscribe } from 'lib/store';
import { coreInfoPausedAtom, coreConnectedAtom } from 'lib/coreInfo';
import { logOut, loggedInAtom } from 'lib/session';
import { settingsAtom } from 'lib/settings';
import nexusEnv from 'lib/nexusEnv';
import { openErrorDialog } from 'lib/dialog';

__ = __context('Wallet');

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

export const closeWallet = async (beforeExit?: () => void) => {
  const { manualDaemon, manualDaemonLogOutOnClose } = store.get(settingsAtom);
  store.set(walletClosingAtom, true);

  try {
    if (!manualDaemon) {
      // Main-process app.exit/quit stops the embedded Core (graceful API stop
      // then force-kill). Doing it only there avoids a double 10s wait and still
      // works when the renderer can no longer reach the Core API.
      store.set(coreInfoPausedAtom, true);
    } else if (manualDaemonLogOutOnClose) {
      await logOut(); //TODO: Ask for pin/session
    }

    beforeExit?.();
    await window.nexusElectron.app.exit();
  } catch (error) {
    store.set(walletClosingAtom, false);
    store.set(coreInfoPausedAtom, false);
    openErrorDialog({
      message: __('Unable to close Nexus Wallet'),
      note: `${(error as Error)?.message || error}. ${__('Please try again.')}`,
    });
  }
};

export function prepareWallet() {
  window.nexusElectron.app.onWindowClose(async () => {
    const { minimizeOnClose } = store.get(settingsAtom);
    // forceQuit is set when user clicks Quit option in the Tray context menu
    if (minimizeOnClose) {
      const forceQuit = await window.nexusElectron.app.isForceQuit();
      if (!forceQuit) {
        await window.nexusElectron.app.hideWindow();
        if (nexusEnv.platform === 'darwin') {
          await window.nexusElectron.app.hideDock();
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
