import axios from 'axios';

import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';

__ = __context('MarketData');

let timerId = null;

export async function refreshMarketData() {
  try {
    clearTimeout(timerId);
    const {
      settings: { fiatCurrency },
    } = store.getState();
    const { data } = await axios.get(
      `https://nexus-wallet-external-services.herokuapp.com/market-data?base_currency=${fiatCurrency}`
    );

    store.dispatch({
      type: TYPE.SET_MARKET_DATA,
      payload: data,
    });
  } catch (err) {
    console.error(err);
  } finally {
    timerId = setTimeout(refreshMarketData, 900000); // 15 minutes
  }
}

export function prepareMarket() {
  refreshMarketData();
  observeStore(
    ({ settings: { fiatCurrency } }) => fiatCurrency,
    refreshMarketData
  );
}
