const React = require('react');
const ReactDOM = require('react-dom');
const redux = require('redux');
const reactRedux = require('react-redux');
const core = require('@emotion/core');
const styled = require('@emotion/styled');
const victory = require('victory');
const { ipcRenderer, clipboard } = require('electron');

global.Nexus = {
  version: MODULE_API_VERSION,
  libraries: {
    React,
    ReactDOM,
    redux,
    reactRedux,
    emotion: { core, styled },
    victory,
  },
  utilities: {
    copyToClipboard: (...args) => clipboard.writeText(...args),
  },
  sendMessage: (...args) => ipcRenderer.sendToHost(...args),
  listenToMessage: (...args) => ipcRenderer.on(...args),
};
