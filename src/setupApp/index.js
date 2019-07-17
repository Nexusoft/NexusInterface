//  External
import { remote } from 'electron';

// Internal
import { openModal } from 'actions/overlays';
import * as ac from 'actions/setupApp';
import { loadModules } from 'actions/module';
import { initializeUpdater } from 'lib/updater';
import { initializeWebView } from 'lib/modules';
import { initializeCoreInfo } from 'lib/coreInfo';
import { startCoreOuputWatch, stopCoreOuputWatch } from 'lib/coreOutput';
import { initializeMenu } from 'appMenu';
import store from 'store';

import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';
import ClosingModal from './ClosingModal';

const { dispatch } = store;
export function preRender() {
  initializeCoreInfo();

  showInitialModals();

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
      dispatch(openModal(ClosingModal));

      if (!manualDaemon) {
        await remote.getGlobal('core').stop();
      }
      remote.app.exit();
    }
  });
}

export function postRender() {
  const {
    settings: { autoUpdate },
  } = store.getState();

  startCoreOuputWatch();

  initializeMenu();
  initializeWebView();
  initializeUpdater(autoUpdate);
}

function showInitialModals() {
  const {
    settings: { experimentalWarningDisabled, acceptedAgreement },
  } = store.getState();

  const showExperimentalWarning = () => {
    if (!experimentalWarningDisabled) {
      dispatch(openModal(ExperimentalWarningModal));
    }
  };

  if (!acceptedAgreement) {
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
