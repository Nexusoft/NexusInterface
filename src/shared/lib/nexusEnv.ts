/**
 * Safe accessor for `window.nexusEnv`, which is exposed by the preload
 * script (see src/main/preload.js). Renderer code should read platform/env
 * information through this module instead of Node globals, since those are
 * unavailable in the renderer's main world when contextIsolation is enabled
 * and nodeIntegration is disabled.
 */
export interface NexusEnv {
  /** Build environment from the main-process preload snapshot. */
  NODE_ENV: string;
  /** Host platform from the main-process preload snapshot. */
  platform: NexusPlatform;
  /** Host CPU architecture from the main-process preload snapshot. */
  arch: string;
}

const fallbackNexusEnv: NexusEnv = {
  NODE_ENV: 'production',
  platform: 'linux',
  arch: '',
};

const injectedNexusEnv: NexusEnv | undefined = window.nexusEnv;
if (!injectedNexusEnv) {
  // window.nexusEnv should always be set by the preload script
  // (src/main/preload.js). If it's missing, fall back to safe defaults but
  // log loudly so the misconfiguration doesn't silently masquerade as Linux.
  console.error(
    'window.nexusEnv is not available; the preload bridge may not have run. ' +
      'Falling back to default platform/env values, which may be incorrect.'
  );
}

const nexusEnv: NexusEnv = injectedNexusEnv || fallbackNexusEnv;

export default nexusEnv;

export const isDevelopment = nexusEnv.NODE_ENV === 'development';
export const platform = nexusEnv.platform;
