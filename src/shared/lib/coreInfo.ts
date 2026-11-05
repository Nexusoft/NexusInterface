import { atom, useAtomValue } from 'jotai';
import { store } from 'lib/store';
import { callAPI, CoreInfo } from 'lib/api';
import { settingAtoms } from 'lib/settings';
import jotaiQuery from 'utils/jotaiQuery';
import { getSyncState, isFreshCoreInfo } from './coreHealth';

/**
 * New
 * =============================================================================
 */

const coreInfoPauseStateAtom = atom(false);
const coreInfoInvalidatedAtAtom = atom(0);
let coreInfoGeneration = 0;

export const coreInfoPausedAtom = atom(
  (get) => get(coreInfoPauseStateAtom),
  (get, set, paused: boolean) => {
    if (paused && !get(coreInfoPauseStateAtom)) {
      coreInfoGeneration++;
      set(coreInfoInvalidatedAtAtom, Date.now());
    }
    set(coreInfoPauseStateAtom, paused);
  }
);

/**
 * Last actionable Core connection failure from startup, probe, or RPC.
 * Cleared automatically when system/get/info succeeds.
 */
export const coreConnectionErrorAtom = atom<string | null>(null);

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return String(error || 'Unknown Core connection error');
}

export function setCoreConnectionError(error: unknown): void {
  const message = errorMessage(error);
  coreInfoGeneration++;
  store.set(coreInfoInvalidatedAtAtom, Date.now());
  store.set(coreConnectionErrorAtom, message);
  console.error('core.connection.error', message);
}

export function clearCoreConnectionError(): void {
  if (store.get(coreConnectionErrorAtom) != null) {
    store.set(coreConnectionErrorAtom, null);
  }
}

export const coreInfoQuery = jotaiQuery<CoreInfo>({
  alwaysOn: true,
  condition: (get) => !get(coreInfoPausedAtom),
  getQueryConfig: (get) => ({
    queryKey: ['coreInfo', !!get(settingAtoms.manualDaemon)],
    queryFn: async () => {
      const generation = coreInfoGeneration;
      try {
        const info = await callAPI('system/get/info');
        if (generation !== coreInfoGeneration || store.get(coreInfoPausedAtom)) {
          throw new Error('Core information request was superseded');
        }
        clearCoreConnectionError();
        return info;
      } catch (error) {
        if (generation !== coreInfoGeneration || store.get(coreInfoPausedAtom)) {
          throw error;
        }
        const message = errorMessage(error);
        console.error('core.rpc.system_get_info.failed', message);
        setCoreConnectionError(message);
        throw error;
      }
    },
    retry: 5,
    retryDelay: (attempt) => 500 + attempt * 1000,
    staleTime: 600000, // 10 minutes
    refetchInterval: 10000, // 10 seconds
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    placeholderData: (previousData) => previousData,
  }),
});

const freshnessClockAtom = atom(Date.now());
freshnessClockAtom.onMount = (set) => {
  const timer = setInterval(() => set(Date.now()), 1000);
  return () => clearInterval(timer);
};

export const freshCoreInfoAtom = atom((get) => {
  get(freshnessClockAtom);
  const now = Date.now();
  const query = get(coreInfoQuery.queryAtom);
  const unavailable =
    get(coreInfoPausedAtom) ||
    get(coreConnectionErrorAtom) !== null ||
    query.isError ||
    query.isPlaceholderData;
  return isFreshCoreInfo(
    query.dataUpdatedAt,
    now,
    unavailable,
    get(coreInfoInvalidatedAtAtom)
  )
    ? get(coreInfoQuery.valueAtom)
    : undefined;
});

export const coreConnectedAtom = atom((get) => !!get(freshCoreInfoAtom));

export const liteModeAtom = atom((get) => get(freshCoreInfoAtom)?.litemode);

export const syncStateAtom = atom((get) => getSyncState(get(freshCoreInfoAtom)));

export const synchronizedAtom = atom(
  (get) => get(syncStateAtom) === 'synchronized'
);

export const blocksAtom = atom((get) => get(freshCoreInfoAtom)?.blocks);

export const multiUserAtom = atom((get) => get(freshCoreInfoAtom)?.multiuser);

export const useCoreInfo = () => useAtomValue(freshCoreInfoAtom);

export const useCoreConnected = () => useAtomValue(coreConnectedAtom);

export const useSynchronized = () => useAtomValue(synchronizedAtom);

export const useSyncState = () => useAtomValue(syncStateAtom);

export const isCoreConnected = () => store.get(coreConnectedAtom);

export const isSynchronized = () => store.get(synchronizedAtom);

export const blockDateAtom = atom((get) => {
  const blocks = get(blocksAtom);
  if (!blocks) return null;
  return new Date();
});
