import { atom } from 'jotai';

import { coreInfoQuery } from './coreInfo';
import { store, subscribe } from 'lib/store';
import { showNotification, openModal } from 'lib/ui';
import { confirm, openErrorDialog, openSuccessDialog } from 'lib/dialog';
import { updateSettings, settingsAtom } from 'lib/settings';
import BootstrapModal from 'components/BootstrapModal';

__ = __context('Bootstrap');

export type BootstrapStep =
  | 'idle'
  | 'prompting'
  | 'backing_up'
  | 'preparing'
  | 'downloading'
  | 'extracting'
  | 'stopping_core'
  | 'moving_db'
  | 'restarting_core'
  | 'rescanning'
  | 'cleaning_up';

export interface BootstrapDownloadDetails {
  downloaded: number;
  totalSize?: number;
}

export interface BootstrapStatus {
  step: BootstrapStep;
  details?: BootstrapDownloadDetails;
}

type BootstrapEvent = 'abort' | 'error' | 'success';
type BootstrapListener = (error?: unknown) => void;

class BootstrapEventEmitter {
  private listeners = new Map<BootstrapEvent, Set<BootstrapListener>>();

  on(event: BootstrapEvent, listener: BootstrapListener) {
    const listeners = this.listeners.get(event) || new Set();
    listeners.add(listener);
    this.listeners.set(event, listeners);
  }

  off(event: BootstrapEvent, listener: BootstrapListener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: BootstrapEvent, error?: unknown) {
    this.listeners.get(event)?.forEach((listener) => listener(error));
  }
}

export const bootstrapStatusAtom = atom<BootstrapStatus>({
  step: 'idle',
  details: undefined,
});

export const bootstrapEvents = new BootstrapEventEmitter();

const setStatus = (step: BootstrapStep, details?: BootstrapDownloadDetails) => {
  store.set(bootstrapStatusAtom, { step, details });
};

async function startBootstrap() {
  try {
    const result = (await window.nexusElectron.bootstrap.start()) as {
      aborted?: boolean;
    };
    bootstrapEvents.emit(result?.aborted ? 'abort' : 'success');
  } catch (error) {
    bootstrapEvents.emit('error', error);
  }
}

subscribe(coreInfoQuery.valueAtom, async (coreInfo) => {
  const coreConnected = !!coreInfo;
  const { bootstrapSuggestionDisabled, manualDaemon } = store.get(settingsAtom);
  const bootstrapStatus = store.get(bootstrapStatusAtom);

  if (
    coreConnected &&
    !bootstrapSuggestionDisabled &&
    bootstrapStatus.step === 'idle' &&
    !manualDaemon &&
    !coreInfo?.litemode &&
    coreInfo?.syncing !== false &&
    coreInfo.syncing.completed < 50 &&
    coreInfo.syncing.completed >= 0 &&
    !coreInfo?.private &&
    !coreInfo?.testnet
  ) {
    bootstrap({ suggesting: true });
  }
});

export async function bootstrap(options?: { suggesting?: boolean }) {
  const { suggesting } = options || {};
  if (store.get(bootstrapStatusAtom).step !== 'idle') return;

  setStatus('prompting');
  const coreInfo = store.get(coreInfoQuery.valueAtom);
  if (coreInfo?.private || coreInfo?.testnet) {
    openErrorDialog({
      message: __('Can not Bootstrap on Testnet/Private networks.'),
    });
    setStatus('idle');
    return;
  }

  const confirmed = await confirm({
    question: __('Download recent database?'),
    note: __(
      'Downloading a recent version of the database might reduce the time it takes to synchronize your wallet'
    ),
    labelYes: __("Yes, let's bootstrap it"),
    labelNo: __('No, let it sync'),
    skinNo: suggesting ? 'danger' : undefined,
    style: { width: 530 },
  });
  if (!confirmed) {
    if (suggesting) updateSettings({ bootstrapSuggestionDisabled: true });
    setStatus('idle');
    return;
  }

  void startBootstrap();
  openModal(BootstrapModal);
}

export function abortBootstrap() {
  void window.nexusElectron.bootstrap.abort();
}

export function prepareBootstrap() {
  window.nexusElectron.bootstrap.onStatus((status) => {
    const step = status.step as BootstrapStep;
    setStatus(step, status.details);
  });
  bootstrapEvents.on('abort', () =>
    showNotification(__('Bootstrap process has been aborted'), 'error')
  );
  bootstrapEvents.on('error', (error) => {
    console.error(error);
    openErrorDialog({
      message: __('Error bootstrapping recent database'),
      note:
        typeof error === 'string'
          ? error
          : (error as Error)?.message || __('Unknown error'),
    });
  });
  bootstrapEvents.on('success', () =>
    openSuccessDialog({
      message: __('Recent database has been successfully bootstrapped'),
    })
  );
}
