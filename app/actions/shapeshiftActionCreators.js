import Request from "request";
import * as TYPE from "./actiontypes";

export const refundAddressSetter = refundAdd => {
  return dispatch => {
    dispatch({ type: TYPE.SET_REFUND_ADDRESS, payload: refundAdd });
  };
};
export const toAddressSetter = toAdd => {
  return dispatch => {
    dispatch({ type: TYPE.SET_TO_ADDRESS, payload: toAdd });
  };
};
export const toggleWithinBounds = () => {
  return dispatch => {
    dispatch({ type: TYPE.TOGGLE_WITHIN_TRADE_BOUNDS });
  };
};

export const FromSetter = from => {
  return dispatch => {
    dispatch({ type: TYPE.FROM_SETTER, payload: from });
  };
};

export const ToSetter = to => {
  return dispatch => {
    dispatch({ type: TYPE.TO_SETTER, payload: to });
  };
};

export const ammountUpdater = ammt => {
  return dispatch => {
    dispatch({ type: TYPE.UPDATE_EXCHANGE_AMMOUNT, payload: ammt });
  };
};

export const GetAvailaleCoins = () => {
  return dispatch => {
    Request(
      {
        url: "https://shapeshift.io/getcoins",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          dispatch({
            type: TYPE.AVAILABLE_COINS,
            payload: response.body
          });
        }
      }
    );
  };
};

export const GetPairMarketInfo = pair => {
  return dispatch => {
    Request(
      {
        url: `https://shapeshift.io/marketinfo/${pair}`,
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          if (!response.body.error) {
            dispatch({ type: TYPE.AVAILABLE_PAIR_FLAG, payload: true });
            dispatch({ type: TYPE.MARKET_PAIR_DATA, payload: response.body });
          }
        } else if (
          response.body.error ===
          "That pair is temporarily unavailable for trades."
        ) {
          dispatch({ type: TYPE.AVAILABLE_PAIR_FLAG, payload: false });
        }
      }
    );
  };
};

export const unavaliblePair = () => {
  return dispatch => {
    dispatch({ type: TYPE.AVAILABLE_PAIR_FLAG, payload: false });
  };
};

export const avaliblePair = () => {
  return dispatch => {
    dispatch({ type: TYPE.AVAILABLE_PAIR_FLAG, payload: true });
  };
};
