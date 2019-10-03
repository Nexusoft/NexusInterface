import axios from 'axios';

import * as TYPE from 'consts/actionTypes';
import store from 'store';

async function fetchMarketData() {
  const result = await axios.get(
    'https://whispering-lake-14690.herokuapp.com/displaydata'
  );
  const { data } = result;

  let rawBTC = Object.values(data.RAW.BTC).map(ele => {
    return {
      changePct24Hr: ele.CHANGEPCT24HOUR,
      marketCap: ele.MKTCAP,
      price: ele.PRICE,
      name: ele.TOSYMBOL,
    };
  });
  let rawNXS = Object.values(data.RAW.NXS).map(ele => {
    return {
      changePct24Hr: ele.CHANGEPCT24HOUR,
      marketCap: ele.MKTCAP,
      price: ele.PRICE,
      name: ele.TOSYMBOL,
    };
  });
  let displayBTC = Object.values(data.RAW.BTC).map(ele => {
    let curCode = ele.TOSYMBOL;
    let displayEle = data.DISPLAY.NXS[curCode];
    return {
      changePct24Hr: displayEle.CHANGEPCT24HOUR,
      marketCap: displayEle.MKTCAP,
      price: displayEle.PRICE,
      name: curCode,
      symbol: displayEle.TOSYMBOL,
    };
  });
  let displayNXS = Object.values(data.RAW.NXS).map(ele => {
    let curCode = ele.TOSYMBOL;
    let displayEle = data.DISPLAY.NXS[curCode];
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

export function initializeMarketData() {
  fetchMarketData();
  setInterval(fetchMarketData, 900000); // 15 minutes
}
