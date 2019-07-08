//  External
import { remote } from 'electron';

// Internal
import UIController from 'components/UIController';
import * as ac from 'actions/setupAppActionCreators';
import { getInfo } from 'actions/coreActionCreators';
import { loadModules } from 'actions/moduleActionCreators';
import { startAutoUpdate } from 'lib/updater';
import { rebuildMenu, initializeMenu } from 'appMenu';

import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';
import ClosingModal from './ClosingModal';
import { startCoreOuputWatch, stopCoreOuputWatch } from './coreOutputWatch';

export default function setupApp(store) {
  const { dispatch } = store;

  initializeMenu();
  rebuildMenu();

  dispatch(getInfo());
  setInterval(() => dispatch(getInfo()), 10000);

  dispatch(ac.SetMarketAveData());
  setInterval(function() {
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
      UIController.openModal(ClosingModal);

      if (!manualDaemon) {
        await remote.getGlobal('core').stop();
      }
      remote.app.exit();
    }
  });

  startCoreOuputWatch();
  const state = store.getState();

  if (state.settings.autoUpdate) {
    startAutoUpdate();
  }

  showInitialModals(state);

  dispatch(loadModules());
}

function showInitialModals({ settings }) {
  const showExperimentalWarning = () => {
    if (!settings.experimentalWarningDisabled) {
      UIController.openModal(ExperimentalWarningModal);
    }
  };

  if (!settings.acceptedAgreement) {
    UIController.openModal(LicenseAgreementModal, {
      fullScreen: true,
      onClose: showExperimentalWarning,
    });
  } else {
    showExperimentalWarning();
  }
}
