import axios from 'axios';
import { atom } from 'jotai';
import { ledgerInfoQuery } from 'lib/ledger';
import jotaiQuery from 'utils/jotaiQuery';
import { settingAtoms } from 'lib/settings';
import { tryParsingJson } from 'utils/json';
import { CurrencyTicker } from 'data/currencies';

__ = __context('MarketData');

const localStorageKey = 'marketData';
const interval = 900000; // 15 minutes

interface MarketData {
  price: number;
  changePct24Hr: number;
  currency: CurrencyTicker;
}

type MarketDataCache = Array<
  MarketData & {
    timestamp: number;
  }
>;

async function fetchMarketData(fiatCurrency: CurrencyTicker) {
  try {
    // Cache the result so that it won't have to reach the server again on UI refreshes
    const cache = readCache();
    const cachedData = findMarketData(cache, fiatCurrency);
    let marketData: MarketData | undefined = undefined;
    if (cachedData) {
      marketData = cachedData;
    } else {
      const { data } = await axios.get(
        `https://nexus-wallet-server-nndj.onrender.com/market-data?base_currency=${fiatCurrency}`
      );
      marketData = { ...data, currency: fiatCurrency } as MarketData;
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
  const cache = (cacheJson && tryParsingJson(cacheJson)) || [];
  return cache;
}

function findMarketData(cache: MarketDataCache, currency: CurrencyTicker) {
  const now = Date.now();
  // cache is an array, each item is for a different currency
  const marketData = cache.find(
    (data) => data.currency === currency && now - data.timestamp <= interval
  );
  return marketData;
}

function addToCache(cache: MarketDataCache, marketData: MarketData) {
  const now = Date.now();
  const newCache = [{ ...marketData, timestamp: now }];
  // Remove outdated cache items
  cache.forEach((data) => {
    if (
      now - data.timestamp < interval &&
      data.currency !== marketData.currency
    ) {
      newCache.push(data);
    }
  });
  localStorage.setItem(localStorageKey, JSON.stringify(newCache));
}

export const marketDataQuery = jotaiQuery<MarketData | undefined>({
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

export const marketCapAtom = atom((get) => {
  const price = get(marketDataQuery.valueAtom)?.price;
  if (!price) return null;
  const supply = get(ledgerInfoQuery.valueAtom)?.supply.total;
  if (!supply) return null;
  return price * supply;
});
