import { clipboard, shell } from 'electron';

import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import { navigate } from 'lib/wallet';
import { showNotification } from 'lib/ui';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  openInfoDialog,
  confirmPin,
} from 'lib/dialog';
import { popupContextMenu, defaultMenu } from 'lib/contextMenu';
import { goToSend } from 'lib/send';
import rpc from 'lib/rpc';
import { callApi } from 'lib/tritiumApi';
import { legacyMode } from 'consts/misc';
import memoize from 'utils/memoize';

import { readModuleStorage, writeModuleStorage } from './storage';

let activeWebView = null;

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
  settings1 !== settings2 && !!settings1 && !!settings2
    ? settings1.locale !== settings2.locale ||
      settings1.fiatCurrency !== settings2.fiatCurrency ||
      settings1.addressStyle !== settings2.addressStyle
    : true;

const getWalletData = ({
  theme,
  core,
  settings: { locale, fiatCurrency, addressStyle },
  user: { status },
  addressBook,
}) => ({
  theme,
  settings: getSettingsForModules(locale, fiatCurrency, addressStyle),
  coreInfo: legacyMode ? core.info : core.systemInfo,
  userStatus: status,
  addressBook,
});

const getActiveModule = () => {
  const { activeAppModuleName, modules } = store.getState();
  const module = modules[activeAppModuleName];
  return module.enabled ? module : null;
};

/**
 * Incoming IPC messages FROM modules
 * ===========================================================================
 */

function handleIpcMessage(event) {
  switch (event.channel) {
    case 'send':
      send(event.args);
      break;
    case 'rpc-call':
      rpcCall(event.args);
      break;
    case 'api-call':
      apiCall(event.args);
      break;
    case 'secure-api-call':
      secureApiCall(event.args);
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
    case 'show-info-dialog':
      showInfoDialog(event.args);
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
    case 'context-menu':
      contextMenu(event.args);
      break;
    case 'open-in-browser':
      openInBrowser(event.args);
      break;
    case 'copy-to-clipboard':
      copyToClipboard(event.args);
      break;
  }
}

function send([{ sendFrom, recipients, advancedOptions }]) {
  if (!Array.isArray(recipients)) return;
  if (legacyMode) {
    const sendTo = recipients?.[0]?.address;
    if (sendTo) {
      navigate('/Send?sendTo=' + sendTo);
    }
  } else {
    goToSend({ sendFrom, recipients, advancedOptions });
  }
}

async function rpcCall([command, params, callId]) {
  const activeWebView = getActiveWebView();
  try {
    const response = await rpc(command, ...(params || []));
    if (activeWebView) {
      activeWebView.send(
        `rpc-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (err) {
    console.error(err);
    if (activeWebView) {
      activeWebView.send(`rpc-return${callId ? `:${callId}` : ''}`, err);
    }
  }
}

async function apiCall([endpoint, params, callId]) {
  const activeWebView = getActiveWebView();
  try {
    const response = await callApi(endpoint, params);
    if (activeWebView) {
      activeWebView.send(
        `api-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (err) {
    console.error(err);
    if (activeWebView) {
      activeWebView.send(`api-return${callId ? `:${callId}` : ''}`, err);
    }
  }
}

async function secureApiCall([endpoint, params, callId]) {
  const activeWebView = getActiveWebView();
  const { displayName } = getActiveModule();
  try {
    const message = (
      <div style={{ overflow: 'scroll', maxHeight: '15em' }}>
        <div>
          <strong>{displayName}</strong> module is requesting to call{' '}
          <strong>{endpoint}</strong> endpoint with the following parameters:
        </div>
        <code
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre',
            display: 'block',
            marginTop: '0.5em',
            padding: '8px 0',
          }}
        >
          {JSON.stringify(params, null, 2)}
        </code>
      </div>
    );
    const pin = await confirmPin({ note: message });

    const response =
      pin === undefined
        ? undefined
        : await callApi(endpoint, { ...params, pin });
    if (activeWebView) {
      activeWebView.send(
        `secure-api-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (error) {
    console.error(error);
    if (activeWebView) {
      activeWebView.send(
        `secure-api-return${callId ? `:${callId}` : ''}`,
        error
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

function showInfoDialog([options = {}]) {
  const { message, note } = options;
  openInfoDialog({
    message,
    note,
  });
}

function confirm([options = {}, confirmationId]) {
  const activeWebView = getActiveWebView();
  const { question, note, labelYes, skinYes, labelNo, skinNo } = options;
  openConfirmDialog({
    question,
    note,
    labelYes,
    skinYes,
    callbackYes: () => {
      if (activeWebView) {
        activeWebView.send(
          `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
          true
        );
      }
    },
    labelNo,
    skinNo,
    callbackNo: () => {
      if (activeWebView) {
        activeWebView.send(
          `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
          false
        );
      }
    },
  });
}

function updateState([moduleState]) {
  const { activeAppModuleName } = store.getState();
  if (typeof moduleState === 'object') {
    store.dispatch({
      type: TYPE.UPDATE_MODULE_STATE,
      payload: { activeAppModuleName, moduleState },
    });
  } else {
    console.error(
      `Module ${activeAppModuleName} is trying to update its state to a non-object value ${moduleState}`
    );
  }
}

function updateStorage([data]) {
  const activeModule = getActiveModule();
  writeModuleStorage(activeModule, data);
}

function contextMenu([template]) {
  const activeWebView = getActiveWebView();
  if (activeWebView) {
    popupContextMenu(template || defaultMenu, activeWebView.getWebContentsId());
  }
}

function openInBrowser([url]) {
  shell.openExternal(url);
}

function copyToClipboard([text]) {
  clipboard.writeText(text);
}

/**
 * Public API
 * ===========================================================================
 */

export const getActiveWebView = () => activeWebView;

export const setActiveAppModule = (webview, moduleName) => {
  activeWebView = webview;
  store.dispatch({
    type: TYPE.SET_ACTIVE_APP_MODULE,
    payload: moduleName,
  });
};

export const unsetActiveAppModule = () => {
  activeWebView = null;
  store.dispatch({
    type: TYPE.UNSET_ACTIVE_APP_MODULE,
  });
};

export const toggleWebViewDevTools = () => {
  const activeWebView = getActiveWebView();
  if (activeWebView) {
    if (activeWebView.isDevToolsOpened()) {
      activeWebView.closeDevTools();
    } else {
      activeWebView.openDevTools();
    }
  }
};

function sendWalletDataUpdated(walletData) {
  const activeWebView = getActiveWebView();
  if (activeWebView) {
    try {
      activeWebView.send('wallet-data-updated', walletData);
    } catch (err) {}
  }
}

export function prepareWebView() {
  observeStore(
    (state) => state.activeAppModuleName,
    (moduleName) => {
      const webview = getActiveWebView();
      if (webview) {
        webview.addEventListener('ipc-message', handleIpcMessage);
        webview.addEventListener('dom-ready', async () => {
          const state = store.getState();
          const moduleState = state.moduleStates[moduleName];
          const activeModule = getActiveModule();
          const storageData = await readModuleStorage(activeModule);
          webview.send('initialize', {
            ...getWalletData(state),
            moduleState,
            storageData,
          });
        });
      }
    }
  );

  observeStore(
    (state) => state.settings,
    (newSettings, oldSettings) => {
      if (settingsChanged(oldSettings, newSettings)) {
        const settings = getSettingsForModules(newSettings);
        sendWalletDataUpdated({ settings });
      }
    }
  );

  observeStore(
    (state) => state.theme,
    (theme) => {
      sendWalletDataUpdated({ theme });
    }
  );

  observeStore(
    (state) => (legacyMode ? state.core.info : state.core.systemInfo),
    (coreInfo) => {
      sendWalletDataUpdated({ coreInfo });
    }
  );

  observeStore(
    (state) => state.user.status,
    (userStatus) => {
      sendWalletDataUpdated({ userStatus });
    }
  );

  observeStore(
    (state) => state.addressBook,
    (addressBook) => {
      sendWalletDataUpdated({ addressBook });
    }
  );
}
