import * as TYPE from 'consts/actionTypes';

const initialState = {
  accountName: null,
  addressQuery: '',
  operation: null,
  timeSpan: null,
  page: 1,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_TXS_ACCOUNT_NAME_FILTER:
      return {
        ...state,
        accountName: action.payload,
      };

    case TYPE.SET_TXS_ADDRESS_QUERY:
      return {
        ...state,
        addressQuery: action.payload,
      };

    case TYPE.SET_TXS_OP_FILTER:
      return {
        ...state,
        category: action.payload,
      };

    case TYPE.SET_TXS_TIME_FILTER:
      return {
        ...state,
        timeSpan: action.payload,
      };

    case TYPE.SET_TXS_PAGE:
      return {
        ...state,
        page: action.payload,
      };

    default:
      return state;
  }
};
