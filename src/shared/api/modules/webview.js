import memoize from 'memoize-one';
import axios from 'axios';
import { reset, initialize } from 'redux-form';

import store, { history } from 'store';
import { updateModuleState } from 'actions/moduleActionCreators';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
import { readModuleStorage, writeModuleStorage } from './storage';

const cmdWhitelist = [
  'checkwallet',
  'getaccount',
  'getaccountaddress',
  'getaddressesbyaccount',
  'getbalance',
  'getblock',
  'getblockcount',
  'getblockhash',
  'getblocknumber',
  'getconnectioncount',
  'getdifficulty',
  'getinfo',
  'getmininginfo',
  'getmoneysupply',
  'getnetworkhashps',
  'getnetworkpps',
  'getnetworktrustkeys',
  'getnewaddress',
  'getpeerinfo',
  'getrawtransaction',
  'getreceivedbyaccount',
  'getreceivedbyaddress',
  'getsupplyrates',
  'gettransaction',
  'help',
  'isorphan',
  'listaccounts',
  'listaddresses',
  'listreceivedbyaccount',
  'listreceivedbyaddress',
  'listsinceblock',
  'listtransactions',
  'listtrustkeys',
  'listunspent',
  'unspentbalance',
  'validateaddress',
  'verifymessage',
];

let webview = null;
let activeModule = null;
let data = null;
let unsubscribe = null;

/**
 * Exports
 * ===========================================================================
 */

/**
 * Register active webview, called when the webview is mounted
 *
 * @export
 * @param {*} _webview
 * @param {*} _module
 */
export function registerWebView(_webview, _module) {
  webview = _webview;
  activeModule = _module;

  webview.addEventListener('ipc-message', handleIpcMessage);
  webview.addEventListener('dom-ready', () => {
    const state = store.getState();
    const moduleState = state.moduleStates[activeModule.name];
    const storageData = readModuleStorage(activeModule);
    data = getModuleData(state);
    webview.send('initialize', {
      ...data,
      moduleState,
      storageData,
    });
    unsubscribe = store.subscribe(handleStateChange);
  });
}

/**
 * Unregister active webview, called when the webview is unmounted
 *
 * @export
 */
export function unregisterWebView() {
  if (typeof unsubscribe === 'function') {
    unsubscribe();
  }
  webview = null;
  activeModule = null;
  data = null;
  unsubscribe = null;
}

/**
 * Toggle the active webview's DevTools
 *
 * @export
 */
export function toggleWebViewDevTools() {
  if (webview) {
    if (webview.isDevToolsOpened()) {
      webview.closeDevTools();
    } else {
      webview.openDevTools();
    }
  }
}

/**
 * Check whether there's a webview being active
 *
 * @export
 * @returns
 */
export function isWebViewActive() {
  return !!webview;
}

/**
 * Outgoing IPC messages TO modules
 * ===========================================================================
 */

function handleStateChange() {
  if (!data) return;
  const state = store.getState();
  const newData = getModuleData(state);
  const { theme, settings, coreInfo } = newData;

  if (data.theme !== theme) {
    webview.send('theme-updated', theme);
  }
  if (settingsChanged(data.settings, settings)) {
    webview.send('settings-updated', settings);
  }
  if (data.coreInfo !== coreInfo) {
    webview.send('core-info-updated', coreInfo);
  }
  data = newData;
}

/**
 * Incoming IPC messages FROM modules
 * ===========================================================================
 */

function handleIpcMessage(event) {
  switch (event.channel) {
    case 'send-nxs':
      sendNXS(event.args);
      break;
    case 'proxy-request':
      proxyRequest(event.args);
      break;
    case 'rpc-call':
      rpcCall(event.args);
      break;
    case 'show-notification':
      showNotif(event.args);
      break;
    case 'show-error-dialog':
      showErrorDialog(event.args);
      break;
    case 'show-success-dialog':
      showSuccessDialog(event.args);
      break;
    case 'confirm':
      confirm(event.args);
      break;
    case 'update-state':
      updateState(event.args);
      break;
    case 'update-storage':
      updateStorage(event.args);
      break;
  }
}

function sendNXS([recipients, message]) {
  if (!Array.isArray(recipients)) return;

  store.dispatch(
    initialize('sendNXS', {
      sendFrom: null,
      recipients: recipients.map(r => ({
        address: `${r.address}`,
        amount: parseFloat(r.amount) || 0,
        fiatAmount: '',
      })),
      message: message,
    })
  );
  store.dispatch(reset('sendNXS'));
  history.push('/SendPage');
}

async function proxyRequest([url, options, requestId]) {
  try {
    const lUrl = url.toLowerCase();
    if (!lUrl.startsWith('http://') && !lUrl.startsWith('https://')) {
      throw 'Proxy request must be in HTTP or HTTPS protocol';
    }
    if (options) {
      // disallow baseURL and url options, url must be absolute
      delete options.baseURL;
      delete options.url;
    }

    const response = await axios(url, options);
    webview.send(
      `proxy-response${requestId ? `:${requestId}` : ''}`,
      null,
      response
    );
  } catch (err) {
    console.error(err);
    webview.send(
      `proxy-response${requestId ? `:${requestId}` : ''}`,
      err.toString ? err.toString() : err
    );
  }
}

async function rpcCall([command, params, callId]) {
  try {
    if (!cmdWhitelist.includes(command)) {
      throw 'Invalid command';
    }

    const response = await RPC.PROMISE(command, ...(params || []));
    webview.send(`rpc-return${callId ? `:${callId}` : ''}`, null, response);
  } catch (err) {
    console.error(err);
    webview.send(`rpc-return${callId ? `:${callId}` : ''}`, err);
  }
}

function showNotif([options = {}]) {
  const { content, type, autoClose } = options;
  UIController.showNotification(content, { content, type, autoClose });
}

function showErrorDialog([options = {}]) {
  const { message, note } = options;
  UIController.openErrorDialog({
    message,
    note,
  });
}

function showSuccessDialog([options = {}]) {
  const { message, note } = options;
  UIController.openSuccessDialog({
    message,
    note,
  });
}

function confirm([options = {}, confirmationId]) {
  const { question, note, labelYes, skinYes, labelNo, skinNo } = options;
  UIController.openConfirmDialog({
    question,
    note,
    labelYes,
    skinYes,
    callbackYes: () => {
      console.log(
        'yes',
        `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`
      );
      webview.send(
        `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
        true
      );
    },
    labelNo,
    skinNo,
    callbackNo: () => {
      webview.send(
        `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
        false
      );
    },
  });
}

function updateState([moduleState]) {
  const moduleName = activeModule.name;
  if (typeof moduleState === 'object') {
    store.dispatch(updateModuleState(moduleName, moduleState));
  } else {
    console.error(
      `Module ${moduleName} is trying to update its state to a non-object value ${moduleState}`
    );
  }
}

function updateStorage([data]) {
  writeModuleStorage(activeModule, data);
}

/**
 * Utilities
 * ===========================================================================
 */

const getSettingsForModules = memoize((locale, fiatCurrency, addressStyle) => ({
  locale,
  fiatCurrency,
  addressStyle,
}));

const settingsChanged = (settings1, settings2) =>
  settings1.locale !== settings2.locale ||
  settings1.fiatCurrency !== settings2.fiatCurrency ||
  settings1.addressStyle !== settings2.addressStyle;

const getModuleData = ({
  theme,
  core,
  settings: { locale, fiatCurrency, addressStyle },
}) => ({
  theme,
  settings: getSettingsForModules(locale, fiatCurrency, addressStyle),
  coreInfo: core.info,
});
