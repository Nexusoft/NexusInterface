import axios from 'axios';

import * as TYPE from 'consts/actionTypes';
import { callApi } from 'lib/tritiumApi';
import store, { observeStore } from 'store';

__ = __context('MarketData');

let marketDataTimerId = null;
let metricsTimerId = null;
let unobserveMetrics = null;

async function fetchMarketData() {
  try {
    clearTimeout(marketDataTimerId);
    const {
      settings: { fiatCurrency },
    } = store.getState();
    const { data } = await axios.get(
      `https://nexus-wallet-server-nndj.onrender.com/market-data?base_currency=${fiatCurrency}`
    );
    data.currency = fiatCurrency;

    // cryptocompare's VND price is divided by 10
    if (fiatCurrency === 'VND') {
      data.price *= 10;
    }

    store.dispatch({
      type: TYPE.SET_MARKET_DATA,
      payload: data,
    });
  } catch (err) {
    console.error(err);
  } finally {
    marketDataTimerId = setTimeout(fetchMarketData, 900000); // 15 minutes
  }
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
