import { app, Tray, Menu } from 'electron';
import path from 'path';

// Internal
import { assetsDir } from 'consts/paths';

/**
 * Setup tray icon
 *
 * @param {*} mainWindow
 * @returns
 */
export function setupTray(mainWindow) {
  const fileName =
    process.platform == 'darwin'
      ? 'Nexus_Tray_Icon_16_Template.png'
      : 'Nexus_Tray_Icon_32.png';
  const trayImage = path.join(assetsDir, 'tray', fileName);
  const tray = new Tray(trayImage);

  const pressedFileName = 'Nexus_Tray_Icon_Highlight_16.png';
  const pressedImage = path.join(assetsDir, 'tray', pressedFileName);
  tray.setPressedImage(pressedImage);
  tray.setToolTip('Nexus Wallet');
  tray.setTitle('Nexus Wallet');

  app.on('before-quit', () => {
    global.forceQuit = true;
  });
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Nexus Wallet',
      click: function () {
        mainWindow.show();
        if (process.platform === 'darwin') {
          app.dock.show();
        }
      },
    },
    {
      label: 'Quit Nexus Wallet',
      click() {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.show();
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  return tray;
}
