// External
import Request from 'request';

// Internal
import * as TYPE from 'actions/actiontypes';
import config from 'api/configuration';

// Header Action Creators
export const GetInfo = info => ({ type: TYPE.GET_INFO_DUMP, payload: info });

export const clearOverviewVariables = () => ({
  type: TYPE.CLEAR_FOR_BOOTSTRAPING,
});

export const SetMarketAveData = () => dispatch => {
  Request(
    {
      url:
        'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=NXS,BTC&tsyms=BTC,USD,EUR,AUD,BRL,GBP,CAD,CLP,CNY,CZK,HKD,INR,JPY,KRW,MYR,MXN,NZD,PKR,RUB,SAR,SGD,ZAR,CHF,TWD,AED',
      json: true,
    },
    (error, response, body) => {
      if (response.statusCode === 200) {
        let rawBTC = Object.values(body.RAW.BTC).map(ele => {
          return {
            changePct24Hr: ele.CHANGEPCT24HOUR,
            marketCap: ele.MKTCAP,
            price: ele.PRICE,
            name: ele.TOSYMBOL,
          };
        });
        let rawNXS = Object.values(body.RAW.NXS).map(ele => {
          return {
            changePct24Hr: ele.CHANGEPCT24HOUR,
            marketCap: ele.MKTCAP,
            price: ele.PRICE,
            name: ele.TOSYMBOL,
          };
        });
        let displayBTC = Object.values(body.RAW.BTC).map(ele => {
          let curCode = ele.TOSYMBOL;
          let displayEle = body.DISPLAY.NXS[curCode];
          return {
            changePct24Hr: displayEle.CHANGEPCT24HOUR,
            marketCap: displayEle.MKTCAP,
            price: displayEle.PRICE,
            name: curCode,
            symbol: displayEle.TOSYMBOL,
          };
        });
        let displayNXS = Object.values(body.RAW.NXS).map(ele => {
          let curCode = ele.TOSYMBOL;
          let displayEle = body.DISPLAY.NXS[curCode];
          return {
            changePct24Hr: displayEle.CHANGEPCT24HOUR,
            marketCap: displayEle.MKTCAP,
            price: displayEle.PRICE,
            name: curCode,
            symbol: displayEle.TOSYMBOL,
          };
        });
        dispatch({
          type: TYPE.SET_MKT_AVE_DATA,
          payload: {
            rawBTC: rawBTC,
            rawNXS: rawNXS,
            displayBTC: displayBTC,
            displayNXS: displayNXS,
          },
        });
      }
    }
  );
};

export const SwitchLocale = locale => ({
  type: TYPE.SWITCH_LOCALES,
  payload: locale,
});

export const Lock = () => ({ type: TYPE.LOCK });

export const Unlock = () => ({ type: TYPE.UNLOCK });

export const Encrypted = () => ({ type: TYPE.ENCRYPTED });

export const BlockDate = stamp => ({ type: TYPE.BLOCK_DATE, payload: stamp });

export const Unencrypted = () => ({ type: TYPE.UNENCRYPTED });

export const MyAccountsList = list => ({
  type: TYPE.MY_ACCOUNTS_LIST,
  payload: list,
});

export const loadSettings = settings => ({
  type: TYPE.UPDATE_SETTINGS,
  payload: settings,
});

export const SetSyncStatus = stat => ({
  type: TYPE.SET_SYNC_STATUS,
  payload: stat,
});

export const SetHighestPeerBlock = hpb => ({
  type: TYPE.SET_HIGHEST_PEER_BLOCK,
  payload: hpb,
});

export const SetPortIsAvailable = isAvailable => ({
  type: TYPE.PORT_AVAILABLE,
  payload: isAvailable,
});

export const LoadAddressBook = () => {
  let json = null;
  if (config.Exists('addressbook.json')) {
    json = config.ReadJson('addressbook.json');
  } else {
    json = {
      addressbook: [],
    };
    config.WriteJson('addressbook.json', json);
  }

  return { type: TYPE.LOAD_ADDRESS_BOOK, payload: json.addressbook };
};

export const AddRPCCall = returnCall => ({
  type: TYPE.ADD_RPC_CALL,
  payload: returnCall,
});

export const setWebGLEnabled = enabled => ({
  type: TYPE.SET_WEBGL_ENABLED,
  payload: enabled,
});
