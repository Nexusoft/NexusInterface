const { ipcRenderer } = require('electron');

global.sendToHost = (...args) => ipcRenderer.sendToHost(...args);

global.listenToHost = (channel, listener) => ipcRenderer.on(channel, listener);
