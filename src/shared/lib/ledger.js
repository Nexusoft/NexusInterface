import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { callAPI } from 'lib/api';
import { coreConnectedAtom } from './coreInfo';

export const ledgerInfoPollingAtom = atomWithQuery((get) => ({
  queryKey: ['ledgerInfo'],
  queryFn: () => callAPI('ledger/get/info'),
  enabled: get(coreConnectedAtom),
  retry: 2,
  retryDelay: 5000,
  staleTime: 3600000, // 1 hour
  refetchInterval: 900000, // 15 minutes
  refetchOnReconnect: 'always',
  placeholderData: (previousData) => previousData,
}));

export const ledgerInfoAtom = atom(
  (get) => get(ledgerInfoPollingAtom)?.data || null
);

export const refetchLedgerInfoAtom = atom(
  (get) => get(ledgerInfoPollingAtom)?.refetch || (() => {})
);
