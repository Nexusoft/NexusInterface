import path from 'path';
import { BrowserWindow, screen } from 'electron';

const randomRange = (min, max) => Math.random() * (max - min) + min;

export async function openVirtualKeyboard(options) {
  const width = 750;
  const height = 330;
  const display = screen.getPrimaryDisplay().workAreaSize;
  const x = randomRange(0, display.width - width);
  const y = randomRange(0, display.height - height);

  const bw = new BrowserWindow({
    width,
    height,
    x,
    y,
    parent: global.mainWindow,
    modal: true,
    show: false,
    backgroundColor: '#171719',
    autoHideMenuBar: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: false,
    },
  });

  bw.once('ready-to-show', () => {
    bw.show();
  });
  bw.on('closed', () => {
    global.mainWindow.webContents.send('keyboard-closed');
  });
  bw.webContents.on('ipc-message', (evt, channel, ...args) => {
    switch (channel) {
      case 'submit': {
        global.mainWindow.webContents.send('keyboard-submit', ...args);
        bw.close();
      }
    }
  });

  const htmlPath =
    process.env.NODE_ENV === 'development'
      ? '../src/keyboard/keyboard.html'
      : 'keyboard.html';
  await bw.loadURL(`file://${path.resolve(__dirname, htmlPath)}`);
  bw.webContents.send('options', options);

  return bw;
}
