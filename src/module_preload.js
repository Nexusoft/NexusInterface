/**
 * Important note - This file is the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Besides `NEXUS`, don't assign any other thing to `global` variable because
 * it will be passed into modules' execution environment.
 * - Make sure a similar note also presents in other files which are imported here.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactRouterDOM from 'react-router-dom';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import createCache from '@emotion/cache';
import * as core from '@emotion/core';
import styled from '@emotion/styled';
import * as theming from 'emotion-theming';
import { ipcRenderer, clipboard } from 'electron';
import * as ReduxForm from 'redux-form';

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
import AutoSuggest from 'components/AutoSuggest';
import PopUp from 'components/PopUp';
import DateTime from 'components/DateTimePicker';
import FormField from 'components/FormField';
import Table from 'components/Table';
import Arrow from 'components/Arrow';

const newId = (() => {
  let id = 0;
  return () => ++id;
})();

const Modal = PopUp;

global.NEXUS = {
  walletVersion: APP_VERSION,
  libraries: {
    React,
    ReactDOM,
    ReactRouterDOM,
    Redux,
    ReduxForm,
    ReactRedux,
    emotion: { core, styled, theming, createCache },
  },
  utilities: {
    color,
    copyToClipboard: text => {
      if (typeof text !== 'string') {
        throw new Error(
          'Expected `text` to be `string` type, found: ' + typeof text
        );
      }
      clipboard.writeText(text);
    },
    sendNXS: (recipients, message) => {
      if (!Array.isArray(recipients)) {
        throw new Error(
          'Expected `recipients` to be `array` type, found: ' + typeof params
        );
      }
      ipcRenderer.sendToHost('send-nxs', recipients, message);
    },
    showNotification: options => {
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
    showErrorDialog: options => {
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
    showSuccessDialog: options => {
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
    proxyRequest: (url, options) => {
      if (!url) {
        throw new Error('`url` is required');
      }
      if (typeof url !== 'string') {
        throw new Error(
          'Expected `url` to be `string` type, found: ' + typeof url
        );
      }
      if (!options) {
        throw new Error('`options` is required');
      }
      if (typeof options !== 'object' && typeof options !== 'undefined') {
        throw new Error(
          'Expected `options` to be `object` or `undefined` type, found: ' +
            typeof options
        );
      }
      const requestId = newId();
      return new Promise((resolve, reject) => {
        ipcRenderer.once(
          `proxy-response:${requestId}`,
          (event, err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          }
        );
        ipcRenderer.sendToHost('proxy-request', url, options, requestId);
      });
    },
    confirm: options => {
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
    updateState: state => {
      if (typeof state !== 'object') {
        throw new Error(
          'Expected `state` to be `object` type, found: ' + typeof state
        );
      }
      ipcRenderer.sendToHost('update-state', state);
    },
    updateStorage: data => {
      if (typeof data !== 'object') {
        throw new Error(
          'Expected `data` to be `object` type, found: ' + typeof data
        );
      }
      ipcRenderer.sendToHost('update-storage', data);
    },
    onceInitialize: listener => {
      if (typeof listener !== 'function') {
        throw new Error(
          'Expected `listener` to be `function` type, found: ' + typeof listener
        );
      }
      ipcRenderer.once('initialize', (event, initialData) =>
        listener(initialData)
      );
    },
    onThemeUpdated: listener => {
      if (typeof listener !== 'function') {
        throw new Error(
          'Expected `listener` to be `function` type, found: ' + typeof listener
        );
      }
      ipcRenderer.on('theme-updated', (event, theme) => listener(theme));
    },
    onSettingsUpdated: listener => {
      if (typeof listener !== 'function') {
        throw new Error(
          'Expected `listener` to be `function` type, found: ' + typeof listener
        );
      }
      ipcRenderer.on('settings-updated', (event, settings) =>
        listener(settings)
      );
    },
    onCoreInfoUpdated: listener => {
      if (typeof listener !== 'function') {
        throw new Error(
          'Expected `listener` to be `function` type, found: ' + typeof listener
        );
      }
      ipcRenderer.on('core-info-updated', (event, coreInfo) =>
        listener(coreInfo)
      );
    },
  },
  components: {
    GlobalStyles,
    Icon,
    Panel,
    AutoSuggest,
    FieldSet,
    Switch,
    Modal,
    Tooltip,
    Table,
    Select,
    DateTime,
    TextField,
    FormField,
    Link,
    Arrow,
    Tab,
    Button,
  },
};
