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
    copyToClipboard: (...args) => {
      clipboard.writeText(...args);
    },
    showNotification: options => {
      ipcRenderer.sendToHost('show-notification', options);
    },
    showErrorDialog: options => {
      ipcRenderer.sendToHost('show-error-dialog', options);
    },
    showSuccessDialog: options => {
      ipcRenderer.sendToHost('show-success-dialog', options);
    },
    rpcCall: (command, params, callId) => {
      if (typeof command !== 'string') {
        console.error(
          'Expected `command` to be `string` type, found: ' + typeof command
        );
        return;
      }
      if (typeof params !== 'undefined' && !Array.isArray(params)) {
        console.error(
          'Expected `params` to be `array` or `undefined` type, found: ' +
            typeof params
        );
        return;
      }
      ipcRenderer.sendToHost('rpc-call', command, params, callId);
    },
    proxyRequest: (url, options, requestId) => {
      if (typeof url !== 'string') {
        console.error(
          'Expected `url` to be `string` type, found: ' + typeof url
        );
        return;
      }
      if (typeof options !== 'object' && typeof options !== 'undefined') {
        console.error(
          'Expected `options` to be `object` or `undefined` type, found: ' +
            typeof options
        );
        return;
      }
      ipcRenderer.sendToHost('proxy-request', url, options, requestId);
    },
    confirm: options => {
      ipcRenderer.sendToHost('confirm', options);
    },
    updateState: state => {
      ipcRenderer.sendToHost('update-state', state);
    },
    updateStorage: data => {
      ipcRenderer.sendToHost('update-storage', data);
    },
    onceInitialize: listener => {
      ipcRenderer.once('initialize', (event, initialData) =>
        listener(initialData)
      );
    },
    onThemeUpdated: listener => {
      ipcRenderer.on('theme-updated', (event, theme) => listener(theme));
    },
    onSettingsUpdated: listener => {
      ipcRenderer.on('settings-updated', (event, settings) =>
        listener(settings)
      );
    },
    onCoreInfoUpdated: listener => {
      ipcRenderer.on('core-info-updated', (event, coreInfo) =>
        listener(coreInfo)
      );
    },
    onceRpcReturn: (listener, callId) => {
      ipcRenderer.once(
        `rpc-return${callId ? `:${callId}` : ''}`,
        (event, err, result) => listener(err, result)
      );
    },
    onceProxyResponse: (listener, requestId) => {
      ipcRenderer.once(
        `proxy-response${requestId ? `:${requestId}` : ''}`,
        (event, err, response) => listener(err, response)
      );
    },
    onceConfirmAnswer: (listener, confirmationId) => {
      ipcRenderer.once(
        `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
        (event, agreed) => listener(agreed)
      );
    },
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
};
