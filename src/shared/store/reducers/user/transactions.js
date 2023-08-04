/**
 * This state is is for Tritium transactions, state.transactions is for Legacy transactions
 */
import * as TYPE from 'consts/actionTypes';

const initialState = {
  lastPage: false,
  status: 'notLoaded', // notLoaded | loading | loaded | error
  transactions: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
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

    case TYPE.UPDATE_TRITIUM_TRANSACTION: {
      if (state.status === 'loaded') {
        const index = state.transactions.findIndex(
          (tx) => tx.txid === action.payload.txid
        );
        if (index >= 0) {
          const newTransactions = [...state.transactions];
          newTransactions.splice(index, 1, action.payload);
          return {
            ...state,
            transactions: newTransactions,
          };
        }
      }
      break;
    }

    case TYPE.ADD_TRITIUM_TRANSACTIONS:
      if (state.status === 'loaded') {
        return {
          ...state,
          transactions: [...action.payload, ...state.transactions],
        };
      }
      break;

    case TYPE.DISCONNECT_CORE:
    case TYPE.ACTIVE_USER:
    case TYPE.CLEAR_USER:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
