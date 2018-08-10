import * as TYPE from "../actions/actiontypes";

const initialState = {
  refundAddress: "",
  ammount: "",
  toAddress: "",
  availableCoins: {},
  from: "",
  to: "",
  availablePair: true,
  withinBounds: false,
  marketPairData: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.AVAILABLE_COINS:
      return {
        ...state,
        availableCoins: action.payload
      };
      break;
    case TYPE.FROM_SETTER:
      return {
        ...state,
        from: action.payload,
        ammount: ""
      };
      break;
    case TYPE.UPDATE_EXCHANGE_AMMOUNT:
      return {
        ...state,
        ammount: action.payload
      };
      break;
    case TYPE.TO_SETTER:
      return {
        ...state,
        to: action.payload,
        ammount: ""
      };
      break;
    case TYPE.TOGGLE_WITHIN_TRADE_BOUNDS:
      return {
        ...state,
        withinBounds: !state.withinBounds
      };
      break;
    case TYPE.SET_REFUND_ADDRESS:
      return {
        ...state,
        refundAddress: action.payload
      };
      break;
    case TYPE.SET_TO_ADDRESS:
      return {
        ...state,
        toAddress: action.payload
      };
      break;
    case TYPE.MARKET_PAIR_DATA:
      return {
        ...state,
        marketPairData: action.payload
      };
      break;
    case TYPE.AVAILABLE_PAIR_FLAG:
      return {
        ...state,
        availablePair: action.payload
      };
      break;
    default:
      return state;
  }
};
