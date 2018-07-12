import Request from "request";
import * as TYPE from "./actiontypes";

//action creator for loaded flag

export function marketDataLoaded() {
  return { type: TYPE.MARKET_DATA_LOADED };
}

// action creators for the 24 hr market summery requests

export const binance24hrInfo = () => {
  return dispatch => {
    Request(
      {
        url: "https://api.binance.com/api/v1/ticker/24hr?symbol=NXSBTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          dispatch({ type: TYPE.BINANCE_24, payload: body });
        }
      }
    );
  };
};

export const bittrex24hrInfo = () => {
  return dispatch => {
    Request(
      {
        url:
          "https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-nxs",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          dispatch({ type: TYPE.BITTREX_24, payload: body.result[0] });
        }
      }
    );
  };
};

export const cryptopia24hrInfo = () => {
  return dispatch => {
    Request(
      {
        url: "https://www.cryptopia.co.nz/api/GetMarket/NXS_BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          dispatch({ type: TYPE.CRYPTOPIA_24, payload: body.Data });
        }
      }
    );
  };
};

// action creators for the market depth calls

export const binanceDepthLoader = () => {
  return dispatch => {
    Request(
      {
        url: "https://api.binance.com/api/v1/depth?symbol=NXSBTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            sell: body.asks
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0])
                };
              })
              .sort((a, b) => b.Price - a.Price),
            buy: body.bids
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0])
                };
              })
              .sort((a, b) => b.Price - a.Price)
          };

          dispatch({ type: TYPE.BINANCE_ORDERBOOK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

export const cryptopiaDepthLoader = () => {
  return dispatch => {
    Request(
      {
        url: "https://www.cryptopia.co.nz/api/GetMarketOrders/NXS_BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            buy: body.Data.Buy.sort((a, b) => b.Price - a.Price).map(e => {
              return { Volume: e.Volume, Price: e.Price };
            }),
            sell: body.Data.Sell.sort((a, b) => b.Price - a.Price).map(e => {
              return { Volume: e.Volume, Price: e.Price };
            })
          };
          dispatch({ type: TYPE.CRYPTOPIA_ORDERBOOK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

export const bittrexDepthLoader = () => {
  return dispatch => {
    Request(
      {
        url:
          "https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-NXS&type=both",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            buy: body.result.buy.sort((a, b) => b.Rate - a.Rate).map(e => {
              return { Volume: e.Quantity, Price: e.Rate };
            }),
            sell: body.result.sell.sort((a, b) => b.Rate - a.Rate).map(e => {
              return { Volume: e.Quantity, Price: e.Rate };
            })
          };
          dispatch({ type: TYPE.BITTREX_ORDERBOOK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

// actions creators for candlestick data

export const binanceCandlestickLoader = () => {
  return dispatch => {
    Request(
      {
        url: "https://api.binance.com/api/v1/klines?symbol=NXSBTC&interval=1d",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = body.map(e => {
            return {
              x: new Date(e[0]),
              open: parseFloat(e[1]),
              close: parseFloat(e[4]),
              high: parseFloat(e[2]),
              low: parseFloat(e[3]),
              label: `Date: ${new Date(e[0]).getMonth()}/${new Date(
                e[0]
              ).getDate()}/${new Date(e[0]).getFullYear()}
              Open: ${parseFloat(e[1])}
              Close: ${parseFloat(e[4])}
              High: ${parseFloat(e[2])}
              Low: ${parseFloat(e[3])}`
            };
          });
          dispatch({ type: TYPE.BINANCE_CANDLESTICK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};
