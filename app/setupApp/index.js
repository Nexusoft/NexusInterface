// External
import { remote } from 'electron';

// Internal
import UIController from 'components/UIController';
import WEBGL from 'scripts/WebGLCheck.js';
import * as ac from 'actions/setupAppActionCreators';
import getInfo from 'actions/getInfo';
import { loadSettingsFromFile } from 'actions/settingsActionCreators';
import { loadThemeFromFile } from 'actions/themeActionCreators';
import updater from 'updater';
import appMenu from 'appMenu';
import setupTray from './setupTray';
import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';

export default function setupApp(store, history) {
  const { dispatch } = store;
  store.dispatch(loadSettingsFromFile());
  store.dispatch(loadThemeFromFile());

  appMenu.initialize(store, history);
  appMenu.build();

  setupTray(store);

  dispatch(ac.LoadAddressBook());

  dispatch(getInfo());
  setInterval(() => dispatch(getInfo()), 20000);

  dispatch(ac.SetMarketAveData());
  setInterval(function() {
    dispatch(ac.SetMarketAveData());
  }, 900000);

  checkWebGL(dispatch);

  const mainWindow = remote.getCurrentWindow();
  mainWindow.on('close', e => {
    e.preventDefault();
    dispatch(ac.clearOverviewVariables());
    UIController.showNotification('Closing Nexus...');
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
