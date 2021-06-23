import * as TYPE from 'consts/actionTypes';

const initialState = null;
export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_MARKET_DATA:
      return {
        ...state,
        ...action.payload,
        marketCap: action.payload?.price * state?.supply || undefined,
      };

    case TYPE.SET_TOTAL_SUPPLY:
      return {
        ...state,
        supply: action.payload,
        marketCap: action.payload * state?.price || undefined,
      };

    default:
      return state;
  }
};
