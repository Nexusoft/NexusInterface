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

    case TYPE.SHOW_ENCRYPTION_MODAL:
      return {
        ...state,
        encryptionModalShown: true,
      };

    default:
      return state;
  }
};
