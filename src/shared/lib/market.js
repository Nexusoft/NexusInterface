import axios from 'axios';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { walletEvents } from 'lib/wallet';

__ = __context('MarketData');

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
