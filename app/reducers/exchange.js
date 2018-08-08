import * as TYPE from "../actions/actiontypes";

const initialState = {
  refundAddress: "",
  ammount: 0,
  toAddress: "",
  availableCoins: {},
  from: "",
  to: "",
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
        from: action.payload
      };
      break;
    case TYPE.UPDATE_AMMOUNT:
      return {
        ...state,
        ammount: action.payload
      };
      break;
    case TYPE.TO_SETTER:
      return {
        ...state,
        to: action.payload
      };
      break;
    case TYPE.MARKET_PAIR_DATA:
      return {
        ...state,
        marketPairData: action.payload
      };
      break;
    default:
      return state;
  }
};
