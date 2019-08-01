import * as TYPE from 'consts/actionTypes';

const initialState = {
  account: null,
  searchText: '',
  type: null,
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

    case TYPE.SET_TXS_SEARCH_TEXT:
      return {
        ...state,
        searchText: action.payload,
      };

    case TYPE.SET_TXS_TYPE_FILTER:
      return {
        ...state,
        type: action.payload,
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
