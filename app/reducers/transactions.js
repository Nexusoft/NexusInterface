import * as TYPE from "../actions/actiontypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_WALL_TRANS:
        return{
            ...state,
            walletitems : action.payload
        }
    case TYPE.SET_TRANSACTION_SENDAGAIN:
    return{
        ...state,
        sendagain: action.payload
    }
    case TYPE.SET_TRANSACTION_EXPLOREINFO:
    return{
        ...state,
        exploreinfo: action.payload
    }
    default:
      return state;
  }
};
