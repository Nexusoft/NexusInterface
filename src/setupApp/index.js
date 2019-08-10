//  External
import { remote } from 'electron';

// Internal
import * as ac from 'actions/setupApp';
import { loadModules } from 'actions/module';
import { stopCore } from 'actions/core';
import { closeWallet } from 'actions/ui';
import { initializeUpdater } from 'lib/updater';
import { initializeWebView } from 'lib/modules';
import { initializeCoreInfo } from 'lib/coreInfo';
import { startCoreOuputWatch, stopCoreOuputWatch } from 'lib/coreOutput';
import { initializeBootstrapEvents } from 'lib/bootstrap';
import { initializeMenu } from 'appMenu';
import store from 'store';

const { dispatch } = store;
export function preRender() {
  initializeCoreInfo();

  dispatch(ac.SetMarketAveData());
  setInterval(() => {
    dispatch(ac.SetMarketAveData());
  }, 900000);

  dispatch(loadModules());

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
  initializeBootstrapEvents(store);
}
