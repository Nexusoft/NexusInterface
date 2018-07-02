import * as TYPE from "../actions/actiontypes";

const initialState = {
  binance: {
    info24hr: {},
    buy: [],
    sell: []
  },
  cryptopia: {
    info24hr: {},
    buy: [],
    sell: []
  },
  bittrex: {
    info24hr: {},
    buy: [],
    sell: []
  },
  loaded: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.CRYPTOPIA_24:
      return {
        ...state,
        cryptopia: {
          ...state.cryptopia,
          info24hr: { ...action.payload }
        }
      };
    case TYPE.BITTREX_24:
      return {
        ...state,
        bittrex: {
          ...state.bittrex,
          info24hr: { ...action.payload }
        }
      };
    case TYPE.BINANCE_24:
      return {
        ...state,
        binance: {
          ...state.binance,
          info24hr: { ...action.payload }
        }
      };
    case TYPE.CRYPTOPIA_ORDERBOOK:
      return {
        ...state,
        cryptopia: {
          ...state.cryptopia,
          buy: [...action.payload.buy],
          sell: [...action.payload.sell]
        }
      };
    case TYPE.BINANCE_ORDERBOOK:
      return {
        ...state,
        binance: {
          ...state.binance,
          buy: [...action.payload.buy],
          sell: [...action.payload.sell]
        }
      };
    case TYPE.BITTREX_ORDERBOOK:
      return {
        ...state,
        bittrex: {
          ...state.bittrex,
          buy: [...action.payload.buy],
          sell: [...action.payload.sell]
        }
      };
    case TYPE.MARKET_DATA_LOADED:
      return {
        ...state,
        loaded: true
      };
    default:
      return state;
  }
};
