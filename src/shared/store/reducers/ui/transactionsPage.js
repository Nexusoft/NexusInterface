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
  status: 'notLoaded', // notLoaded | loading | loaded | error
  transactions: [],
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
        status: 'loading',
      };

    case TYPE.FETCH_TXS_RESULT:
      return {
        ...state,
        status: 'loaded',
        transactions: action.payload?.transactions,
        lastPage: action.payload?.lastPage,
      };

    case TYPE.FETCH_TXS_ERROR:
      return {
        ...state,
        status: 'error',
      };

    case TYPE.UPDATE_TRITIUM_TRANSACTION:
      if (status === 'loaded') {
        return {
          ...state,
          transactions: [action.payload, ...state.transactions],
        };
      } else {
        return state;
      }

    case TYPE.ADD_TRITIUM_TRANSACTIONS:
      if (status === 'loaded') {
        return {
          ...state,
          transactions: [...action.payload, ...state.transactions],
        };
      } else {
        return state;
      }

    case TYPE.DISCONNECT_CORE:
    case TYPE.SWITCH_USER:
    case TYPE.CLEAR_USER:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
