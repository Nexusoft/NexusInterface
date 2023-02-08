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
  const { activeAppModule, modules } = store.getState();
  const module = modules[activeAppModule.moduleName];
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
    case 'open-external':
      openExternal(event.args);
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
  const { activeAppModule } = store.getState();
  try {
    const response = await rpc(command, ...(params || []));
    if (activeAppModule?.webview) {
      activeAppModule.webview.send(
        `rpc-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (err) {
    console.error(err);
    if (activeAppModule?.webview) {
      activeAppModule.webview.send(
        `rpc-return${callId ? `:${callId}` : ''}`,
        err
      );
    }
  }
}

async function apiCall([endpoint, params, callId]) {
  const { activeAppModule } = store.getState();
  try {
    const response = await callApi(endpoint, params);
    if (activeAppModule?.webview) {
      activeAppModule.webview.send(
        `api-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (err) {
    console.error(err);
    if (activeAppModule?.webview) {
      activeAppModule.webview.send(
        `api-return${callId ? `:${callId}` : ''}`,
        err
      );
    }
  }
}

async function secureApiCall([endpoint, params, callId]) {
  const { activeAppModule } = store.getState();
  try {
    const message = (
      <div style={{ overflow: 'scroll', maxHeight: '15em' }}>
        <div>
          <strong>{activeAppModule.displayName}</strong> module is requesting to
          call <strong>{endpoint}</strong> endpoint with the following
          parameters:
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
    if (activeAppModule?.webview) {
      activeAppModule.webview.send(
        `secure-api-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (error) {
    console.error(error);
    if (activeAppModule?.webview) {
      activeAppModule.webview.send(
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
  const { question, note, labelYes, skinYes, labelNo, skinNo } = options;
  openConfirmDialog({
    question,
    note,
    labelYes,
    skinYes,
    callbackYes: () => {
      const { activeAppModule } = store.getState();
      if (activeAppModule?.webview) {
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
      if (activeAppModule?.webview) {
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

function contextMenu([template]) {
  const { activeAppModule } = store.getState();
  if (activeAppModule?.webview) {
    popupContextMenu(
      template || defaultMenu,
      activeAppModule.webview.getWebContentsId()
    );
  }
}

function openExternal([url]) {
  shell.openExternal(url);
}

/**
 * Public API
 * ===========================================================================
 */

export const setActiveWebView = (webview, moduleName, displayName) => {
  store.dispatch({
    type: TYPE.SET_ACTIVE_APP_MODULE,
    payload: { webview, moduleName, displayName },
  });
};

export const unsetActiveWebView = () => {
  store.dispatch({
    type: TYPE.UNSET_ACTIVE_APP_MODULE,
  });
};

export const toggleWebViewDevTools = () => {
  const { activeAppModule } = store.getState();
  if (activeAppModule?.webview) {
    const { webview } = activeAppModule;
    if (webview.isDevToolsOpened()) {
      webview.closeDevTools();
    } else {
      webview.openDevTools();
    }
  }
};

function sendWalletDataUpdated(walletData) {
  const { activeAppModule } = store.getState();
  if (activeAppModule?.webview) {
    try {
      activeAppModule.webview.send('wallet-data-updated', walletData);
    } catch (err) {}
  }
}

export function prepareWebView() {
  observeStore(
    (state) => state.activeAppModule?.webview,
    (webview) => {
      if (webview) {
        webview.addEventListener('ipc-message', handleIpcMessage);
        webview.addEventListener('dom-ready', async () => {
          const state = store.getState();
          const activeModule = getActiveModule();
          const moduleState = state.moduleStates[activeModule.name];
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
