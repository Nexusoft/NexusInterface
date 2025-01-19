import { callAPI } from 'lib/api';
import { settingAtoms } from './settings';
import jotaiQuery from 'utils/jotaiQuery';
import { coreConnectedAtom } from './coreInfo';

export const ledgerInfoQuery = jotaiQuery({
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
