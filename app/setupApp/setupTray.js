// External
import path from 'path';
import { remote } from 'electron';

// Internal
import * as ac from 'actions/setupAppActionCreators';
import UIController from 'components/UIController';

export default function setupTray({ dispatch }) {
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
