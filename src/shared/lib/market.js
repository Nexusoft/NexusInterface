import axios from 'axios';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { walletEvents } from 'lib/wallet';

__ = __context('MarketData');

//action creator for loaded flag

async function fetchMarketData() {
  const { data } = await axios.get(
    'https://whispering-lake-14690.herokuapp.com/displaydata'
  );

  const rawBTC = Object.values(data.RAW.BTC).map(ele => {
    return {
      changePct24Hr: ele.CHANGEPCT24HOUR,
      marketCap: ele.MKTCAP,
      price: ele.PRICE,
      name: ele.TOSYMBOL,
    };
  });
  const rawNXS = Object.values(data.RAW.NXS).map(ele => {
    return {
      changePct24Hr: ele.CHANGEPCT24HOUR,
      marketCap: ele.MKTCAP,
      price: ele.PRICE,
      name: ele.TOSYMBOL,
    };
  });
  const displayBTC = Object.values(data.RAW.BTC).map(ele => {
    const curCode = ele.TOSYMBOL;
    const displayEle = data.DISPLAY.NXS[curCode];
    return {
      changePct24Hr: displayEle.CHANGEPCT24HOUR,
      marketCap: displayEle.MKTCAP,
      price: displayEle.PRICE,
      name: curCode,
      symbol: displayEle.TOSYMBOL,
    };
  });
  const displayNXS = Object.values(data.RAW.NXS).map(ele => {
    const curCode = ele.TOSYMBOL;
    const displayEle = data.DISPLAY.NXS[curCode];
    return {
      changePct24Hr: displayEle.CHANGEPCT24HOUR,
      marketCap: displayEle.MKTCAP,
      price: displayEle.PRICE,
      name: curCode,
      symbol: displayEle.TOSYMBOL,
    };
  });

  store.dispatch({
    type: TYPE.SET_MKT_AVE_DATA,
    payload: {
      rawBTC: rawBTC,
      rawNXS: rawNXS,
      displayBTC: displayBTC,
      displayNXS: displayNXS,
    },
  });
}

walletEvents.once('pre-render', function() {
  fetchMarketData();
  setInterval(fetchMarketData, 900000); // 15 minutes
});

export const marketDataLoaded = () => {
  store.dispatch({ type: TYPE.MARKET_DATA_LOADED });
};

// action creators for the alert list

export const setAlertList = list => {
  store.dispatch({ type: TYPE.SET_ALERTS, payload: list });
};

export const removeAlert = index => {
  store.dispatch({ type: TYPE.REMOVE_ALERT, payload: index });
};

// action creators for the 24 hr market summery requests

export const binance24hrInfo = async () => {
  const { data } = await axios.get(
    'https://api.binance.com/api/v1/ticker/24hr?symbol=NXSBTC'
  );
  const res = {
    change: data.priceChangePercent,
    high: data.highPrice,
    low: data.lowPrice,
    volume: parseFloat(data.volume).toFixed(2),
  };
  store.dispatch({ type: TYPE.BINANCE_24, payload: res });
};

export const bittrex24hrInfo = async () => {
  const result = await axios.get(
    'https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-nxs'
  );
  const data = result.data.result[0];

  const res = {
    change: parseFloat(
      (((data.Last - data.PrevDay) / data.PrevDay) * 100).toFixed(2)
    ),
    high: data.High,
    low: data.Low,
    volume: parseFloat(data.Volume).toFixed(2),
  };
  store.dispatch({ type: TYPE.BITTREX_24, payload: res });
};

// action creators for the market depth calls

export const binanceDepthLoader = async () => {
  const { data } = await axios.get(
    'https://api.binance.com/api/v1/depth?symbol=NXSBTC'
  );
  const res = {
    sell: data.asks
      .map(ele => {
        return {
          Volume: parseFloat(ele[1]),
          Price: parseFloat(ele[0]),
        };
      })
      .sort((a, b) => b.Price - a.Price)
      .reverse(),
    buy: data.bids
      .map(ele => {
        return {
          Volume: parseFloat(ele[1]),
          Price: parseFloat(ele[0]),
        };
      })
      .sort((a, b) => b.Price - a.Price),
  };

  store.dispatch({ type: TYPE.BINANCE_ORDERBOOK, payload: res });
  marketDataLoaded();
};

export const binanceWalletStatus = async () => {
  const { data } = await axios.get(
    'https://www.binance.com/assetWithdraw/getAllAsset.html'
  );
  const nxsStatus = data.filter(element => element.assetCode === 'NXS')[0];
  const walletOnline = nxsStatus.enableCharge && nxsStatus.enableWithdraw;
  //Add stuff to catch error and make this a bit more robust.
  store.dispatch({
    type: TYPE.BINANCE_WALLET_STATUS,
    payload: walletOnline ? 'Green' : 'Red',
  });
};

export const bittrexWalletStatus = async () => {
  const { data } = await axios.get(
    'https://bittrex.com/api/v2.0/pub/currencies/GetWalletHealth'
  );
  const nxsStatus = data.result.filter(
    element => element.Health.Currency === 'NXS'
  )[0];
  const walletOnline = nxsStatus.Health.IsActive;
  console.error(nxsStatus);

  store.dispatch({
    type: TYPE.BITTREX_WALLET_STATUS,
    payload: walletOnline ? 'Green' : 'Red',
  });
};

export const bittrexDepthLoader = async () => {
  const { data } = await axios.get(
    'https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-NXS&type=both'
  );

  const res = {
    buy: data.result.buy
      .sort((a, b) => b.Rate - a.Rate)
      .map(e => {
        return { Volume: e.Quantity, Price: e.Rate };
      }),
    sell: data.result.sell
      .sort((a, b) => b.Rate - a.Rate)
      .map(e => {
        return { Volume: e.Quantity, Price: e.Rate };
      })
      .reverse(),
  };
  store.dispatch({ type: TYPE.BITTREX_ORDERBOOK, payload: res });
  marketDataLoaded();
};

// actions creators for candlestick data

export const binanceCandlestickLoader = async () => {
  const { data } = await axios.get(
    'https://api.binance.com/api/v1/klines?symbol=NXSBTC&interval=1d'
  );

  const res = data
    .reverse()
    .map(e => {
      return {
        x: new Date(e[0]),
        open: parseFloat(e[1]),
        close: parseFloat(e[4]),
        high: parseFloat(e[2]),
        low: parseFloat(e[3]),
        label: `${__('Date')}: ${new Date(e[0]).getMonth() + 1}/${new Date(
          e[0]
        ).getDate()}/${new Date(e[0]).getFullYear()}
             ${__('Open')}: ${parseFloat(e[1])}
             ${__('Close')}: ${parseFloat(e[4])}
             ${__('High')}: ${parseFloat(e[2])}
             ${__('Low')}: ${parseFloat(e[3])}`,
      };
    })
    .slice(0, 30);
  store.dispatch({ type: TYPE.BINANCE_CANDLESTICK, payload: res });
  marketDataLoaded();
};

export const bittrexCandlestickLoader = async () => {
  const { data } = await axios.get(
    'https://bittrex.com/api/v2.0/pub/market/GetTicks?marketName=BTC-NXS&tickInterval=day'
  );

  const res = data.result
    .reverse()
    .map(e => {
      return {
        x: new Date(e.T),
        open: e.O,
        close: e.C,
        high: e.H,
        low: e.L,
        label: `${__('Date')}: ${new Date(e.T).getMonth() + 1}/${new Date(
          e.T
        ).getDate()}/${new Date(e.T).getFullYear()}
                ${__('Open')}: ${e.O}
                ${__('Close')}: ${e.C}
                ${__('High')}: ${e.H}
                ${__('Low')}: ${e.L}`,
      };
    })
    .slice(0, 30);
  store.dispatch({ type: TYPE.BITTREX_CANDLESTICK, payload: res });
  marketDataLoaded();
};
