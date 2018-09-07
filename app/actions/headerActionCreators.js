import * as TYPE from "./actiontypes";
import * as RPC from "../script/rpc";
import config from "../api/configuration";

export const GetInfoDump = () => {
  return dispatch => {
    RPC.PROMISE("getinfo", [])
      .then(payload => {
        delete payload.timestamp;
        return payload;
      })
      .then(payload => {
        dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload });
      });
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

export const OpenModal3 = () => {
  return dispatch => {
    dispatch({ type: TYPE.OPEN_MODAL3 });
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
