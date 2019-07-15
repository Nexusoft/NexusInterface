import Request from 'request';
import * as TYPE from 'consts/actionTypes';
import { translate } from 'components/Text';

//action creator for loaded flag

export const marketDataLoaded = () => {
  return { type: TYPE.MARKET_DATA_LOADED };
};

// action creators for the alert list

export const setAlertList = list => {
  return dispatch => {
    dispatch({ type: TYPE.SET_ALERTS, payload: list });
  };
};

export const removeAlert = index => {
  return dispatch => {
    dispatch({ type: TYPE.REMOVE_ALERT, payload: index });
  };
};

// action creators for the 24 hr market summery requests

export const binance24hrInfo = () => {
  return dispatch => {
    Request(
      {
        url: 'https://api.binance.com/api/v1/ticker/24hr?symbol=NXSBTC',
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            change: body.priceChangePercent,
            high: body.highPrice,
            low: body.lowPrice,
            volume: parseFloat(body.volume).toFixed(2),
          };
          dispatch({ type: TYPE.BINANCE_24, payload: res });
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
          'https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-nxs',
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let data = body.result[0];

          let res = {
            change: parseFloat(
              (((data.Last - data.PrevDay) / data.PrevDay) * 100).toFixed(2)
            ),
            high: data.High,
            low: data.Low,
            volume: parseFloat(data.Volume).toFixed(2),
          };
          dispatch({ type: TYPE.BITTREX_24, payload: res });
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
        url: 'https://api.binance.com/api/v1/depth?symbol=NXSBTC',
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            sell: body.asks
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0]),
                };
              })
              .sort((a, b) => b.Price - a.Price)
              .reverse(),
            buy: body.bids
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0]),
                };
              })
              .sort((a, b) => b.Price - a.Price),
          };

          dispatch({ type: TYPE.BINANCE_ORDERBOOK, payload: res });
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
          'https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-NXS&type=both',
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            buy: body.result.buy
              .sort((a, b) => b.Rate - a.Rate)
              .map(e => {
                return { Volume: e.Quantity, Price: e.Rate };
              }),
            sell: body.result.sell
              .sort((a, b) => b.Rate - a.Rate)
              .map(e => {
                return { Volume: e.Quantity, Price: e.Rate };
              })
              .reverse(),
          };
          dispatch({ type: TYPE.BITTREX_ORDERBOOK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

// actions creators for candlestick data

export const binanceCandlestickLoader = any => {
  const { locale } = any.props.settings;
  return dispatch => {
    Request(
      {
        url: 'https://api.binance.com/api/v1/klines?symbol=NXSBTC&interval=1d',
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = body
            .reverse()
            .map(e => {
              return {
                x: new Date(e[0]),
                open: parseFloat(e[1]),
                close: parseFloat(e[4]),
                high: parseFloat(e[2]),
                low: parseFloat(e[3]),
                label: `${translate('Market.Date', locale)}: ${new Date(
                  e[0]
                ).getMonth() + 1}/${new Date(e[0]).getDate()}/${new Date(
                  e[0]
                ).getFullYear()}
             ${translate('Market.Open', locale)}: ${parseFloat(e[1])}
             ${translate('Market.Close', locale)}: ${parseFloat(e[4])}
             ${translate('Market.High', locale)}: ${parseFloat(e[2])}
             ${translate('Market.Low', locale)}: ${parseFloat(e[3])}`,
              };
            })
            .slice(0, 30);
          dispatch({ type: TYPE.BINANCE_CANDLESTICK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

export const bittrexCandlestickLoader = any => {
  const { locale } = any.props.settings;
  return dispatch => {
    Request(
      {
        url:
          'https://bittrex.com/api/v2.0/pub/market/GetTicks?marketName=BTC-NXS&tickInterval=day',
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = body.result
            .reverse()
            .map(e => {
              return {
                x: new Date(e.T),
                open: e.O,
                close: e.C,
                high: e.H,
                low: e.L,
                label: `${translate('Market.Date', locale)}: ${new Date(
                  e.T
                ).getMonth() + 1}/${new Date(e.T).getDate()}/${new Date(
                  e.T
                ).getFullYear()}
                ${translate('Market.Open', locale)}: ${e.O}
                ${translate('Market.Close', locale)}: ${e.C}
                ${translate('Market.High', locale)}: ${e.H}
                ${translate('Market.Low', locale)}: ${e.L}`,
              };
            })
            .slice(0, 30);
          dispatch({ type: TYPE.BITTREX_CANDLESTICK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};
