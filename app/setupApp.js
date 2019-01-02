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
  let trayImage = '';
  const mainWindow = remote.getCurrentWindow();

  if (process.env.NODE_ENV === 'development') {
    if (process.platform == 'darwin') {
      trayImage = path.join(
        __dirname,
        'images',
        'tray',
        'Nexus_Tray_Icon_Template_16.png'
      );
    } else {
      trayImage = path.join(
        __dirname,
        'images',
        'tray',
        'Nexus_Tray_Icon_32.png'
      );
    }
  } else {
    if (process.platform == 'darwin') {
      trayImage = path.join(
        configuration.GetAppResourceDir(),
        'images',
        'tray',
        'Nexus_Tray_Icon_Template_16.png'
      );
    } else {
      trayImage = path.join(
        configuration.GetAppResourceDir(),
        'images',
        'tray',
        'Nexus_Tray_Icon_32.png'
      );
    }
  }

  tray = new remote.Tray(trayImage);

  if (process.env.NODE_ENV === 'development') {
    if (process.platform == 'darwin') {
      tray.setPressedImage(
        path.join(
          __dirname,
          'images',
          'tray',
          'Nexus_Tray_Icon_Highlight_16.png'
        )
      );
    }
  } else {
    tray.setPressedImage(
      path.join(
        configuration.GetAppResourceDir(),
        'images',
        'tray',
        'Nexus_Tray_Icon_Highlight_16.png'
      )
    );
  }
  tray.on('double-click', () => {
    mainWindow.show();
  });

  var contextMenu = remote.Menu.buildFromTemplate([
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
    dispatch(ac.SwitchLocale(settings.locale));
    SaveSettings({ ...settings, keepDaemon: false });
  } else {
    dispatch(ac.SwitchLocale(settings.locale));
    dispatch(ac.setSettings(settings));
  }
}
