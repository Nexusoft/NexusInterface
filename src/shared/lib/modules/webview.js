import memoize from 'memoize-one';
import axios from 'axios';
import { reset, initialize } from 'redux-form';
import { createMatchSelector } from 'connected-react-router';

import store, { history, observeStore } from 'store';
import { updateModuleState } from 'actions/module';
import {
  showNotification,
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
} from 'actions/overlays';
import rpc from 'lib/rpc';
import { readModuleStorage, writeModuleStorage } from './storage';
import { getModuleIfActive } from './utils';

const matchSelector = createMatchSelector({ path: '/Modules/:name' });

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
  const match = matchSelector(state);
  return getModuleIfActive(
    match.params.name,
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
    const { webview } = store.getState();
    if (webview) {
      webview.send(
        `proxy-response${requestId ? `:${requestId}` : ''}`,
        null,
        response
      );
    }
  } catch (err) {
    console.error(err);
    const { webview } = store.getState();
    if (webview) {
      webview.send(
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
    const { webview } = store.getState();
    if (webview) {
      webview.send(`rpc-return${callId ? `:${callId}` : ''}`, null, response);
    }
  } catch (err) {
    console.error(err);
    const { webview } = store.getState();
    if (webview) {
      webview.send(`rpc-return${callId ? `:${callId}` : ''}`, err);
    }
  }
}

function showNotif([options = {}]) {
  const { content, type, autoClose } = options;
  store.dispatch(showNotification(content, { content, type, autoClose }));
}

function showErrorDialog([options = {}]) {
  const { message, note } = options;
  store.dispatch(
    openErrorDialog({
      message,
      note,
    })
  );
}

function showSuccessDialog([options = {}]) {
  const { message, note } = options;
  store.dispatch(
    openSuccessDialog({
      message,
      note,
    })
  );
}

function confirm([options = {}, confirmationId]) {
  const { question, note, labelYes, skinYes, labelNo, skinNo } = options;
  store.dispatch(
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
        const { webview } = store.getState();
        if (webview) {
          webview.send(
            `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
            true
          );
        }
      },
      labelNo,
      skinNo,
      callbackNo: () => {
        const { webview } = store.getState();
        if (webview) {
          webview.send(
            `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
            false
          );
        }
      },
    })
  );
}

function updateState([moduleState]) {
  const activeModule = getActiveModule();
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
  const activeModule = getActiveModule();
  writeModuleStorage(activeModule, data);
}

/**
 * Initialize
 * ===========================================================================
 */

export function initializeWebView() {
  observeStore(
    state => state.webview,
    (webview, { getState }) => {
      if (webview) {
        webview.addEventListener('ipc-message', handleIpcMessage);
        webview.addEventListener('dom-ready', () => {
          const state = getState();
          const activeModule = getActiveModule();
          const moduleState = state.moduleStates[activeModule.name];
          const storageData = readModuleStorage(activeModule);
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
    (settings, { getState }) => {
      const { webview } = getState();
      if (webview) {
        try {
          webview.send('settings-updated', settings);
        } catch (err) {}
      }
    },
    settingsChanged
  );

  observeStore(
    state => state.theme,
    (theme, { getState }) => {
      const { webview } = getState();
      if (webview) {
        try {
          webview.send('theme-updated', theme);
        } catch (err) {}
      }
    }
  );

  observeStore(
    state => state.coreInfo,
    (coreInfo, { getState }) => {
      const { webview } = getState();
      if (webview) {
        try {
          webview.send('coreInfo-updated', coreInfo);
        } catch (err) {}
      }
    }
  );
}
