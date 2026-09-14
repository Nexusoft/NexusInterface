import { atom } from 'jotai';
import { ledgerInfoQuery } from 'lib/ledger';
import jotaiQuery from 'utils/jotaiQuery';
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

async function fetchMarketData() {
  try {
    const fiatCurrency = 'USDT';
    // Cache the result so that it won't have to reach the server again on UI refreshes
    const cache = readCache();
    const cachedData = findMarketData(cache, fiatCurrency as CurrencyTicker);
    let marketData: MarketData | undefined = undefined;
    if (cachedData) {
      marketData = cachedData;
    } else {
      const data = (await window.nexusElectron.updater.getMarketData()) as
        | MarketData
        | undefined;
      if (data) {
        marketData = {
          ...data,
          currency: fiatCurrency as CurrencyTicker,
        };
        addToCache(cache, marketData);
      }
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
  getQueryConfig: () => ({
    queryKey: ['marketData', 'USDT'],
    queryFn: () => fetchMarketData(),
    retry: 2,
    retryDelay: 5000,
    staleTime: 3600000, // 1 hour
    refetchInterval: 900000, // 15 minutes
    refetchOnReconnect: 'always',
    placeholderData: (previousData) => previousData,
  }),
});

export const marketCapAtom = atom((get) => {
  const marketData = get(marketDataQuery.valueAtom);
  const price = marketData?.price;
  if (!price) return null;
  const supply = get(ledgerInfoQuery.valueAtom)?.supply?.total;
  if (!supply) return null;
  return price * supply;
});
