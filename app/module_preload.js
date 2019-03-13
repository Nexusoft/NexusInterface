import React from 'react';
import ReactDOM from 'react-dom';
import * as redux from 'redux';
import * as reactRedux from 'react-redux';
import createCache from '@emotion/cache';
import * as core from '@emotion/core';
import styled from '@emotion/styled';
import * as theming from 'emotion-theming';
import * as victory from 'victory';
import { ipcRenderer, clipboard } from 'electron';

import GlobalStyles from 'components/GlobalStyles';
import Panel from 'components/Panel';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import TextField from 'components/TextField';
import * as color from 'utils/color';

global.nexus = {
  apiVersion: MODULE_API_VERSION,
  libraries: {
    React,
    ReactDOM,
    redux,
    reactRedux,
    emotion: { core, styled, theming, createCache },
    victory,
  },
  utilities: {
    color,
    copyToClipboard: (...args) => clipboard.writeText(...args),
  },
  components: {
    GlobalStyles,
    Panel,
    Button,
    Tooltip,
    TextField,
  },
  sendMessage: (...args) => ipcRenderer.sendToHost(...args),
  onMessage: (...args) => ipcRenderer.on(...args),
};
