//  External
import { remote } from 'electron';

// Internal
import { openModal } from 'actions/overlays';
import * as ac from 'actions/setupApp';
import { getInfo } from 'actions/core';
import { loadModules } from 'actions/module';
import { initializeUpdater, startAutoUpdate } from 'lib/updater';
import { initializeWebView } from 'lib/modules';
import { initializeMenu } from 'appMenu';
import store from 'store';

import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';
import ClosingModal from './ClosingModal';
import { startCoreOuputWatch, stopCoreOuputWatch } from './coreOutputWatch';

const { dispatch } = store;
export default function setupApp() {
  initializeMenu();

  dispatch(getInfo());
  setInterval(() => dispatch(getInfo()), 10000);

  dispatch(ac.SetMarketAveData());
  setInterval(() => {
    dispatch(ac.SetMarketAveData());
  }, 900000);

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
      dispatch(openModal(ClosingModal));

      if (!manualDaemon) {
        await remote.getGlobal('core').stop();
      }
      remote.app.exit();
    }
  });

  startCoreOuputWatch();
  const state = store.getState();

  initializeUpdater();
  if (state.settings.autoUpdate) {
    startAutoUpdate();
  }

  showInitialModals(state);
  initializeWebView();

  dispatch(loadModules());
}

function showInitialModals({ settings }) {
  const showExperimentalWarning = () => {
    if (!settings.experimentalWarningDisabled) {
      dispatch(openModal(ExperimentalWarningModal));
    }
  };

  if (!settings.acceptedAgreement) {
    dispatch(
      openModal(LicenseAgreementModal, {
        fullScreen: true,
        onClose: showExperimentalWarning,
      })
    );
  } else {
    showExperimentalWarning();
  }
}
