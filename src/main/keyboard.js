import path from 'path';
import { BrowserWindow, screen } from 'electron';

const randomRange = (min, max) => Math.floor(Math.random() * (max - min) + min);

let bw = null;

export async function openVirtualKeyboard(options) {
  if (bw) return;

  const width = 750;
  const height = 330;
  const display = screen.getPrimaryDisplay().workAreaSize;
  const x = randomRange(0, display.width - width);
  const y = randomRange(0, display.height - height);

  bw = new BrowserWindow({
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
      contextIsolation: false,
    },
  });

  bw.once('ready-to-show', () => {
    bw.show();
  });
  bw.on('closed', () => {
    bw = null;
    global.mainWindow.webContents.send('keyboard-closed');
  });
  bw.webContents.on('ipc-message', (evt, channel, text) => {
    switch (channel) {
      case 'keyboard-input-change': {
        global.mainWindow.webContents.send('keyboard-input-change', text);
        break;
      }
      case 'close-keyboard': {
        bw.close();
        break;
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
