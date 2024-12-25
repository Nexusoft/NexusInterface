import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { callAPI as callAPI } from 'lib/api';
import listAll from 'utils/listAll';

export const refreshBalances = async () => {
  try {
    const balances = await callAPI('finance/get/balances');
    store.dispatch({ type: TYPE.SET_BALANCES, payload: balances });
    return balances;
  } catch (err) {
    console.error('finance/get/balances failed', err);
  }
};

function processToken(token) {
  if (token.ticker?.startsWith?.('local:')) {
    token.tickerIsLocal = true;
    token.ticker = token.ticker.substring(6);
  }
}

export const refreshOwnedTokens = async () => {
  try {
    const tokens = await listAll('finance/list/tokens');
    tokens.forEach(processToken);
    store.dispatch({
      type: TYPE.SET_USER_OWNED_TOKENS,
      payload: tokens,
    });
  } catch (err) {
    console.error('finance/list/tokens failed', err);
  }
};

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

export const refreshAccounts = async () => {
  try {
    const accounts = await callAPI('finance/list/any');
    // accounts.forEach(processAccount);
    store.dispatch({
      type: TYPE.SET_TRITIUM_ACCOUNTS,
      payload: accounts,
    });
  } catch (err) {
    console.error('account listing failed', err);
  }
};

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
