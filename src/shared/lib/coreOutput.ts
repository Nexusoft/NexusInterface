import { atom } from 'jotai';

import { store, subscribe } from 'lib/store';
import { coreConnectedAtom } from 'lib/coreInfo';
import { settingsAtom } from 'lib/settings';

export const coreOutputAtom = atom<string[]>([]);
export const coreOutputPausedAtom = atom<boolean>(false);

let unsubscribeOutput: (() => void) | undefined;
let outputWatchActive = false;

export function togglePaused(): void {
  store.set(coreOutputPausedAtom, (paused) => !paused);
}

function printCoreOutput(output: string[]): void {
  if (store.get(coreOutputPausedAtom)) return;
  store.set(coreOutputAtom, (currentOutput) =>
    [...output, ...currentOutput].slice(0, 1000)
  );
}

export function stopCoreOuputWatch(): void {
  unsubscribeOutput?.();
  unsubscribeOutput = undefined;
  outputWatchActive = false;
  void window.nexusElectron.core.unsubscribeOutput();
  store.set(coreOutputAtom, []);
}

/**
 * Start or stop Core log tailing based on connection state.
 * Must be safe to call when connection is already true (module import after
 * connect, or Terminal opened late) — store.subscribe is change-only.
 */
export function syncCoreOutputWatch(coreConnected = store.get(coreConnectedAtom)): void {
  if (!coreConnected || store.get(settingsAtom).manualDaemon) {
    if (outputWatchActive) {
      console.info('core.output.unsubscribe');
      stopCoreOuputWatch();
    }
    return;
  }

  if (outputWatchActive) {
    return;
  }

  console.info('core.output.subscribe');
  unsubscribeOutput?.();
  unsubscribeOutput = window.nexusElectron.core.onOutput(printCoreOutput);
  outputWatchActive = true;
  void window.nexusElectron.core.subscribeOutput().catch((error) => {
    console.error('core.output.subscribe.failed', error);
    unsubscribeOutput?.();
    unsubscribeOutput = undefined;
    outputWatchActive = false;
  });
}

// Immediate sync covers the case where Terminal imports this module after Core
// is already connected (store.sub alone would miss the current true value).
syncCoreOutputWatch();
subscribe(coreConnectedAtom, syncCoreOutputWatch);
