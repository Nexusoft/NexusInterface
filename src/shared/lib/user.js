import * as TYPE from 'consts/actionTypes';
import store, { jotaiQuery } from 'store';
import { callAPI as callAPI } from 'lib/api';
import memoize from 'utils/memoize';
import { loggedInAtom, userGenesisAtom, txCountAtom } from './session';
import listAll from 'utils/listAll';

export const balancesQuery = jotaiQuery({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['balances', get(userGenesisAtom)],
    queryFn: () => callAPI('finance/get/balances'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  selectValue: memoize((balances) => {
    if (!balances) return [undefined, undefined];
    const nxsIndex = balances.findIndex(({ token }) => token === '0');
    const tokenBalances = [...balances];
    const [nxsBalances] =
      nxsIndex >= 0 ? tokenBalances.splice(nxsIndex, 1) : [undefined];
    return [nxsBalances, tokenBalances];
  }),
  refetchTriggers: [txCountAtom],
});

function processToken(token) {
  if (token.ticker?.startsWith?.('local:')) {
    token.tickerIsLocal = true;
    token.ticker = token.ticker.substring(6);
  }
}

export const tokensQuery = jotaiQuery({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['tokens', get(userGenesisAtom)],
    queryFn: () => listAll('finance/list/tokens'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  selectValue: memoize((tokens) => tokens?.map(processToken)),
  refetchTriggers: [txCountAtom],
});

// function processAccount(account) {
//   if (account.name?.startsWith?.('local:')) {
//     account.nameIsLocal = true;
//     account.name = account.name.substring(6);
//   }
//   if (account.name?.startsWith?.('user:')) {
//     account.nameIsLocal = true;
//     account.name = account.name.substring(5);
//   }
//   if (account.ticker?.startsWith?.('local:')) {
//     account.tickerIsLocal = true;
//     account.ticker = account.ticker.substring(6);
//   }
// }

export const accountsQuery = jotaiQuery({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['accounts', get(userGenesisAtom)],
    queryFn: () => callAPI('finance/list/any'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export const nameRecordsQuery = jotaiQuery({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['nameRecords', get(userGenesisAtom)],
    queryFn: async () => {
      const nameRecords = await listAll('names/list/names');
      const unusedRecords = await listAll('names/list/inactive');
      return [...nameRecords, ...unusedRecords];
    },
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export const namespacesQuery = jotaiQuery({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['namespacesQuery', get(userGenesisAtom)],
    queryFn: () => listAll('names/list/namespaces'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export const assetsQuery = jotaiQuery({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: async (get) => ({
    queryKey: ['assets', get(userGenesisAtom)],
    queryFn: async () => {
      let [assets] = await Promise.all([listAll('assets/list/assets')]);
      //TODO: Partial returns an error instead of a empty array if there are no assets found which is not the best way to do that, consider revising
      let partialAssets = [];
      try {
        partialAssets = await listAll('assets/list/partial');
      } catch (error) {
        // Reason?
        if (error?.code !== -74) {
          throw error;
        }
      }
      return assets.concat(partialAssets);
    },
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});
