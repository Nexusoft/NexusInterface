import * as TYPE from 'consts/actionTypes';

const initialState = {
  blockDate: null,
  rpcCallList: [],
  encryptionModalShown: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_BLOCK_DATE:
      return {
        ...state,
        blockDate: action.payload,
      };

    case TYPE.ADD_RPC_CALL:
      let oldArray = state.rpcCallList;
      oldArray.push(action.payload);
      return {
        ...state,
        rpcCallList: oldArray,
      };

    case TYPE.SHOW_ENCRYPTION_MODAL:
      return {
        ...state,
        encryptionModalShown: true,
      };

    default:
      return state;
  }
};
