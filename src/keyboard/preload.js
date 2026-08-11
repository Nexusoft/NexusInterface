import { contextBridge, ipcRenderer } from 'electron';

function validateOptions(options) {
  if (
    !options ||
    typeof options !== 'object' ||
    typeof options.defaultText !== 'string' ||
    typeof options.maskable !== 'boolean' ||
    typeof options.placeholder !== 'string'
  ) {
    throw new Error('Invalid virtual keyboard options');
  }
  return options;
}

contextBridge.exposeInMainWorld('nexusEnv', {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || '',
});

contextBridge.exposeInMainWorld('virtualKeyboard', {
  onOptions(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Keyboard options listener must be a function');
    }
    ipcRenderer.once('options', (_event, options) =>
      listener(validateOptions(options))
    );
  },
  inputChanged(text) {
    if (typeof text !== 'string') {
      throw new Error('Keyboard input must be a string');
    }
    ipcRenderer.send('keyboard-input-change', text);
  },
  close() {
    ipcRenderer.send('close-keyboard');
  },
});
