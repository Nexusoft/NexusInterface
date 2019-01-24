// External
import { remote } from 'electron';
import fs from 'fs';

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
import configuration from 'api/configuration';
import { Tail } from 'utils/tail';
import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';

var tail;
var debugFileLocation;
var checkIfFileExistsInterval;
var printCoreOutputTimer;

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
    if (tail != undefined) {
      tail.unwatch();
    }
    clearInterval(printCoreOutputTimer);
    clearInterval(checkIfFileExistsInterval);
    dispatch(ac.clearOverviewVariables());
    UIController.showNotification('Closing Nexus...');
  });

  startCoreOuputeWatch(store)
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

function startCoreOuputeWatch(store)
{
  if (store.getState().settings.manualDaemon)
  {
    return;
  }
  let datadir = configuration.GetCoreDataDir();
  
    var debugfile;
    if (process.platform === 'win32') {
      debugfile = datadir + '\\debug.log';
    } else {
      debugfile = datadir + '/debug.log';
    }
    debugFileLocation = debugfile;
    fs.stat(debugFileLocation,(err,stat) => {checkDebugFileExists(err,stat,store)});
    checkIfFileExistsInterval = setInterval(() => {
      if (tail != undefined)
      {
        clearInterval(checkIfFileExistsInterval);
        return;
      }
      fs.stat(debugFileLocation,(err,stat) => {checkDebugFileExists(err,stat,store)});
      },
    5000);

}
function checkDebugFileExists(err,stat, store)
  {
    if (err == null)
      {
        processDeamonOutput(debugFileLocation, store);
        clearInterval(checkIfFileExistsInterval);
      }
      else{}
  }

  function processDeamonOutput(debugfile,store) {
    const tailOptions = {
      useWatchFile:true,
    };
    tail = new Tail(debugfile,tailOptions);
    let n = 0;
    let batch = [];
    tail.on('line', d => {
      batch.push(d);
    });
    printCoreOutputTimer = setInterval(() => {
      if (store.getState().terminal.coreOutputPaused) {
        return;
      }
      if (batch.length == 0)
      {
        return;
      }
      store.dispatch(ac.printCoreOutput(batch));
      batch = [];
    }, 1000);
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
