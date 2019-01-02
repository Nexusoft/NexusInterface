// External
import { remote } from 'electron';
import path from 'path';

// Internal
import { GetSettings, SaveSettings } from 'api/settings';
import * as ac from 'actions/headerActionCreators';
import UIController from 'components/UIController';
import MenuBuilder from './menuBuilder';

let tray = window.tray || null;

export default function setupApp(store, history) {
  const { dispatch } = store;
  const menuBuilder = new MenuBuilder(remote.getCurrentWindow().id);
  menuBuilder.buildMenu(store, history);

  if (tray === null) setupTray(dispatch);

  setupSettings(dispatch);

  dispatch(ac.LoadAddressBook());

  dispatch(ac.GetInfoDump());
  setInterval(function() {
    dispatch(ac.AddRPCCall('getInfo'));
    dispatch(ac.GetInfoDump());
  }, 20000);

  dispatch(ac.SetMarketAveData());
  setInterval(function() {
    dispatch(ac.SetMarketAveData());
  }, 900000);

  const mainWindow = remote.getCurrentWindow();
  mainWindow.on('close', e => {
    e.preventDefault();
    store.dispatch(ac.clearOverviewVariables());
    UIController.showNotification('Closing Nexus...');
  });
}

function setupTray(dispatch) {
  const mainWindow = remote.getCurrentWindow();

  const root =
    process.env.NODE_ENV === 'development'
      ? __dirname
      : configuration.GetAppResourceDir();
  const fileName =
    process.platform == 'darwin'
      ? 'Nexus_Tray_Icon_Template_16.png'
      : 'Nexus_Tray_Icon_32.png';
  const trayImage = path.join(root, 'images', 'tray', fileName);

  tray = new remote.Tray(trayImage);

  const pressedFileName = 'Nexus_Tray_Icon_Highlight_16.png';
  const pressedImage = path.join(root, 'images', 'tray', pressedFileName);

  tray.setPressedImage(pressedImage);
  tray.on('double-click', () => {
    mainWindow.show();
  });

  const contextMenu = remote.Menu.buildFromTemplate([
    {
      label: 'Show Nexus',
      click: function() {
        mainWindow.show();
      },
    },
    {
      label: 'Quit Nexus',
      click() {
        dispatch(ac.clearOverviewVariables());
        UIController.showNotification('Closing Nexus...');
        mainWindow.close();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function setupSettings(dispatch) {
  const settings = GetSettings();
  if (Object.keys(settings).length < 1) {
    SaveSettings({ ...settings, keepDaemon: false });
  } else {
    dispatch(ac.setSettings(settings));
  }
}
