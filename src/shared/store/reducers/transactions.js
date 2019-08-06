import * as TYPE from 'consts/actionTypes';

const initialState = {
  map: null,
  lastTxtotal: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOAD_TRANSACTIONS:
      return {
        ...state,
        map:
          action.payload.list &&
          action.payload.list.reduce((map, tx) => {
            map[tx.txid] = tx;
            return map;
          }, {}),
        lastTxtotal: action.payload.txtotal,
      };

    case TYPE.ADD_TRANSACTIONS:
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
        lastTxtotal: action.payload.txtotal,
      };

    case TYPE.UPDATE_TRANSACTION:
      return {
        ...state,
        map: {
          ...state.map,
          [action.payload.txid]: action.payload,
        },
      };

    default:
      return state;
  }
};
