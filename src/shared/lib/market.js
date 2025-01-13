import axios from 'axios';
import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { ledgerInfoAtom } from './ledger';
import { jotaiStore, jotaiQuery } from 'store';
import { settingAtoms } from './settings';
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

export const marketDataQuery = jotaiQuery({
  getQueryConfig: (get) => ({
    queryKey: ['marketData', get(settingAtoms.fiatCurrency)],
    queryFn: () => fetchMarketData(get(settingAtoms.fiatCurrency)),
    retry: 2,
    retryDelay: 5000,
    staleTime: 3600000, // 1 hour
    refetchInterval: 900000, // 15 minutes
    refetchOnReconnect: 'always',
    placeholderData: (previousData) => previousData,
  }),
  refetchTriggers: [settingAtoms.fiatCurrency],
});

export const marketCapAtom = atom(
  (get) =>
    get(marketDataQuery.valueAtom)?.price *
      get(ledgerInfoAtom)?.supply?.total || null
);
