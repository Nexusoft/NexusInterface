type ElectronBridgeListener = (event: undefined, ...args: any[]) => void;

export interface MenuItemConstructorOptions {
  label?: string;
  accelerator?: string;
  role?: string;
  type?: string;
  id?: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  click?: (...args: any[]) => void;
  submenu?: MenuItemConstructorOptions[];
}

const bridge = window.nexusElectron;

if (!bridge) {
  throw new Error('Nexus Electron bridge is not available');
}

const subscriptionsByChannel = new Map<
  string,
  Map<ElectronBridgeListener, () => void>
>();

function invokeLegacy(channel: string, args: any[]) {
  switch (channel) {
    case 'is-force-quit':
      return bridge.app.isForceQuit();
    case 'quit-app':
      return bridge.app.quit();
    case 'exit-app':
      return bridge.app.exit();
    case 'hide-window':
      return bridge.app.hideWindow();
    case 'hide-dock':
      return bridge.app.hideDock();
    case 'popup-context-menu':
      return bridge.app.popupContextMenu(args[0], args[1]);
    case 'set-app-menu':
      return bridge.app.setMenu(args[0]);
    case 'open-virtual-keyboard':
      return bridge.app.openVirtualKeyboard(args[0]);
    case 'serve-module-files':
      return bridge.modules.prepareFiles(args[0]);
    case 'check-core-exists':
      return bridge.core.getStatus().then((status: any) => status.exists);
    case 'core-binary-status':
      return bridge.core.getStatus().then((status: any) => status.status);
    case 'check-core-running':
      return bridge.core.getStatus().then((status: any) => status.running);
    case 'start-core':
      return bridge.core.start(args[0]);
    case 'kill-core-process':
      return bridge.core.kill();
    case 'execute-core-command':
      return bridge.core.executeConsoleCommand(args[0]);
    case 'check-for-updates':
      return bridge.updater.check();
    case 'quit-and-install-update':
      return bridge.updater.quitAndInstall({
        isSilent: args[0],
        isForceRunAfter: args[1],
      });
    case 'set-allow-prerelease':
      return bridge.updater.setAllowPrerelease(args[0]);
    case 'migrate-to-mainnet':
      return bridge.updater.migrateToMainnet();
    case 'show-open-dialog':
    case 'show-save-dialog':
      throw new Error(
        `${channel} is not available through the compatibility bridge; use a named dialog operation`
      );
    default:
      throw new Error(`IPC channel is not available: ${channel}`);
  }
}

function eventSubscription(channel: string, listener: ElectronBridgeListener) {
  const relay = (...args: any[]) => listener(undefined, ...args);
  switch (channel) {
    case 'window-close':
      return bridge.app.onWindowClose(relay);
    case 'usage-tracking-error-relay':
      return bridge.app.onUsageTrackingError(relay);
    case 'keyboard-input-change':
      return bridge.app.onKeyboardInputChange(relay);
    case 'updater:error':
      return bridge.updaterEvents.onError(relay);
    case 'updater:checking-for-update':
      return bridge.updaterEvents.onChecking(relay);
    case 'updater:update-available':
      return bridge.updaterEvents.onAvailable(relay);
    case 'updater:update-not-available':
      return bridge.updaterEvents.onNotAvailable(relay);
    case 'updater:download-progress':
      return bridge.updaterEvents.onDownloadProgress(relay);
    case 'updater:update-downloaded':
      return bridge.updaterEvents.onDownloaded(relay);
    default:
      if (/^menu-click:[A-Za-z0-9_.-]+$/.test(channel)) {
        return bridge.app.onMenuClick(channel.slice('menu-click:'.length), relay);
      }
      throw new Error(`IPC event channel is not available: ${channel}`);
  }
}

export const ipcRenderer = {
  invoke: (channel: string, ...args: any[]) => invokeLegacy(channel, args),
  sendSync: (_channel: string, ..._args: any[]) => {
    throw new Error(
      'Synchronous IPC is only available through named bootstrap bridge methods'
    );
  },
  on: (channel: string, listener: ElectronBridgeListener) => {
    if (typeof listener !== 'function') {
      throw new TypeError('IPC listener must be a function');
    }
    const unsubscribe = eventSubscription(channel, listener);
    let listeners = subscriptionsByChannel.get(channel);
    if (!listeners) {
      listeners = new Map();
      subscriptionsByChannel.set(channel, listeners);
    }
    listeners.get(listener)?.();
    listeners.set(listener, unsubscribe);
    return { channel, listener, unsubscribe };
  },
  once: (channel: string, listener: ElectronBridgeListener) => {
    if (channel === 'keyboard-closed') {
      bridge.app.onceKeyboardClosed(() => listener(undefined));
      return;
    }
    let unsubscribe: (() => void) | undefined;
    unsubscribe = eventSubscription(channel, (...args) => {
      unsubscribe?.();
      listener(undefined, ...args);
    });
  },
  off: (channel: string, listenerOrSubscription: any) => {
    if (typeof listenerOrSubscription === 'function') {
      const listeners = subscriptionsByChannel.get(channel);
      listeners?.get(listenerOrSubscription)?.();
      listeners?.delete(listenerOrSubscription);
      if (listeners?.size === 0) subscriptionsByChannel.delete(channel);
      return;
    }
    listenerOrSubscription?.unsubscribe?.();
  },
};

export const clipboard = bridge.clipboard;
export const shell = {
  openExternal: (url: string) => bridge.app.openExternal(url),
};

export type WebviewTag = HTMLWebViewElement & {
  send(channel: string, ...args: any[]): void;
  openDevTools(): void;
  closeDevTools(): void;
  isDevToolsOpened(): boolean;
  getWebContentsId(): number;
};

export type IpcMessageEvent = {
  target: WebviewTag;
  channel: string;
  args: any[];
};
