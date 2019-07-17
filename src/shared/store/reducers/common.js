import * as TYPE from 'consts/actionTypes';

const initialState = {
  highestPeerBlock: null,
  blockDate: null,
  rpcCallList: [],
  rawBTCvalues: [],
  rawNXSvalues: [],
  displayBTCvalues: [],
  displayNXSvalues: [],
  encryptionModalShown: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.BLOCK_DATE:
      return {
        ...state,
        blockDate: action.payload,
      };

    case TYPE.SET_HIGHEST_PEER_BLOCK:
      return {
        ...state,
        highestPeerBlock: action.payload,
      };

    case TYPE.ADD_RPC_CALL:
      let oldArray = state.rpcCallList;
      oldArray.push(action.payload);
      return {
        ...state,
        rpcCallList: oldArray,
      };

    case TYPE.SET_MKT_AVE_DATA:
      return {
        ...state,
        displayBTCvalues: action.payload.displayBTC,
        rawBTCvalues: action.payload.rawBTC,
        displayNXSvalues: action.payload.displayNXS,
        rawNXSvalues: action.payload.rawNXS,
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
