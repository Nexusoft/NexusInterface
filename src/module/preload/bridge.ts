/**
 * Minimal contextBridge surface for isolated module WebViews (NEXUS v2).
 * Do not import React, wallet components, or Node core modules here.
 */

import { contextBridge, ipcRenderer } from 'electron';

import type {
  NexusConfirmOptions,
  NexusModuleApiV2,
  NexusModuleWalletContext,
  NexusNotifyOptions,
  NexusSendDraft,
} from '../../shared/modules/nexusApiV2';
import { addContextListener, clearContextListeners, emitContextChanged } from './events';
import {
  assertCopyText,
  assertFunction,
  assertOpenableUrl,
  assertRecord,
  assertString,
} from './validation';

const CHANNELS = {
  invoke: 'module-api:invoke',
  contextChanged: 'module-api:context-changed',
} as const;

type InvokeResult =
  | { ok: true; value: unknown }
  | { ok: false; error: { code?: string; message?: string } };

async function invoke<T = unknown>(
  method: string,
  payload?: unknown
): Promise<T> {
  const result = (await ipcRenderer.invoke(CHANNELS.invoke, {
    method,
    payload,
  })) as InvokeResult;

  if (!result || typeof result !== 'object' || typeof result.ok !== 'boolean') {
    throw new Error('Invalid response from the Nexus module API broker');
  }
  if (!result.ok) {
    const error = new Error(result.error?.message || 'Module API request failed');
    (error as Error & { code?: string }).code = result.error?.code;
    throw error;
  }
  return result.value as T;
}

function createApi(): NexusModuleApiV2 {
  const api: NexusModuleApiV2 = {
    apiVersion: 2,
    walletVersion: typeof APP_VERSION === 'string' ? APP_VERSION : '',
    wallet: {
      getContext: () => invoke<NexusModuleWalletContext>('wallet.getContext'),
      onContextChanged: (listener) => {
        assertFunction(listener, 'listener');
        return addContextListener(listener);
      },
      requestSend: async (draft: NexusSendDraft) => {
        assertRecord(draft, 'draft');
        await invoke('wallet.requestSend', draft);
      },
    },
    ui: {
      notify: async (options: NexusNotifyOptions) => {
        assertRecord(options, 'options');
        assertString(options.content ?? '', 'options.content', {
          min: 0,
          max: 2000,
        });
        await invoke('ui.notify', options);
      },
      confirm: async (options: NexusConfirmOptions) => {
        assertRecord(options, 'options');
        assertString(options.question ?? 'Confirm?', 'options.question', {
          min: 1,
          max: 500,
        });
        return invoke<boolean>('ui.confirm', options);
      },
      openExternal: async (url: string) => {
        const safeUrl = assertOpenableUrl(url);
        await invoke('ui.openExternal', { url: safeUrl });
      },
      copyText: async (text: string) => {
        const safeText = assertCopyText(text);
        await invoke('ui.copyText', { text: safeText });
      },
    },
    storage: {
      get: () => invoke<Record<string, unknown>>('storage.get'),
      set: async (value: Record<string, unknown>) => {
        assertRecord(value, 'value');
        await invoke('storage.set', { value });
      },
    },
    state: {
      get: () => invoke<Record<string, unknown> | null>('state.get'),
      set: async (value: Record<string, unknown>) => {
        assertRecord(value, 'value');
        await invoke('state.set', { value });
      },
    },
  };

  return Object.freeze({
    ...api,
    wallet: Object.freeze({ ...api.wallet }),
    ui: Object.freeze({ ...api.ui }),
    storage: Object.freeze({ ...api.storage }),
    state: Object.freeze({ ...api.state }),
  });
}

export function exposeNexusModuleApi(): void {
  const api = createApi();

  const onContextChanged = (_event: Electron.IpcRendererEvent, context: unknown) => {
    if (context && typeof context === 'object') {
      emitContextChanged(context as NexusModuleWalletContext);
    }
  };
  ipcRenderer.on(CHANNELS.contextChanged, onContextChanged);

  window.addEventListener('unload', () => {
    ipcRenderer.removeListener(CHANNELS.contextChanged, onContextChanged);
    clearContextListeners();
  });

  // Open external http(s)/mailto links in the OS browser.
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.href;
      const download = anchor.getAttribute('download');
      if (!href || download) return;
      try {
        const url = new URL(href);
        if (
          url.protocol === 'https:' ||
          url.protocol === 'http:' ||
          url.protocol === 'mailto:'
        ) {
          // Same-origin module assets stay inside the webview.
          if (url.origin === window.location.origin) return;
          event.preventDefault();
          void api.ui.openExternal(url.toString());
        } else {
          event.preventDefault();
        }
      } catch {
        event.preventDefault();
      }
    },
    true
  );

  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('NEXUS', api);
  } else {
    // Legacy/dev fallback only — production guests always isolate.
    (window as Window).NEXUS = api;
  }
}

declare const APP_VERSION: string;
