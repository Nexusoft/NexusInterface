const React = require('react');
const ReactDOM = require('react-dom');
const redux = require('redux');
const reactRedux = require('react-redux');
const createCache = require('@emotion/cache')['default'];
const core = require('@emotion/core');
const styled = require('@emotion/styled')['default'];
const victory = require('victory');
const { ipcRenderer, clipboard } = require('electron');

const packageJson = require('../package.json');

global.nexus = {
  version: packageJson.moduleApi.currentVersion,
  libraries: {
    React,
    ReactDOM,
    redux,
    reactRedux,
    emotion: { core, styled, createCache },
    victory,
  },
  utilities: {
    copyToClipboard: (...args) => clipboard.writeText(...args),
  },
  sendMessage: (...args) => ipcRenderer.sendToHost(...args),
  listenToMessage: (...args) => ipcRenderer.on(...args),
};
