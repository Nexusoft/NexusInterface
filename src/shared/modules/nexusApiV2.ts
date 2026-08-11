/**
 * Versioned TypeScript contract for the isolated NEXUS module API (v2).
 * Runtime validation lives in src/main/ipc/moduleApiV2.js.
 */

export const NEXUS_API_VERSION = 2 as const;

export type NexusModuleErrorCode =
  | 'module.invalid_request'
  | 'module.unknown_method'
  | 'module.unauthorized'
  | 'module.capability_denied'
  | 'module.disabled'
  | 'module.unknown'
  | 'module.payload_too_large'
  | 'module.rate_limited'
  | 'module.validation_failed'
  | 'module.host_unavailable'
  | 'module.internal';

export type NexusModuleCapability =
  | 'wallet.context'
  | 'ui.notify'
  | 'ui.confirm'
  | 'ui.openExternal'
  | 'ui.copyText'
  | 'storage'
  | 'state'
  | 'wallet.requestSend'
  | 'legacy.api';

export type NexusModuleMethod =
  | 'wallet.getContext'
  | 'ui.notify'
  | 'ui.confirm'
  | 'ui.openExternal'
  | 'ui.copyText'
  | 'storage.get'
  | 'storage.set'
  | 'state.get'
  | 'state.set'
  | 'wallet.requestSend';

export interface NexusModuleSettingsSummary {
  locale: string;
  fiatCurrency: string;
  addressStyle: string;
}

export interface NexusModuleCoreSummary {
  connected: boolean;
  synchronized: boolean;
  connections: number;
}

export interface NexusModuleSessionSummary {
  loggedIn: boolean;
}

/** Sanitized wallet context exposed to modules. No secrets or private material. */
export interface NexusModuleWalletContext {
  apiVersion: typeof NEXUS_API_VERSION;
  walletVersion: string;
  theme: Record<string, unknown> | null;
  settings: NexusModuleSettingsSummary;
  core: NexusModuleCoreSummary;
  session: NexusModuleSessionSummary;
  moduleState?: Record<string, unknown> | null;
  storageData?: Record<string, unknown>;
}

export interface NexusNotifyOptions {
  content: string;
  type?: 'info' | 'success' | 'error' | 'warning' | 'request';
  autoClose?: boolean | number;
}

export interface NexusConfirmOptions {
  question: string;
  note?: string;
  labelYes?: string;
  labelNo?: string;
  skinYes?: string;
  skinNo?: string;
}

export interface NexusSendRecipient {
  address: string;
  amount?: string;
  reference?: string;
  expireDays?: number;
  expireHours?: number;
  expireMinutes?: number;
  expireSeconds?: number;
}

export interface NexusSendDraft {
  sendFrom?: string;
  recipients: NexusSendRecipient[];
  advancedOptions?: boolean;
}

export type Unsubscribe = () => void;

/**
 * Minimal wallet-facing API available to third-party modules under isolation.
 * All values crossing the boundary are structured-cloneable plain data.
 */
export interface NexusModuleApiV2 {
  readonly apiVersion: typeof NEXUS_API_VERSION;
  readonly walletVersion: string;
  wallet: {
    getContext(): Promise<NexusModuleWalletContext>;
    onContextChanged(
      listener: (context: NexusModuleWalletContext) => void
    ): Unsubscribe;
    /** Navigates to the wallet-owned Send review flow. Never signs or broadcasts. */
    requestSend(draft: NexusSendDraft): Promise<void>;
  };
  ui: {
    notify(options: NexusNotifyOptions): Promise<void>;
    confirm(options: NexusConfirmOptions): Promise<boolean>;
    openExternal(url: string): Promise<void>;
    copyText(text: string): Promise<void>;
  };
  storage: {
    get(): Promise<Record<string, unknown>>;
    set(value: Record<string, unknown>): Promise<void>;
  };
  state: {
    get(): Promise<Record<string, unknown> | null>;
    set(value: Record<string, unknown>): Promise<void>;
  };
}

declare global {
  interface Window {
    NEXUS?: NexusModuleApiV2;
  }
}

export {};
