import axios from 'axios';
import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { ledgerInfoAtom } from './ledger';
import store, { observeStore, jotaiStore } from 'store';
import { tryParsingJson } from 'utils/json';

__ = __context('MarketData');

const localStorageKey = 'marketData';
const interval = 900000; // 15 minutes

async function fetchMarketData(fiatCurrency) {
  try {
    // Cache the result so that it won't have to reach the server again on UI refreshes
    const cache = readCache();
    const cachedData = findMarketData(cache, fiatCurrency);
    let marketData;
    if (cachedData) {
      marketData = cachedData;
    } else {
      const { data } = await axios.get(
        `https://nexus-wallet-server-nndj.onrender.com/market-data?base_currency=${fiatCurrency}`
      );
      marketData = data;
    }

    marketData.currency = fiatCurrency;

    if (!cachedData) {
      addToCache(cache, marketData);
    }
    return marketData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function readCache() {
  const cacheJson = localStorage.getItem(localStorageKey);
  const cache = tryParsingJson(cacheJson) || [];
  return cache;
}

function findMarketData(cache, currency) {
  const now = Date.now();
  // cache is an array, each item is for a different currency
  const marketData = cache?.find(
    (data) => data.currency === currency && now - data.timestamp <= interval
  );
  return marketData || null;
}

function addToCache(cache, marketData) {
  const now = Date.now();
  const newCache = [{ ...marketData, timestamp: now }];
  // Remove outdated cache items
  cache?.forEach((data) => {
    if (
      now - data.timestamp < interval &&
      data.currency !== marketData.currency
    ) {
      newCache.push(data);
    }
  });
  localStorage.setItem(localStorageKey, JSON.stringify(newCache));
}

export function prepareMarket() {
  observeStore(
    ({ settings: { fiatCurrency } }) => fiatCurrency,
    () => {
      const refetchMarketData = jotaiStore.get(refetchMarketDataAtom);
      refetchMarketData();
    }
  );
}

// Temporary atom
// TODO: remove this after settings get converted into jotai
export const fiatCurrencyAtom = atom(
  (get) => store.getState()?.settings.fiatCurrency
);

export const marketDataPollingAtom = atomWithQuery((get) => ({
  queryKey: ['market-data', get(fiatCurrencyAtom)],
  queryFn: () => fetchMarketData(get(fiatCurrencyAtom)),
  retry: 2,
  retryDelay: 5000,
  staleTime: 3600000, // 1 hour
  refetchInterval: 900000, // 15 minutes
  refetchOnReconnect: 'always',
  placeholderData: (previousData) => previousData,
}));

export const marketDataAtom = atom(
  (get) => get(marketDataPollingAtom)?.data || null
);

export const refetchMarketDataAtom = atom(
  (get) => get(marketDataPollingAtom)?.refetch || (() => {})
);

export const marketCapAtom = atom(
  (get) =>
    get(marketDataAtom)?.price * get(ledgerInfoAtom)?.supply?.total || null
);
