// Global variables injected by webpack base config (configs/webpack.config.base.babel.js)
declare const APP_VERSION: string;
declare const BUILD_DATE: string;
declare const BACKWARD_COMPATIBLE_VERSION: string;
declare const APP_ID: string;
declare const NEXUS_EMBASSY_PUBLIC_KEY: string;
declare const LOCK_TESTNET: string;

type NexusPlatform =
  | 'aix'
  | 'android'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'openbsd'
  | 'sunos'
  | 'win32'
  | 'cygwin'
  | 'netbsd';

interface NexusEnvironment {
  NODE_ENV: string;
  PORT: string;
  platform: NexusPlatform;
  arch: string;
}

interface NexusElectronBridge {
  environment: NexusEnvironment;
  paths: {
    getBootstrap(): Record<string, never>;
  };
  settings: {
    getInitial(): {
      settings: Record<string, unknown>;
      addressBook: Record<string, unknown>;
    };
    update(updates: Record<string, unknown>): Promise<Record<string, unknown>>;
    getAddressBook(): Promise<Record<string, unknown>>;
    saveAddressBook(
      addressBook: Record<string, unknown>
    ): Promise<Record<string, unknown>>;
  };
  theme: {
    getInitial(): Record<string, unknown>;
    update(updates: Record<string, unknown>): Promise<Record<string, unknown>>;
    selectWallpaper(): Promise<string | undefined>;
    importFromDialog(): Promise<Record<string, unknown> | undefined>;
    exportToDialog(): Promise<boolean>;
  };
  dialogs: {
    selectBackupDirectory(): Promise<string[] | undefined>;
    selectCoreBinary(): Promise<string[] | undefined>;
    selectModuleArchive(): Promise<string[] | undefined>;
    selectModuleDirectory(): Promise<string[] | undefined>;
    selectDevModuleDirectory(): Promise<string[] | undefined>;
  };
  core: {
    getStatus(): Promise<Record<string, unknown>>;
    getConfiguration(): Promise<{
      ip: string;
      apiSSL: boolean;
      apiPort: string;
      apiPortSSL: string;
      txExpiry?: number;
    }>;
    start(): Promise<unknown>;
    kill(): Promise<unknown>;
    resyncLiteDatabase(): Promise<unknown>;
    subscribeOutput(): Promise<unknown>;
    unsubscribeOutput(): Promise<unknown>;
    onOutput(listener: (lines: string[]) => void): () => void;
    executeConsoleCommand(command: string): Promise<unknown>;
  };
  coreRpc: {
    call(request: {
      endpoint: string;
      params?: Record<string, unknown>;
    }): Promise<unknown>;
    callByUrl(url: string): Promise<unknown>;
  };
  bootstrap: {
    start(): Promise<unknown>;
    abort(): Promise<unknown>;
    onStatus(
      listener: (status: {
        step: string;
        details?: { downloaded: number; totalSize?: number };
      }) => void
    ): () => void;
  };
  modules: {
    prepareFiles(moduleName: string, files: string[]): Promise<unknown>;
    list(): Promise<unknown>;
    inspectInstallSource(source: string): Promise<unknown>;
    install(request: Record<string, unknown>): Promise<unknown>;
    addDevelopment(path: string): Promise<unknown>;
    remove(name: string): Promise<unknown>;
    downloadAndInstall(request: Record<string, unknown>): Promise<unknown>;
    abortDownload(name: string): Promise<unknown>;
    getEntry(name: string): Promise<unknown>;
    readStorage(name: string): Promise<unknown>;
    writeStorage(name: string, data: Record<string, unknown>): Promise<unknown>;
    getFeatured(): Promise<unknown>;
    checkUpdates(): Promise<unknown>;
    openFailureLocation(name: string): Promise<unknown>;
    onDownloadProgress(
      listener: (progress: {
        moduleName: string;
        downloaded?: number;
        totalSize?: number;
        downloading: boolean;
      }) => void
    ): () => void;
    pushModuleContext(request: {
      webContentsId: number;
      context: Record<string, unknown>;
    }): Promise<boolean>;
    respondModuleApiHost(response: {
      requestId: string;
      ok: boolean;
      value?: unknown;
      error?: { code?: string; message?: string };
    }): Promise<boolean>;
    onModuleApiHostRequest(
      listener: (request: {
        requestId: string;
        action: string;
        moduleName: string;
        displayName: string;
        payload?: unknown;
      }) => void
    ): () => void;
  };
  updater: {
    check(): Promise<unknown>;
    quitAndInstall(options?: {
      isSilent?: boolean;
      isForceRunAfter?: boolean;
    }): Promise<unknown>;
    setAllowPrerelease(value: boolean): Promise<unknown>;
    migrateToMainnet(): Promise<unknown>;
    getMarketData(): Promise<unknown>;
  };
  fileAssets: {
    readModuleIcon(
      moduleName: string,
      icon: string
    ): Promise<{ type: 'svg' | 'url'; content: string }>;
    fetchExternalIcon(url: string): Promise<string>;
    loadRecoveryWords(): Promise<string[]>;
    lookupGeoIp(addresses: string[]): Promise<
      Array<{
        address: string;
        latitude: number;
        longitude: number;
        timeZone: string;
      } | null>
    >;
    lookupPublicGeoIp(): Promise<{
      latitude: number;
      longitude: number;
      timeZone: string;
    }>;
    loadTranslation(locale: string): Record<string, Record<string, string>>;
  };
  app: {
    isForceQuit(): Promise<boolean>;
    quit(): Promise<void>;
    exit(): Promise<void>;
    hideWindow(): Promise<void>;
    hideDock(): Promise<void>;
    setOpenOnStart(enabled: boolean): Promise<void>;
    popupContextMenu(
      template: unknown[],
      webContentsId?: number
    ): Promise<string | undefined>;
    setMenu(template: unknown[]): Promise<void>;
    openVirtualKeyboard(options: Record<string, unknown>): Promise<unknown>;
    openExternal(url: string): Promise<void>;
    openManagedPath(name: 'walletData' | 'coreData'): Promise<string>;
    onWindowClose(listener: () => void): () => void;
    onUsageTrackingError(listener: (message: string) => void): () => void;
    onKeyboardInputChange(listener: (text: string) => void): () => void;
    onceKeyboardClosed(listener: () => void): void;
    onMenuClick(id: string, listener: (...args: unknown[]) => void): () => void;
  };
  clipboard: {
    writeText(text: string): Promise<{ written: boolean }>;
  };
  updaterEvents: {
    onAvailable(listener: (updateInfo: unknown) => void): () => void;
    onDownloaded(listener: (updateInfo: unknown) => void): () => void;
    onError(listener: (error: unknown) => void): () => void;
    onChecking(listener: () => void): () => void;
    onNotAvailable(listener: () => void): () => void;
    onDownloadProgress(listener: () => void): () => void;
  };
  aptabase: {
    trackEvent(eventName: string, props?: Record<string, unknown>): Promise<void>;
  };
}

interface Window {
  nexusEnv: NexusEnvironment;
  nexusElectron: NexusElectronBridge;
}

declare var __: typeof import('lib/intl').translate;
declare var ___: typeof import('lib/intl').translateWithContext;
declare var __context: typeof import('lib/intl').withContext;

// File types that can be imported by webpack loaders
declare module '*.svg' {
  const content: {
    id: string;
    viewBox: string;
    url: string;
  };
  export default content;
}
declare module '*.ico' {
  const content: string;
  export default content;
}
declare module '*.gif' {
  const content: string;
  export default content;
}
declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}
declare module '*.jpeg' {
  const content: string;
  export default content;
}
declare module '*.webp' {
  const content: string;
  export default content;
}
declare module '*.MD' {
  const content: string;
  export default content;
}
declare module '*.woff2' {
  const content: string;
  export default content;
}
declare module '*.css' {
  const content: string;
  export default content;
}
