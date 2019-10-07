import memoize from 'utils/memoize';
import axios from 'axios';
import { reset, initialize } from 'redux-form';

import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import { history } from 'lib/wallet';
import {
  showNotification,
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
} from 'lib/ui';
import rpc from 'lib/rpc';

import { readModuleStorage, writeModuleStorage } from './storage';
import { getModuleIfEnabled } from './utils';

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
  settings1 !== settings2 && (!!settings1 && !!settings2)
    ? settings1.locale !== settings2.locale ||
      settings1.fiatCurrency !== settings2.fiatCurrency ||
      settings1.addressStyle !== settings2.addressStyle
    : true;

const getModuleData = ({
  theme,
  core,
  settings: { locale, fiatCurrency, addressStyle },
}) => ({
  theme,
  settings: getSettingsForModules(locale, fiatCurrency, addressStyle),
  coreInfo: core.info,
});

const getActiveModule = () => {
  const state = store.getState();
  const { activeAppModule } = state;
  return getModuleIfEnabled(
    activeAppModule && activeAppModule.moduleName,
    state.modules,
    state.settings.disabledModules
  );
};

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
  history.push('/Send');
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
    const { activeAppModule } = store.getState();
    if (activeAppModule) {
      activeAppModule.webview.send(
        `proxy-response${requestId ? `:${requestId}` : ''}`,
        null,
        response
      );
    }
  } catch (err) {
    console.error(err);
    const { activeAppModule } = store.getState();
    if (activeAppModule) {
      activeAppModule.webview.send(
        `proxy-response${requestId ? `:${requestId}` : ''}`,
        err.toString ? err.toString() : err
      );
    }
  }
}

async function rpcCall([command, params, callId]) {
  try {
    if (!cmdWhitelist.includes(command)) {
      throw 'Invalid command';
    }

    const response = await rpc(command, ...(params || []));
    const { activeAppModule } = store.getState();
    if (activeAppModule) {
      activeAppModule.webview.send(
        `rpc-return${callId ? `:${callId}` : ''}`,
        null,
        response
      );
    }
  } catch (err) {
    console.error(err);
    const { activeAppModule } = store.getState();
    if (activeAppModule) {
      activeAppModule.webview.send(
        `rpc-return${callId ? `:${callId}` : ''}`,
        err
      );
    }
  }
}

function showNotif([options = {}]) {
  const { content, type, autoClose } = options;
  showNotification(content, { content, type, autoClose });
}

function showErrorDialog([options = {}]) {
  const { message, note } = options;
  openErrorDialog({
    message,
    note,
  });
}

function showSuccessDialog([options = {}]) {
  const { message, note } = options;
  openSuccessDialog({
    message,
    note,
  });
}

function confirm([options = {}, confirmationId]) {
  const { question, note, labelYes, skinYes, labelNo, skinNo } = options;
  openConfirmDialog({
    question,
    note,
    labelYes,
    skinYes,
    callbackYes: () => {
      console.log(
        'yes',
        `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`
      );
      const { activeAppModule } = store.getState();
      if (activeAppModule) {
        activeAppModule.webview.send(
          `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
          true
        );
      }
    },
    labelNo,
    skinNo,
    callbackNo: () => {
      const { activeAppModule } = store.getState();
      if (activeAppModule) {
        activeAppModule.webview.send(
          `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
          false
        );
      }
    },
  });
}

function updateState([moduleState]) {
  const activeModule = getActiveModule();
  const moduleName = activeModule.name;
  if (typeof moduleState === 'object') {
    store.dispatch({
      type: TYPE.UPDATE_MODULE_STATE,
      payload: { moduleName, moduleState },
    });
  } else {
    console.error(
      `Module ${moduleName} is trying to update its state to a non-object value ${moduleState}`
    );
  }
}

function updateStorage([data]) {
  const activeModule = getActiveModule();
  writeModuleStorage(activeModule, data);
}

/**
 * Public API
 * ===========================================================================
 */

export function initializeWebView() {
  observeStore(
    state => state.activeAppModule,
    activeAppModule => {
      if (activeAppModule) {
        const { webview } = activeAppModule;
        webview.addEventListener('ipc-message', handleIpcMessage);
        webview.addEventListener('dom-ready', async () => {
          const state = store.getState();
          const activeModule = getActiveModule();
          const moduleState = state.moduleStates[activeModule.name];
          const storageData = await readModuleStorage(activeModule);
          webview.send('initialize', {
            ...getModuleData(state),
            moduleState,
            storageData,
          });
        });
      }
    }
  );

  observeStore(
    state => state.settings,
    (settings, oldSettings) => {
      if (settingsChanged(oldSettings, settings)) {
        const { activeAppModule } = store.getState();
        if (activeAppModule) {
          try {
            activeAppModule.webview.send('settings-updated', settings);
          } catch (err) {}
        }
      }
    }
  );

  observeStore(
    state => state.theme,
    theme => {
      const { activeAppModule } = store.getState();
      if (activeAppModule) {
        try {
          activeAppModule.webview.send('theme-updated', theme);
        } catch (err) {}
      }
    }
  );

  observeStore(
    state => state.coreInfo,
    coreInfo => {
      const { activeAppModule } = store.getState();
      if (activeAppModule) {
        try {
          activeAppModule.webview.send('coreInfo-updated', coreInfo);
        } catch (err) {}
      }
    }
  );
}

export const setActiveWebView = (webview, moduleName) => {
  store.dispatch({
    type: TYPE.SET_ACTIVE_APP_MODULE,
    payload: { webview, moduleName },
  });
};

export const unsetActiveWebView = () => {
  store.dispatch({
    type: TYPE.UNSET_ACTIVE_APP_MODULE,
  });
};

export const toggleWebViewDevTools = () => {
  const { activeAppModule } = store.getState();
  if (activeAppModule) {
    const { webview } = activeAppModule;
    if (webview.isDevToolsOpened()) {
      webview.closeDevTools();
    } else {
      webview.openDevTools();
    }
  }
};
