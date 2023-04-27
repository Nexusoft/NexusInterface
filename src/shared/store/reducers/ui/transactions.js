/**
 * LEGACY TRANSACTIONS FILTER
 */

import * as TYPE from 'consts/actionTypes';

const initialState = {
  account: null,
  addressQuery: '',
  category: null,
  minAmount: 0,
  timeSpan: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_TXS_ACCOUNT_FILTER:
      return {
        ...state,
        account: action.payload,
      };

    case TYPE.SET_TXS_ADDRESS_QUERY:
      return {
        ...state,
        addressQuery: action.payload,
      };

    case TYPE.SET_TXS_CATEGORY_FILTER:
      return {
        ...state,
        category: action.payload,
      };

    case TYPE.SET_TXS_MIN_AMOUNT_FILTER:
      return {
        ...state,
        minAmount: action.payload,
      };

    case TYPE.SET_TXS_TIME_FILTER:
      return {
        ...state,
        timeSpan: action.payload,
      };

    default:
      return state;
  }
};
