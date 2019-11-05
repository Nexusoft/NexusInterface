/**
 * This state is is for Tritium transactions, state.transactions is for Legacy transactions
 */
import * as TYPE from 'consts/actionTypes';

const initialState = {
  map: {},
  loadedAll: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOAD_TRITIUM_TRANSACTIONS:
      return {
        ...state,
        map:
          action.payload.list &&
          action.payload.list.reduce((map, tx) => {
            map[tx.txid] = tx;
            return map;
          }, {}),
        loadedAll: true,
      };

    case TYPE.ADD_TRITIUM_TRANSACTIONS:
      return {
        ...state,
        map:
          action.payload.list &&
          action.payload.list.reduce(
            (map, tx) => {
              map[tx.txid] = tx;
              return map;
            },
            { ...state.map }
          ),
      };

    case TYPE.UPDATE_TRITIUM_TRANSACTION:
      return {
        ...state,
        map: {
          ...state.map,
          [action.payload.txid]: action.payload,
        },
      };

    case TYPE.CLEAR_CORE_INFO:
    case TYPE.CLEAR_USER_STATUS:
      return initialState;

    default:
      return state;
  }
};
