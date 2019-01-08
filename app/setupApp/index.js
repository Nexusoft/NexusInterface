// External
import { remote } from 'electron';

// Internal
import UIController from 'components/UIController';
import WEBGL from 'scripts/WebGLCheck.js';
import * as ac from 'actions/setupAppActionCreators';
import MenuBuilder from './menuBuilder';
import loadSettings from './loadSettings';
import getInfo from './getInfo';
import setupTray from './setupTray';

export default function setupApp(store, history) {
  const { dispatch } = store;
  const menuBuilder = new MenuBuilder(store, history);
  menuBuilder.buildMenu();

  setupTray(store);

  loadSettings(store);

  dispatch(ac.LoadAddressBook());

  getInfo(store);
  setInterval(() => getInfo(store), 20000);

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
}

function checkWebGL(dispatch) {
  if (WEBGL.isWebGLAvailable()) {
    dispatch(ac.setWebGLEnabled(true));
  } else {
    dispatch(ac.setWebGLEnabled(false));
    console.error(WEBGL.getWebGLErrorMessage());
  }
}
