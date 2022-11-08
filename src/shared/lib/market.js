import axios from 'axios';

import * as TYPE from 'consts/actionTypes';
import { callApi } from 'lib/tritiumApi';
import store, { observeStore } from 'store';
import { tryParsingJson } from 'utils/json';

__ = __context('MarketData');

let marketDataTimerId = null;
let metricsTimerId = null;
let unobserveMetrics = null;

const localStorageKey = 'marketData';
const interval = 900000; // 15 minutes

async function fetchMarketData() {
  try {
    clearTimeout(marketDataTimerId);

    const {
      settings: { fiatCurrency },
    } = store.getState();
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
    // cryptocompare's VND price is divided by 10
    if (fiatCurrency === 'VND') {
      marketData.price *= 10;
    }

    store.dispatch({
      type: TYPE.SET_MARKET_DATA,
      payload: marketData,
    });

    if (!cachedData) {
      addToCache(cache, marketData);
    }
  } catch (err) {
    console.error(err);
  } finally {
    marketDataTimerId = setTimeout(fetchMarketData, 900000); // 15 minutes
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
  const newCache = [{ ...marketData, timestamp: Date.now() }];
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

async function fetchMetrics() {
  try {
    clearTimeout(metricsTimerId);
    unobserveMetrics?.();
    const metrics = await callApi('system/get/metrics');
    store.dispatch({
      type: TYPE.SET_TOTAL_SUPPLY,
      payload: metrics?.supply?.total,
    });
    metricsTimerId = setTimeout(fetchMetrics, 900000); // 15 minutes
  } catch (err) {
    unobserveMetrics = observeStore(
      (state) => state.core.systemInfo,
      (systemInfo) => {
        if (systemInfo) {
          fetchMetrics();
          unobserveMetrics?.();
          unobserveMetrics = null;
        }
      }
    );
  }
}

export async function refreshMarketData() {
  fetchMarketData();
  fetchMetrics();
}

export function prepareMarket() {
  refreshMarketData();
  observeStore(
    ({ settings: { fiatCurrency } }) => fiatCurrency,
    refreshMarketData
  );
}
