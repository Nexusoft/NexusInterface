import React from 'react';
import ReactDOM from 'react-dom';
import * as redux from 'redux';
import * as reactRedux from 'react-redux';
import createCache from '@emotion/cache';
import * as core from '@emotion/core';
import styled from '@emotion/styled';
import * as victory from 'victory';
import { ipcRenderer, clipboard } from 'electron';

import Panel from './nxs_modules/components/Panel';
import * as color from './nxs_modules/utils/color';

global.nexus = {
  apiVersion: MODULE_API_VERSION,
  libraries: {
    React,
    ReactDOM,
    redux,
    reactRedux,
    emotion: { core, styled, createCache },
    victory,
  },
  utilities: {
    color,
    copyToClipboard: (...args) => clipboard.writeText(...args),
  },
  components: {
    Panel,
  },
  sendMessage: (...args) => ipcRenderer.sendToHost(...args),
  listenToMessage: (...args) => ipcRenderer.on(...args),
};
