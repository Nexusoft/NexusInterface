import { useEffect } from 'react';
import { atom, useAtomValue } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { jotaiStore, subscribe } from 'store';
import { callAPI } from 'lib/api';
import { settingsAtom } from './settings';
import { bootstrap, bootstrapStatusAtom } from 'lib/bootstrap';

// TODO: move to right places
export function useCoreInfoPolling() {
  useEffect(() => {
    return subscribe(coreInfoAtom, async (coreInfo) => {
      const coreConnected = !!coreInfo;
      const { bootstrapSuggestionDisabled, manualDaemon } =
        jotaiStore.get(settingsAtom);
      const bootstrapStatus = jotaiStore.get(bootstrapStatusAtom);

      if (coreConnected) {
        if (
          !bootstrapSuggestionDisabled &&
          bootstrapStatus.step === 'idle' &&
          !manualDaemon &&
          !coreInfo?.litemode &&
          coreInfo?.syncing?.completed < 50 &&
          coreInfo?.syncing?.completed >= 0 &&
          !coreInfo?.private &&
          !coreInfo?.testnet
        ) {
          bootstrap({ suggesting: true });
        }
      }
    });
  }, []);
  useEffect(() => {
    return subscribe(blocksAtom, () => {
      jotaiStore.set(blockDateAtom, new Date());
    });
  });
}

/**
 * New
 * =============================================================================
 */

export const coreInfoPausedAtom = atom(false);

export const coreInfoPollingAtom = atomWithQuery((get) => ({
  queryKey: ['coreInfo'],
  queryFn: () => callAPI('system/get/info'),
  enabled: !get(coreInfoPausedAtom),
  retry: 5,
  retryDelay: (attempt) => 500 + attempt * 1000,
  staleTime: 600000, // 10 minutes
  refetchInterval: 10000, // 10 seconds
  refetchOnWindowFocus: 'always',
  refetchOnReconnect: 'always',
  placeholderData: (previousData) => previousData,
}));

export const coreInfoAtom = atom((get) => {
  const query = get(coreInfoPollingAtom);
  if (!query || query.isError || get(coreInfoPausedAtom)) {
    return null;
  } else {
    return query.data || null;
  }
});

const refetchCoreInfoAtom = atom(
  (get) => get(coreInfoPollingAtom)?.refetch || (() => {})
);

export function refetchCoreInfo() {
  jotaiStore.get(refetchCoreInfoAtom)?.();
}

export const coreConnectedAtom = atom((get) => !!get(coreInfoAtom));

export const liteModeAtom = atom((get) => get(coreInfoAtom)?.litemode);

export const synchronizedAtom = atom((get) => !get(coreInfoAtom)?.syncing);

export const blocksAtom = atom((get) => get(coreInfoAtom)?.blocks);

export const multiUserAtom = atom((get) => get(coreInfoAtom)?.multiuser);

export const useCoreInfo = () => useAtomValue(coreInfoAtom);

export const useCoreConnected = () => useAtomValue(coreConnectedAtom);

export const useSynchronized = () => useAtomValue(synchronizedAtom);

export const isCoreConnected = () => jotaiStore.get(coreConnectedAtom);

export const isSynchronized = () => jotaiStore.get(synchronizedAtom);

export const blockDateAtom = atom(null);
