import * as TYPE from "../actions/actiontypes";

const initialState = {
  USD: 0,
  BTC: 0,

  circulatingSupply: 0,
  USDpercentChange: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_INFO_DUMP:
      return {
        ...state,
        ...action.payload
      };
    case TYPE.USD_RATE:
      return {
        ...state,
        USD: action.payload
      };
      break;
    case TYPE.BTC_RATE:
      return {
        ...state,
        BTC: action.payload
      };
      break;
    case TYPE.CHANGE_24:
      return {
        ...state,
        USDpercentChange: action.payload
      };
      break;
    case TYPE.SET_SUPPLY:
      return {
        ...state,
        circulatingSupply: action.payload
      };
      break;
    default:
      return state;
  }
};
