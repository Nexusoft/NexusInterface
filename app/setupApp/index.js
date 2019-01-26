// External
import { remote } from 'electron';

// Internal
import UIController from 'components/UIController';
import WEBGL from 'scripts/WebGLCheck.js';
import * as RPC from 'scripts/rpc';
import * as ac from 'actions/setupAppActionCreators';
import getInfo from 'actions/getInfo';
import { loadSettingsFromFile } from 'actions/settingsActionCreators';
import { loadThemeFromFile } from 'actions/themeActionCreators';
import updater from 'updater';
import appMenu from 'appMenu';
import core from 'api/core';
import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';
import ClosingModal from './ClosingModal';

window.remote = remote;

export default function setupApp(store, history) {
  const { dispatch } = store;
  store.dispatch(loadSettingsFromFile());
  store.dispatch(loadThemeFromFile());

  appMenu.initialize(store, history);
  appMenu.build();

  dispatch(ac.LoadAddressBook());

  dispatch(getInfo());
  setInterval(() => dispatch(getInfo()), 20000);

  dispatch(ac.SetMarketAveData());
  setInterval(function() {
    dispatch(ac.SetMarketAveData());
  }, 900000);

  checkWebGL(dispatch);

  const mainWindow = remote.getCurrentWindow();
  mainWindow.on('close', async e => {
    const {
      settings: { minimizeOnClose, manualDaemon },
    } = store.getState();

    // forceQuit is set when user clicks Quit option in the Tray context menu
    if (minimizeOnClose && !remote.getGlobal('forceQuit')) {
      mainWindow.hide();
    } else {
      UIController.openModal(ClosingModal);

      if (manualDaemon) {
        await RPC.PROMISE('stop', []);
        remote.app.exit();
      } else {
        await core.stop();
        remote.app.exit();
      }
    }
  });

  const state = store.getState();

  updater.setup();
  if (state.settings.autoUpdate) {
    updater.autoUpdate();
  }

  showInitialModals(state);
}

function checkWebGL(dispatch) {
  if (WEBGL.isWebGLAvailable()) {
    dispatch(ac.setWebGLEnabled(true));
  } else {
    dispatch(ac.setWebGLEnabled(false));
    console.error(WEBGL.getWebGLErrorMessage());
  }
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
