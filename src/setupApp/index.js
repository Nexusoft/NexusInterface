//  External
import { remote } from 'electron';

// Internal
import { initializeMarketData } from 'lib/market';
import { loadModules } from 'lib/modules';
import { stopCore } from 'actions/core';
import { closeWallet } from 'actions/ui';
import { openModal } from 'lib/overlays';
import TritiumUpgradeModal from 'components/TritiumUpgradeModal';
import { tritiumUpgradeTime, legacyMode } from 'consts/misc';
import { initializeUpdater } from 'lib/updater';
import { initializeWebView } from 'lib/modules';
import { initializeCoreInfo } from 'lib/coreInfo';
import { startCoreOuputWatch, stopCoreOuputWatch } from 'lib/coreOutput';
import { initializeBootstrapEvents } from 'lib/bootstrap';
import { initializeMenu } from 'appMenu';
import { initializeTransactions } from 'lib/tritiumTransactions';
import store from 'store';

const { dispatch } = store;
export function preRender() {
  initializeCoreInfo();
  initializeMarketData();

  loadModules();

  const mainWindow = remote.getCurrentWindow();
  mainWindow.on('close', async e => {
    const {
      settings: { minimizeOnClose, manualDaemon },
    } = store.getState();

    // forceQuit is set when user clicks Quit option in the Tray context menu
    if (minimizeOnClose && !remote.getGlobal('forceQuit')) {
      mainWindow.hide();
      if (process.platform === 'darwin') {
        remote.app.dock.hide();
      }
    } else {
      stopCoreOuputWatch();
      dispatch(closeWallet());

      if (!manualDaemon) {
        await dispatch(stopCore());
      }
      remote.app.exit();
    }
  });
}

export function postRender() {
  const state = store.getState();

  startCoreOuputWatch();

  initializeMenu();
  initializeWebView();
  initializeUpdater(state.settings.autoUpdate);
  initializeBootstrapEvents();
  if (!legacyMode) {
    initializeTransactions();
  }

  const now = Date.now();
  if (now < tritiumUpgradeTime) {
    if (state.settings.legacyMode !== false) {
      setTimeout(() => {
        openModal(TritiumUpgradeModal);
      }, tritiumUpgradeTime - now);
    }
  } else {
    if (state.settings.legacyMode === undefined) {
      openModal(TritiumUpgradeModal);
    }
  }
}
