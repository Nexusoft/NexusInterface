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

export const coreInfoQuery = jotaiQuery<CoreInfo>({
  alwaysOn: true,
  condition: (get) => !get(coreInfoPausedAtom),
  getQueryConfig: (get) => ({
    queryKey: ['coreInfo', !!get(settingAtoms.manualDaemon)],
    queryFn: () => callAPI('system/get/info'),
    retry: 5,
    retryDelay: (attempt) => 500 + attempt * 1000,
    staleTime: 600000, // 10 minutes
    refetchInterval: 10000, // 10 seconds
    //core health and staking status need it while the window is hidden or covered too
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    placeholderData: (previousData) => previousData,
  }),
});

export const coreConnectedAtom = atom((get) => !!get(coreInfoQuery.valueAtom));

export const liteModeAtom = atom(
  (get) => get(coreInfoQuery.valueAtom)?.litemode
);

/** Set by lib/coreHealth when the core stopped taking blocks while peers are ahead */
export const coreStuckAtom = atom<{
  blocks: number;
  network: number;
  since: number;
} | null>(null);

export const synchronizedAtom = atom(
  (get) => !get(coreInfoQuery.valueAtom)?.syncing && !get(coreStuckAtom)
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
