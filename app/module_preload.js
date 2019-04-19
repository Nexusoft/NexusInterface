import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactRouterDOM from 'react-router-dom';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
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
import Icon from 'components/Icon';
import Tab from 'components/Tab';
import FieldSet from 'components/FieldSet';
import * as color from 'utils/color';

global.NEXUS = {
  specVersion: MODULE_SPEC_VERSION,
  libraries: {
    React,
    ReactDOM,
    ReactRouterDOM,
    Redux,
    ReactRedux,
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
    Icon,
    Tab,
    FieldSet,
  },
  ipc: {
    send: (...args) => ipcRenderer.sendToHost(...args),
    listen: (...args) => ipcRenderer.on(...args),
    listenOnce: (...args) => ipcRenderer.once(...args),
    stopListening: (...args) => ipcRenderer.removeListener(...args),
  },
};
