/**
 * Important note - This file is the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Besides `NEXUS`, don't assign any other thing to `global` variable because
 * it will be passed into modules' execution environment.
 * - Make sure a similar note also presents in other files which are imported here.
 */

import * as React from 'react';
import ReactDefault from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as jsxDevRuntime from 'react/jsx-dev-runtime';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactDOMServer from 'react-dom/server';
import cache from '@emotion/cache';
import * as react from '@emotion/react';
import styled from '@emotion/styled';
import { ipcRenderer, clipboard, shell } from 'electron';

import GlobalStyles from 'components/GlobalStyles';
import ThemeController from 'components/ThemeController';
import Panel from 'components/Panel';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import Select from 'components/Select';
import Icon from 'components/Icon';
import HorizontalTab from 'components/HorizontalTab';
import VerticalTab from 'components/VerticalTab';
import FieldSet from 'components/FieldSet';
import AutoSuggest from 'components/AutoSuggest';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import Arrow from 'components/Arrow';
import Dropdown from 'components/Dropdown';
import * as color from 'utils/color';

const newId = (() => {
  let id = 0;
  return () => ++id;
})();

global.NEXUS = {
  walletVersion: APP_VERSION,
  libraries: {
    React: { ...React, jsxDevRuntime, jsxRuntime, default: ReactDefault },
    ReactDOM: { ...ReactDOM, client: ReactDOMClient, server: ReactDOMServer },
    emotion: { react, styled, cache },
  },
  components: {
    Arrow,
    AutoSuggest,
    Button,
    Dropdown,
    FieldSet,
    FormField,
    GlobalStyles,
    Icon,
    Modal,
    Panel,
    Select,
    Switch,
    HorizontalTab,
    VerticalTab,
    TextField,
    ThemeController,
    Tooltip,
  },
  utilities: {
    // `options` shape
    //  For Legacy mode:
    //  {
    //    sendFrom,
    //    recipients: [{
    //      address
    //    }]
    //  }
    //  For Tritium mode:
    //  {
    //    sendFrom,
    //    recipients: [{
    //      address,
    //      amount,
    //      reference,
    //      expireDays,
    //      expireHours,
    //      expireMinutes,
    //      expireSeconds,
    //    }],
    //    advancedOptions, // Boolean - whether reference and expire options take effect
    //  }
    send: (options) => {
      if (!options) {
        throw new Error('`options` is required');
      }
      if (typeof options !== 'object') {
        throw new Error(
          'Expected `options` to be `object` type, found: ' + typeof options
        );
      }
      if (!Array.isArray(options.recipients)) {
        throw new Error(
          'Expected `options.recipients` to be `array` type, found: ' +
            typeof options.recipients
        );
      }
      ipcRenderer.sendToHost('send', options);
    },
    rpcCall: (command, params) => {
      if (!command) {
        throw new Error('`command` is required');
      }
      if (typeof command !== 'string') {
        throw new Error(
          'Expected `command` to be `string` type, found: ' + typeof command
        );
      }
      if (typeof params !== 'undefined' && !Array.isArray(params)) {
        throw new Error(
          'Expected `params` to be `array` or `undefined` type, found: ' +
            typeof params
        );
      }
      const callId = newId();
      return new Promise((resolve, reject) => {
        ipcRenderer.once(`rpc-return:${callId}`, (event, err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
        ipcRenderer.sendToHost('rpc-call', command, params, callId);
      });
    },
    apiCall: (endpoint, params) => {
      if (!endpoint) {
        throw new Error('`endpoint` is required');
      }
      if (typeof endpoint !== 'string') {
        throw new Error(
          'Expected `endpoint` to be `string` type, found: ' + typeof endpoint
        );
      }
      const callId = newId();
      return new Promise((resolve, reject) => {
        ipcRenderer.once(`api-return:${callId}`, (event, err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
        ipcRenderer.sendToHost('api-call', endpoint, params, callId);
      });
    },
    secureApiCall: (endpoint, params) => {
      if (!endpoint) {
        throw new Error('`endpoint` is required');
      }
      if (typeof endpoint !== 'string') {
        throw new Error(
          'Expected `endpoint` to be `string` type, found: ' + typeof endpoint
        );
      }
      const callId = newId();
      return new Promise((resolve, reject) => {
        ipcRenderer.once(
          `secure-api-return:${callId}`,
          (event, err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
        ipcRenderer.sendToHost('secure-api-call', endpoint, params, callId);
      });
    },
    proxyRequest: (url, config) => {
      if (!url) {
        throw new Error('`url` is required');
      }
      if (typeof url !== 'string') {
        throw new Error(
          'Expected `url` to be `string` type, found: ' + typeof url
        );
      }
      if (!config) {
        throw new Error('`config` is required');
      }
      if (typeof config !== 'object' && typeof config !== 'undefined') {
        throw new Error(
          'Expected `config` to be `object` or `undefined` type, found: ' +
            typeof config
        );
      }
      return ipcRenderer.invoke('proxy-request', url, config);
    },
    showNotification: (options) => {
      if (!options) {
        throw new Error('`options` is required');
      }
      if (typeof options !== 'object') {
        throw new Error(
          'Expected `options` to be `object` type, found: ' + typeof options
        );
      }
      ipcRenderer.sendToHost('show-notification', options);
    },
    showErrorDialog: (options) => {
      if (!options) {
        throw new Error('`options` is required');
      }
      if (typeof options !== 'object') {
        throw new Error(
          'Expected `options` to be `object` type, found: ' + typeof options
        );
      }
      ipcRenderer.sendToHost('show-error-dialog', options);
    },
    showSuccessDialog: (options) => {
      if (!options) {
        throw new Error('`options` is required');
      }
      if (typeof options !== 'object') {
        throw new Error(
          'Expected `options` to be `object` type, found: ' + typeof options
        );
      }
      ipcRenderer.sendToHost('show-success-dialog', options);
    },
    showInfoDialog: (options) => {
      if (!options) {
        throw new Error('`options` is required');
      }
      if (typeof options !== 'object') {
        throw new Error(
          'Expected `options` to be `object` type, found: ' + typeof options
        );
      }
      ipcRenderer.sendToHost('show-info-dialog', options);
    },
    confirm: (options) => {
      if (!options) {
        throw new Error('`options` is required');
      }
      if (typeof options !== 'object') {
        throw new Error(
          'Expected `options` to be `object` type, found: ' + typeof options
        );
      }
      const confirmationId = newId();
      return new Promise((resolve, reject) => {
        ipcRenderer.once(`confirm-answer:${confirmationId}`, (event, agreed) =>
          resolve(agreed)
        );
        ipcRenderer.sendToHost('confirm', options, confirmationId);
      });
    },
    updateState: (state) => {
      if (typeof state !== 'object') {
        throw new Error(
          'Expected `state` to be `object` type, found: ' + typeof state
        );
      }
      ipcRenderer.sendToHost('update-state', state);
    },
    updateStorage: (data) => {
      if (typeof data !== 'object') {
        throw new Error(
          'Expected `data` to be `object` type, found: ' + typeof data
        );
      }
      ipcRenderer.sendToHost('update-storage', data);
    },
    onceInitialize: (listener) => {
      if (typeof listener !== 'function') {
        throw new Error(
          'Expected `listener` to be `function` type, found: ' + typeof listener
        );
      }
      ipcRenderer.once('initialize', (event, initialData) =>
        listener(initialData)
      );
    },
    onWalletDataUpdated: (listener) => {
      if (typeof listener !== 'function') {
        throw new Error(
          'Expected `listener` to be `function` type, found: ' + typeof listener
        );
      }
      ipcRenderer.on('wallet-data-updated', (event, walletData) =>
        listener(walletData)
      );
    },
    copyToClipboard: (text) => {
      if (typeof text !== 'string') {
        throw new Error(
          'Expected `text` to be `string` type, found: ' + typeof text
        );
      }
      clipboard.writeText(text);
    },
    openExternal: (url) => {
      if (typeof url !== 'string') {
        throw new Error(
          'Expected `url` to be `string` type, found: ' + typeof text
        );
      }
      ipcRenderer.sendToHost('open-external', url);
    },
    color,
  },
};

// Open all external URLs on OS default browser instead of inside the wallet itself
document.addEventListener('click', function (event) {
  const {
    target: { tagName, href },
  } = event;
  if ((tagName === 'a' || tagName === 'A') && href.startsWith('http')) {
    event.preventDefault();
    shell.openExternal(href);
  }
});

document.addEventListener('contextmenu', (event) => {
  ipcRenderer.sendToHost('context-menu');
});
