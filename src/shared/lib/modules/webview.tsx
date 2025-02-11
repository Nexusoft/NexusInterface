import { clipboard, IpcMessageEvent, shell, WebviewTag } from 'electron';

import { AddressBook, addressBookAtom } from 'lib/addressBook';
import { callAPI } from 'lib/api';
import { defaultMenu, popupContextMenu } from 'lib/contextMenu';
import { coreInfoQuery } from 'lib/coreInfo';
import {
  confirmPin,
  openConfirmDialog,
  openErrorDialog,
  openInfoDialog,
  openSuccessDialog,
} from 'lib/dialog';
import { goToSend } from 'lib/send';
import { userStatusQuery } from 'lib/session';
import { Settings, settingsAtom } from 'lib/settings';
import { store, subscribe, subscribeWithPrevious } from 'lib/store';
import { themeAtom } from 'lib/theme';
import { showNotification } from 'lib/ui';
import memoize from 'utils/memoize';

import { Theme } from 'lib/theme';
import {
  activeAppModuleNameAtom,
  modulesMapAtom,
  moduleStatesAtom,
} from './atoms';
import { readModuleStorage, writeModuleStorage } from './storage';

let activeWebView: WebviewTag | null = null;

/**
 * Utilities
 * ===========================================================================
 */

const getSettingsForModules = memoize((locale, fiatCurrency, addressStyle) => ({
  locale,
  fiatCurrency,
  addressStyle,
}));

const settingsChanged = (
  settings1: SettingsForModule,
  settings2: SettingsForModule
) =>
  settings1 !== settings2 && !!settings1 && !!settings2
    ? settings1.locale !== settings2.locale ||
      settings1.fiatCurrency !== settings2.fiatCurrency ||
      settings1.addressStyle !== settings2.addressStyle
    : true;

const getActiveModule = () => {
  const activeAppModuleName = store.get(activeAppModuleNameAtom);
  const modulesMap = store.get(modulesMapAtom);
  const module = activeAppModuleName && modulesMap[activeAppModuleName];
  return module && module.enabled ? module : null;
};

/**
 * Incoming IPC messages FROM modules
 * ===========================================================================
 */

function handleIpcMessage({ target, channel, args }: IpcMessageEvent) {
  const webview = target as WebviewTag;
  switch (channel) {
    case 'send':
      send(args);
      break;
    case 'api-call':
      apiCall(args, webview);
      break;
    case 'secure-api-call':
      secureApiCall(args, webview);
      break;
    case 'show-notification':
      showNotif(args);
      break;
    case 'show-error-dialog':
      showErrorDialog(args);
      break;
    case 'show-success-dialog':
      showSuccessDialog(args);
      break;
    case 'show-info-dialog':
      showInfoDialog(args);
      break;
    case 'confirm':
      confirm(args, webview);
      break;
    case 'update-state':
      updateState(args);
      break;
    case 'update-storage':
      updateStorage(args);
      break;
    case 'context-menu':
      contextMenu(args, webview);
      break;
    case 'open-in-browser':
      openInBrowser(args);
      break;
    case 'copy-to-clipboard':
      copyToClipboard(args);
      break;
  }
}

function send([{ sendFrom, recipients, advancedOptions }]: any[]) {
  if (!Array.isArray(recipients)) return;
  goToSend({ sendFrom, recipients, advancedOptions });
}

async function apiCall([endpoint, params, callId]: any[], webview: WebviewTag) {
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

async function secureApiCall(
  [endpoint, params, callId]: any[],
  webview: WebviewTag
) {
  const activeModule = getActiveModule();
  if (!activeModule) return;
  const {
    info: { displayName },
  } = activeModule;
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

function showNotif([options = {}]: any[]) {
  const { content, type, autoClose } = options;
  showNotification(content, { content, type, autoClose });
}

function showErrorDialog([options = {}]: any[]) {
  const { message, note } = options;
  openErrorDialog({
    message,
    note,
  });
}

function showSuccessDialog([options = {}]: any[]) {
  const { message, note } = options;
  openSuccessDialog({
    message,
    note,
  });
}

function showInfoDialog([options = {}]: any[]) {
  const { message, note } = options;
  openInfoDialog({
    message,
    note,
  });
}

function confirm([options = {}, confirmationId]: any[], webview: WebviewTag) {
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

function updateState([moduleState]: any[]) {
  const activeAppModuleName = store.get(activeAppModuleNameAtom);
  if (!activeAppModuleName) return;
  if (typeof moduleState === 'object') {
    store.set(moduleStatesAtom, (states) => ({
      ...states,
      [activeAppModuleName]: moduleState,
    }));
  } else {
    console.error(
      `Module ${activeAppModuleName} is trying to update its state to a non-object value ${moduleState}`
    );
  }
}

function updateStorage([data]: any[]) {
  const activeModule = getActiveModule();
  if (!activeModule) return;
  writeModuleStorage(activeModule, data);
}

function contextMenu([template]: any[], webview: WebviewTag) {
  if (webview) {
    popupContextMenu(template || defaultMenu, webview.getWebContentsId());
  }
}

function openInBrowser([url]: any[]) {
  shell.openExternal(url);
}

function copyToClipboard([text]: any[]) {
  clipboard.writeText(text);
}

/**
 * ===========================================================================
 * Public API
 * ===========================================================================
 */

export const getActiveWebView = () => activeWebView;

export const setActiveAppModule = (webview: WebviewTag, moduleName: string) => {
  activeWebView = webview;
  store.set(activeAppModuleNameAtom, moduleName);
};

export const unsetActiveAppModule = () => {
  activeWebView = null;
  store.set(activeAppModuleNameAtom, null);
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

function sendWalletDataUpdated(walletData: WalletData) {
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
        const settings = store.get(settingsAtom);
        const { locale, fiatCurrency, addressStyle } = settings;
        const moduleState = moduleName
          ? store.get(moduleStatesAtom)[moduleName]
          : null;
        const activeModule = getActiveModule();
        const storageData = activeModule
          ? await readModuleStorage(activeModule)
          : null;
        webview.send('initialize', {
          theme: store.get(themeAtom),
          settings: getSettingsForModules(locale, fiatCurrency, addressStyle),
          coreInfo: store.get(coreInfoQuery.valueAtom),
          userStatus: store.get(userStatusQuery.valueAtom),
          addressBook: store.get(addressBookAtom),
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

  subscribe(coreInfoQuery.valueAtom, (coreInfo) => {
    sendWalletDataUpdated({ coreInfo });
  });

  subscribe(userStatusQuery.valueAtom, (userStatus) => {
    sendWalletDataUpdated({ userStatus });
  });

  subscribe(addressBookAtom, (addressBook) => {
    sendWalletDataUpdated({ addressBook });
  });
}

type SettingsForModule = Pick<
  Settings,
  'locale' | 'fiatCurrency' | 'addressStyle'
>;

interface WalletData {
  theme?: Theme;
  settings?: SettingsForModule;
  // TODO: replace real types
  coreInfo?: any;
  userStatus?: any;
  addressBook?: AddressBook;
  moduleState?: Object | null;
  storageData?: any;
}
