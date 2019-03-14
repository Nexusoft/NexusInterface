import React from 'react';
import ReactDOM from 'react-dom';
import ReactRouterDOM from 'react-router-dom';
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
import Switch from 'components/Switch';
import Select from 'components/Select';
import Link from 'components/Link';
import * as color from 'utils/color';

global.nexus = {
  apiVersion: MODULE_API_VERSION,
  libraries: {
    React,
    ReactDOM,
    ReactRouterDOM,
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
    Switch,
    Select,
    Link,
  },
  sendMessage: (...args) => ipcRenderer.sendToHost(...args),
  on: (...args) => ipcRenderer.on(...args),
  once: (...args) => ipcRenderer.once(...args),
  off: (...args) => ipcRenderer.removeListener(...args),
};
