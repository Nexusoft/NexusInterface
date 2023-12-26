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

    case TYPE.UPDATE_TRANSACTIONS:
      if (state.status === 'loaded' && action.payload?.length > 0) {
        const newTransactions = [...state.transactions];
        action.payload.forEach((tx) => {
          const index = newTransactions.findIndex((t) => t.txid === tx.txid);
          if (index >= 0) {
            newTransactions.splice(index, 1, tx);
          } else {
            newTransactions.unshift(tx);
          }
        });
        return {
          ...state,
          transactions: newTransactions,
        };
      }
      return state;

    case TYPE.DISCONNECT_CORE:
    case TYPE.ACTIVE_USER:
    case TYPE.CLEAR_USER:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
