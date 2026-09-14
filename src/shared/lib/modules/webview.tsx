import { coreInfoQuery } from 'lib/coreInfo';
import { openConfirmDialog } from 'lib/dialog';
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
import { readModuleStorage } from './rendererStorage';

type WebviewTag = HTMLWebViewElement & {
  send(channel: string, ...args: unknown[]): void;
  openDevTools(): void;
  closeDevTools(): void;
  isDevToolsOpened(): boolean;
  getWebContentsId(): number;
};

type IpcMessageEvent = Event & {
  target: EventTarget & WebviewTag;
  channel: string;
  args: any[];
};

let activeWebView: WebviewTag | null = null;
let hostRequestUnsub: (() => void) | null = null;

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

function buildSanitizedContextExtras(moduleName?: string | null) {
  const settings = store.get(settingsAtom);
  const { locale, fiatCurrency, addressStyle } = settings;
  const name = moduleName ?? store.get(activeAppModuleNameAtom);
  return {
    walletVersion: typeof APP_VERSION === 'string' ? APP_VERSION : '',
    theme: store.get(themeAtom),
    settings: getSettingsForModules(locale, fiatCurrency, addressStyle),
    coreInfo: store.get(coreInfoQuery.valueAtom),
    userStatus: store.get(userStatusQuery.valueAtom),
    moduleState: name ? store.get(moduleStatesAtom)[name] : null,
  };
}

/**
 * Legacy ipc-message channels from pre-v2 guests.
 * Production v2 modules use the main-process broker exclusively.
 * Generic apiCall / secureApiCall / proxyRequest are rejected.
 */
function handleIpcMessage({ target, channel, args }: IpcMessageEvent) {
  const webview = target as WebviewTag;
  if (webview !== activeWebView) return;
  switch (channel) {
    case 'send':
      legacySend(args);
      break;
    case 'show-notification':
      showNotif(args);
      break;
    case 'confirm':
      confirm(args, webview);
      break;
    case 'update-state':
      updateState(args);
      break;
    case 'update-storage':
    case 'open-in-browser':
    case 'open-external':
    case 'copy-to-clipboard':
    case 'api-call':
    case 'secure-api-call':
    case 'proxy-request':
      console.warn(`Rejected privileged legacy module channel: ${channel}`);
      break;
    default:
      break;
  }
}

function legacySend([{ sendFrom, recipients, advancedOptions }]: any[]) {
  if (!Array.isArray(recipients)) return;
  const activeModule = getActiveModule();
  goToSend({
    sendFrom,
    recipients,
    advancedOptions,
    originatingModule: activeModule
      ? {
          name: activeModule.info.name,
          displayName: (activeModule.info as { displayName?: string })
            .displayName,
        }
      : undefined,
  });
}

function showNotif([options = {}]: any[]) {
  const { content, type, autoClose } = options;
  showNotification(content, { content, type, autoClose });
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
  if (
    typeof moduleState === 'object' &&
    moduleState &&
    !Array.isArray(moduleState)
  ) {
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

type HostRequest = {
  requestId: string;
  action: string;
  moduleName: string;
  displayName: string;
  payload?: any;
};

async function handleHostRequest(request: HostRequest) {
  const respond = async (
    ok: boolean,
    value?: unknown,
    error?: { code?: string; message?: string }
  ) => {
    try {
      await window.nexusElectron.modules.respondModuleApiHost({
        requestId: request.requestId,
        ok,
        value,
        error,
      });
    } catch (err) {
      console.error('Failed to respond to module host request', err);
    }
  };

  try {
    switch (request.action) {
      case 'getContext': {
        const extras = buildSanitizedContextExtras(request.moduleName);
        const modulesMap = store.get(modulesMapAtom);
        const module = modulesMap[request.moduleName];
        const storageData =
          module && module.enabled ? await readModuleStorage(module) : {};
        await respond(true, {
          ...extras,
          storageData,
        });
        break;
      }
      case 'notify': {
        const { content, type, autoClose } = request.payload || {};
        showNotification(content, { content, type, autoClose });
        await respond(true, undefined);
        break;
      }
      case 'confirm': {
        const { question, note, labelYes, skinYes, labelNo, skinNo } =
          request.payload || {};
        const agreed = await new Promise<boolean>((resolve) => {
          openConfirmDialog({
            question:
              question || `${request.displayName} requests confirmation`,
            note,
            labelYes,
            skinYes,
            labelNo,
            skinNo,
            callbackYes: () => resolve(true),
            callbackNo: () => resolve(false),
          });
        });
        await respond(true, agreed);
        break;
      }
      case 'state.get': {
        const moduleName = request.moduleName;
        const state = moduleName
          ? store.get(moduleStatesAtom)[moduleName] ?? null
          : null;
        await respond(true, state);
        break;
      }
      case 'state.set': {
        const moduleName = request.moduleName;
        const value = request.payload?.value;
        if (
          moduleName &&
          value &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          store.set(moduleStatesAtom, (states) => ({
            ...states,
            [moduleName]: value,
          }));
        }
        await respond(true, undefined);
        break;
      }
      case 'requestSend': {
        const { sendFrom, recipients, advancedOptions, originatingModule } =
          request.payload || {};
        if (!Array.isArray(recipients)) {
          await respond(false, undefined, {
            code: 'module.validation_failed',
            message: 'Send draft recipients are required',
          });
          break;
        }
        goToSend({
          sendFrom,
          recipients,
          advancedOptions,
          originatingModule: originatingModule || {
            name: request.moduleName,
            displayName: request.displayName,
          },
        });
        await respond(true, undefined);
        break;
      }
      default:
        await respond(false, undefined, {
          code: 'module.unknown_method',
          message: `Unknown host action: ${request.action}`,
        });
    }
  } catch (error: any) {
    await respond(false, undefined, {
      code: 'module.internal',
      message: error?.message || 'Host action failed',
    });
  }
}

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
  const active = getActiveWebView();
  if (active) {
    if (active.isDevToolsOpened()) {
      active.closeDevTools();
    } else {
      active.openDevTools();
    }
  }
};

async function publishContextUpdate(partial?: Partial<WalletData>) {
  const active = getActiveWebView();
  if (!active) return;

  const extras = buildSanitizedContextExtras();
  const activeModule = getActiveModule();
  let storageData = partial?.storageData;
  if (storageData === undefined && activeModule) {
    storageData = await readModuleStorage(activeModule);
  }

  try {
    await window.nexusElectron.modules.pushModuleContext({
      webContentsId: active.getWebContentsId(),
      context: {
        ...extras,
        ...partial,
        storageData: storageData ?? {},
      },
    });
  } catch {
    // Fail closed: never push unsanitized context from the renderer if the
    // main-process sanitizer path is unavailable.
  }
}

export function disposeModuleHostRelay() {
  if (hostRequestUnsub) {
    hostRequestUnsub();
    hostRequestUnsub = null;
  }
}

export function prepareWebView() {

  subscribe(activeAppModuleNameAtom, (moduleName) => {
    const webview = getActiveWebView();
    if (webview) {
      webview.addEventListener('ipc-message', handleIpcMessage);
      webview.addEventListener('dom-ready', () => {
        void publishContextUpdate();
      });
    }
    if (moduleName) {
      void publishContextUpdate();
    }
  });

  if (hostRequestUnsub) {
    hostRequestUnsub();
    hostRequestUnsub = null;
  }
  hostRequestUnsub = window.nexusElectron.modules.onModuleApiHostRequest(
    (request: HostRequest) => {
      void handleHostRequest(request);
    }
  );

  subscribeWithPrevious(settingsAtom, (newSettings, oldSettings) => {
    if (settingsChanged(oldSettings, newSettings)) {
      void publishContextUpdate();
    }
  });

  subscribe(themeAtom, () => {
    void publishContextUpdate();
  });

  subscribe(coreInfoQuery.valueAtom, () => {
    void publishContextUpdate();
  });

  subscribe(userStatusQuery.valueAtom, () => {
    void publishContextUpdate();
  });
}

type SettingsForModule = Pick<
  Settings,
  'locale' | 'fiatCurrency' | 'addressStyle'
>;

interface WalletData {
  theme?: Theme;
  settings?: SettingsForModule;
  coreInfo?: any;
  userStatus?: any;
  moduleState?: Object | null;
  storageData?: any;
}

declare const APP_VERSION: string;
