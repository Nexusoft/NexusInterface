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

export const refreshNameRecords = async () => {
  try {
    const nameRecords = await listAll('names/list/names');
    const unusedRecords = await listAll('names/list/inactive');
    store.dispatch({
      type: TYPE.SET_NAME_RECORDS,
      payload: [...nameRecords, ...unusedRecords],
    });
  } catch (err) {
    console.error('names/list/names failed', err);
  }
};

export const refreshNamespaces = async () => {
  try {
    const namespaces = await listAll('names/list/namespaces');
    store.dispatch({ type: TYPE.SET_NAMESPACES, payload: namespaces });
  } catch (err) {
    console.error('names/list/namespaces failed', err);
  }
};

export const refreshAssets = async () => {
  try {
    let [assets] = await Promise.all([listAll('assets/list/assets')]);
    //TODO: Partial returns an error instead of a empty array if there are no assets found which is not the best way to do that, consider revising
    let partialAssets = [];
    try {
      partialAssets = await listAll('assets/list/partial');
    } catch (error) {
      if (error.code && error.code === -74) {
      } else throw error;
    }
    store.dispatch({
      type: TYPE.SET_ASSETS,
      payload: assets.concat(partialAssets),
    });
  } catch (err) {
    console.error('assets/list/assets failed', err);
  }
};
