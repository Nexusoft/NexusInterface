import { atom, useAtomValue } from 'jotai';
import { store } from 'lib/store';
import { callAPI, CoreInfo } from 'lib/api';
import { settingAtoms } from 'lib/settings';
import jotaiQuery from 'utils/jotaiQuery';

/**
 * New
 * =============================================================================
 */

export const coreInfoPausedAtom = atom(false);

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
      try {
        const info = await callAPI('system/get/info');
        clearCoreConnectionError();
        return info;
      } catch (error) {
        const message = errorMessage(error);
        console.error('core.rpc.system_get_info.failed', message);
        // Ignore failures that complete after an intentional pause/stop so
        // shutdown races do not overwrite a clean stopped state.
        if (!store.get(coreInfoPausedAtom)) {
          setCoreConnectionError(message);
        }
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

export const coreConnectedAtom = atom((get) => !!get(coreInfoQuery.valueAtom));

export const liteModeAtom = atom(
  (get) => get(coreInfoQuery.valueAtom)?.litemode
);

export const synchronizedAtom = atom(
  (get) => !get(coreInfoQuery.valueAtom)?.syncing
);

export const blocksAtom = atom((get) => get(coreInfoQuery.valueAtom)?.blocks);

export const multiUserAtom = atom(
  (get) => get(coreInfoQuery.valueAtom)?.multiuser
);

export const useCoreInfo = () => useAtomValue(coreInfoQuery.valueAtom);

export const useCoreConnected = () => useAtomValue(coreConnectedAtom);

export const useSynchronized = () => useAtomValue(synchronizedAtom);

export const isCoreConnected = () => store.get(coreConnectedAtom);

export const isSynchronized = () => store.get(synchronizedAtom);

export const blockDateAtom = atom((get) => {
  const blocks = get(blocksAtom);
  if (!blocks) return null;
  return new Date();
});
