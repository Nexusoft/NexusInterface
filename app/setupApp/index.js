// External
import { remote } from 'electron';
import path from 'path';

// Internal
import * as ac from 'actions/headerActionCreators';
import UIController from 'components/UIController';
import MenuBuilder from './menuBuilder';
import loadSettings from './loadSettings';
import getInfo from './getInfo';

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

  const mainWindow = remote.getCurrentWindow();
  mainWindow.on('close', e => {
    e.preventDefault();
    dispatch(ac.clearOverviewVariables());
    UIController.showNotification('Closing Nexus...');
  });
}

function setupTray({ dispatch }) {
  if (window.tray) return;

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
  const tray = new remote.Tray(trayImage);

  const pressedFileName = 'Nexus_Tray_Icon_Highlight_16.png';
  const pressedImage = path.join(root, 'images', 'tray', pressedFileName);
  tray.setPressedImage(pressedImage);

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
  tray.on('double-click', () => {
    mainWindow.show();
  });
}
