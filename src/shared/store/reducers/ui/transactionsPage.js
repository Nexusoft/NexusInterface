import * as TYPE from 'consts/actionTypes';

const initialState = {
  filter: {
    accountQuery: '',
    tokenQuery: '',
    operation: null,
    timeSpan: null,
    page: 1,
  },
  lastPage: false,
  loading: false,
  transactions: [],
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_TRANSACTIONS_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };

    case TYPE.START_FETCHING_TXS:
      return {
        ...state,
        loading: true,
      };

    case TYPE.FETCH_TXS_RESULT:
      return {
        ...state,
        transactions: action.payload?.transactions,
        lastPage: action.payload?.lastPage,
        loading: false,
      };

    case TYPE.FETCH_TXS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};
