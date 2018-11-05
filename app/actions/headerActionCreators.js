/*
Title: Header Action Creators
Description: Redux action creators for the header.
Last Modified by: Brian Smith
*/

// External Dependencies
import Request from "request";

// Internal Dependencies
import * as TYPE from "./actiontypes";
import * as RPC from "../script/rpc";
import config from "../api/configuration";

// Header Action Creators
export const GetInfoDump = () => {
  return dispatch => {
    RPC.PROMISE("getinfo", [])
      .then(payload => {
        delete payload.timestamp;
        return payload;
      })
      .then(payload => {
        dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload });
      })
      .catch(err =>
        console.log(
          "caught",
          err,
          "-------------------------------------------------------------------------------------"
        )
      );
  };
};

export const clearOverviewVariables = () => {
  return dispatch => {
    dispatch({ type: TYPE.CLEAR_FOR_BOOTSTRAPING });
  };
};

export const SetMarketAveData = () => {
  return dispatch => {
    Request(
      {
        url:
          "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=NXS,BTC&tsyms=BTC,USD,EUR,AUD,BRL,GBP,CAD,CLP,CNY,CZK,HKD,INR,JPY,KRW,MYR,MXN,NZD,PKR,RUB,SAR,SGD,ZAR,CHF,TWD,AED",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let rawBTC = Object.values(body.RAW.BTC).map(ele => {
            return {
              changePct24Hr: ele.CHANGEPCT24HOUR,
              marketCap: ele.MKTCAP,
              price: ele.PRICE,
              name: ele.TOSYMBOL
            };
          });
          let rawNXS = Object.values(body.RAW.NXS).map(ele => {
            return {
              changePct24Hr: ele.CHANGEPCT24HOUR,
              marketCap: ele.MKTCAP,
              price: ele.PRICE,
              name: ele.TOSYMBOL
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
              symbol: displayEle.TOSYMBOL
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
              symbol: displayEle.TOSYMBOL
            };
          });
          dispatch({
            type: TYPE.SET_MKT_AVE_DATA,
            payload: {
              rawBTC: rawBTC,
              rawNXS: rawNXS,
              displayBTC: displayBTC,
              displayNXS: displayNXS
            }
          });
        }
      }
    );
  };
};

export const Lock = () => {
  return dispatch => {
    dispatch({ type: TYPE.LOCK });
  };
};

export const Unlock = () => {
  return dispatch => {
    dispatch({ type: TYPE.UNLOCK });
  };
};

export const Encrypted = () => {
  return dispatch => {
    dispatch({ type: TYPE.ENCRYPTED });
  };
};

export const BlockDate = stamp => {
  return dispatch => {
    dispatch({ type: TYPE.BLOCK_DATE, payload: stamp });
  };
};

export const Unencrypted = () => {
  return dispatch => {
    dispatch({ type: TYPE.UNENCRYPTED });
  };
};
export const OpenModal = content => {
  return dispatch => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: content });
  };
};
export const Confirm = Answer => {
  return dispatch => {
    dispatch({ type: TYPE.CONFIRM, payload: Answer });
  };
};

export const setPercentDownloaded = percent => {
  return dispatch =>
    dispatch({ type: TYPE.SET_PERCENT_DOWNLOADED, payload: percent });
};

export const CloseBootstrapModal = () => {
  return dispatch => {
    dispatch({ type: TYPE.CLOSE_BOOTSTRAP_MODAL });
  };
};

export const MyAccountsList = list => {
  return dispatch => {
    dispatch({ type: TYPE.MY_ACCOUNTS_LIST, payload: list });
  };
};

export const OpenBootstrapModal = bool => {
  return dispatch => {
    dispatch({ type: TYPE.OPEN_BOOTSTRAP_MODAL, payload: bool });
  };
};

export const CloseModal = () => {
  return dispatch => {
    dispatch({ type: TYPE.HIDE_MODAL });
  };
};
export const OpenModal2 = () => {
  return dispatch => {
    dispatch({ type: TYPE.SHOW_MODAL2 });
  };
};
export const CloseModal2 = () => {
  return dispatch => {
    dispatch({ type: TYPE.HIDE_MODAL2 });
  };
};

export const CloseModal3 = () => {
  return dispatch => {
    dispatch({ type: TYPE.HIDE_MODAL3 });
  };
};

export const setSettings = settings => {
  return dispatch => {
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings });
  };
};

export const OpenModal3 = () => {
  return dispatch => {
    dispatch({ type: TYPE.OPEN_MODAL3 });
  };
};
export const CloseModal4 = () => {
  return dispatch => {
    dispatch({ type: TYPE.HIDE_MODAL4 });
  };
};

export const OpenModal4 = () => {
  return dispatch => {
    dispatch({ type: TYPE.OPEN_MODAL4 });
  };
};

export const SetSyncStatus = stat => {
  return dispatch => {
    dispatch({ type: TYPE.SET_SYNC_STATUS, payload: stat });
  };
};

export const SetHighestPeerBlock = hpb => {
  return dispatch => {
    dispatch({ type: TYPE.SET_HIGHEST_PEER_BLOCK, payload: hpb });
  };
};

export const SetPortIsAvailable = isAvailable => {
  return dispatch => {
    dispatch({ type: TYPE.PORT_AVAILABLE, payload: isAvailable });
  };
};

export const SetGoogleAnalytics = returnData => {
  return dispatch => {
    dispatch({ type: TYPE.SET_GOOGLEANALYTICS, payload: returnData });
  };
};

export const LoadAddressBook = () => {
  let json = null;
  if (config.Exists("addressbook.json")) {
    json = config.ReadJson("addressbook.json");
  } else {
    json = {
      addressbook: []
    };
    config.WriteJson("addressbook.json", json);
  }

  return dispatch => {
    dispatch({ type: TYPE.LOAD_ADDRESS_BOOK, payload: json.addressbook });
  };
};

export const AddRPCCall = returnCall => {
  return dispatch => {
    dispatch({ type: TYPE.ADD_RPC_CALL, payload: returnCall });
  };
};
