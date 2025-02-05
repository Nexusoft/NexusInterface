import { callAPI } from 'lib/api';
import { settingAtoms } from 'lib/settings';
import jotaiQuery from 'utils/jotaiQuery';
import { coreConnectedAtom } from 'lib/coreInfo';
import { LedgerInfo } from 'lib/api';

export const ledgerInfoQuery = jotaiQuery<LedgerInfo>({
  condition: (get) => get(coreConnectedAtom),
  getQueryConfig: (get) => ({
    queryKey: ['ledgerInfo', !!get(settingAtoms.manualDaemon)],
    queryFn: () => callAPI('ledger/get/info'),
    retry: 2,
    retryDelay: 5000,
    staleTime: 3600000, // 1 hour
    refetchInterval: 900000, // 15 minutes
    refetchOnReconnect: 'always',
    placeholderData: (previousData) => previousData,
  }),
});
