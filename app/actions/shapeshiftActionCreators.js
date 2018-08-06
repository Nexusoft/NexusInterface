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
            payload: Object.values(response.body)
          });
        }
      }
    );
  };
};

// export const bittrex24hrInfo = () => {
//   return dispatch => {
//     Request(
//       {
//         url:
//           "https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-nxs",
//         json: true
//       },
//       (error, response, body) => {
//         if (response.statusCode === 200) {
//           let data = body.result[0];
//           let res = {
//             change: (data.Last - data.PrevDay) / data.Last,
//             high: data.High,
//             low: data.Low,
//             volume: data.Volume
//           };
//           dispatch({ type: TYPE.BITTREX_24, payload: res });
//         }
//       }
//     );
//   };
// };

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
