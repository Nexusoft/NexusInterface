import Request from "request";
import * as TYPE from "./actiontypes";

// action creators for the 24 hr market summery requests

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
  if (parseFloat(ammt) !== NaN) {
    return dispatch => {
      dispatch({ type: TYPE.UPDATE_AMMOUNT, payload: ammt });
    };
  } else return null;
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
            dispatch({ type: TYPE.MARKET_PAIR_DATA, payload: response.body });
          }
        }
      }
    );
  };
};

// export const cryptopia24hrInfo = () => {
//   return dispatch => {
//     Request(
//       {
//         url: "https://www.cryptopia.co.nz/api/GetMarket/NXS_BTC",
//         json: true
//       },
//       (error, response, body) => {
//         if (response.statusCode === 200) {
//           let data = body.Data;
//           let res = {
//             change: data.Change,
//             high: data.High,
//             low: data.Low,
//             volume: data.Volume
//           };
//           dispatch({ type: TYPE.CRYPTOPIA_24, payload: res });
//         }
//       }
//     );
//   };
// };
