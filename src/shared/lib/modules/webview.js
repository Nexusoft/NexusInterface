import { clipboard, shell } from 'electron';

import { jotaiStore, subscribe, subscribeWithPrevious } from 'store';
import { showNotification } from 'lib/ui';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  openInfoDialog,
  confirmPin,
} from 'lib/dialog';
import { settingsAtom } from 'lib/settings';
import { themeAtom } from 'lib/theme';
import { coreInfoAtom } from 'lib/coreInfo';
import { userStatusAtom } from 'lib/session';
import { addressBookAtom } from 'lib/addressBook';
import { popupContextMenu, defaultMenu } from 'lib/contextMenu';
import { goToSend } from 'lib/send';
import { callAPI } from 'lib/api';
import memoize from 'utils/memoize';

import { readModuleStorage, writeModuleStorage } from './storage';
import {
  activeAppModuleNameAtom,
  modulesMapAtom,
  moduleStatesAtom,
} from './atoms';

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

const getActiveModule = () => {
  const activeAppModuleName = jotaiStore.get(activeAppModuleNameAtom);
  const modulesMap = jotaiStore.get(modulesMapAtom);
  const module = modulesMap[activeAppModuleName];
  return module.enabled ? module : null;
};

/**
 * Incoming IPC messages FROM modules
 * ===========================================================================
 */

function handleIpcMessage(event) {
  const { srcElement: webview, channel, args } = event;
  switch (channel) {
    case 'send':
      send(args, webview);
      break;
    case 'api-call':
      apiCall(args, webview);
      break;
    case 'secure-api-call':
      secureApiCall(args, webview);
      break;
    case 'show-notification':
      showNotif(args, webview);
      break;
    case 'show-error-dialog':
      showErrorDialog(args, webview);
      break;
    case 'show-success-dialog':
      showSuccessDialog(args, webview);
      break;
    case 'show-info-dialog':
      showInfoDialog(args, webview);
      break;
    case 'confirm':
      confirm(args, webview);
      break;
    case 'update-state':
      updateState(args, webview);
      break;
    case 'update-storage':
      updateStorage(args, webview);
      break;
    case 'context-menu':
      contextMenu(args, webview);
      break;
    case 'open-in-browser':
      openInBrowser(args, webview);
      break;
    case 'copy-to-clipboard':
      copyToClipboard(args, webview);
      break;
  }
}

function send([{ sendFrom, recipients, advancedOptions }]) {
  if (!Array.isArray(recipients)) return;
  goToSend({ sendFrom, recipients, advancedOptions });
}

async function apiCall([endpoint, params, callId], webview) {
  try {
    const response = await callAPI(endpoint, params);
    if (webview) {
      webview.send(
        `api-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (err) {
    console.error(err);
    if (webview) {
      webview.send(`api-return${callId ? `:${callId}` : ''}`, err);
    }
  }
}

async function secureApiCall([endpoint, params, callId], webview) {
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
        : await callAPI(endpoint, { ...params, pin });
    if (webview) {
      webview.send(
        `secure-api-return${callId ? `:${callId}` : ''}`,
        null,
        response && JSON.parse(JSON.stringify(response))
      );
    }
  } catch (error) {
    console.error(error);
    if (webview) {
      webview.send(`secure-api-return${callId ? `:${callId}` : ''}`, error);
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

function confirm([options = {}, confirmationId], webview) {
  const { question, note, labelYes, skinYes, labelNo, skinNo } = options;
  openConfirmDialog({
    question,
    note,
    labelYes,
    skinYes,
    callbackYes: () => {
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
      if (webview) {
        webview.send(
          `confirm-answer${confirmationId ? `:${confirmationId}` : ''}`,
          false
        );
      }
    },
  });
}

function updateState([moduleState]) {
  const activeAppModuleName = jotaiStore.get(activeAppModuleNameAtom);
  if (typeof moduleState === 'object') {
    jotaiStore.set(moduleStatesAtom, (states) => ({
      ...states,
      [activeAppModuleName]: moduleState,
    }));
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

function contextMenu([template], webview) {
  if (webview) {
    popupContextMenu(template || defaultMenu, webview.getWebContentsId());
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
  jotaiStore.set(activeAppModuleNameAtom, moduleName);
};

export const unsetActiveAppModule = () => {
  activeWebView = null;
  jotaiStore.set(activeAppModuleNameAtom, null);
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
  subscribe(activeAppModuleNameAtom, (moduleName) => {
    const webview = getActiveWebView();
    if (webview) {
      webview.addEventListener('ipc-message', handleIpcMessage);
      webview.addEventListener('dom-ready', async () => {
        const settings = jotaiStore.get(settingsAtom);
        const { locale, fiatCurrency, addressStyle } = settings;
        const moduleState = jotaiStore.get(moduleStatesAtom)[moduleName];
        const activeModule = getActiveModule();
        const storageData = await readModuleStorage(activeModule);
        webview.send('initialize', {
          theme: jotaiStore.get(themeAtom),
          settings: getSettingsForModules(locale, fiatCurrency, addressStyle),
          coreInfo: jotaiStore.get(coreInfoAtom),
          userStatus: jotaiStore.get(userStatusAtom),
          addressBook: jotaiStore.get(addressBookAtom),
          moduleState,
          storageData,
        });
      });
    }
  });

  subscribeWithPrevious(settingsAtom, (newSettings, oldSettings) => {
    if (settingsChanged(oldSettings, newSettings)) {
      const { locale, fiatCurrency, addressStyle } = newSettings;
      const settings = getSettingsForModules(
        locale,
        fiatCurrency,
        addressStyle
      );
      sendWalletDataUpdated({ settings });
    }
  });

  subscribe(themeAtom, (theme) => {
    sendWalletDataUpdated({ theme });
  });

  subscribe(coreInfoAtom, (coreInfo) => {
    sendWalletDataUpdated({ coreInfo });
  });

  subscribe(userStatusAtom, (userStatus) => {
    sendWalletDataUpdated({ userStatus });
  });

  subscribe(addressBookAtom, (addressBook) => {
    sendWalletDataUpdated({ addressBook });
  });
}
