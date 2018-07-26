import * as TYPE from "../actions/actiontypes";

const initialState = {
  USD: 0,
  BTC: 0,
  experimentalOpen:true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_INFO_DUMP:
      return {
        ...state,
        ...action.payload
      };

    case TYPE.SET_EXPERIMENTAL_WARNING:
      return {
          ...state,
          experimentalOpen: action.payload
      };
      break;
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
    default:
      return state;
  }
};
