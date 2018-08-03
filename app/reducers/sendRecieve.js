import * as TYPE from "../actions/actiontypes";

const initialState = {
  Address: "",
  Amount: 0,
  Account: "",
  Message: "",
  Queue: {}
};
export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_ADDRESS:
      return {
        ...state,
        Address: action.payload
      };
      break;
    case TYPE.REMOVE_FROM_QUEUE:
      let newQ = { ...state.Queue };
      delete newQ[action.payload];
      return {
        ...state,
        Queue: newQ
      };
      break;
    case TYPE.UPDATE_AMOUNT:
      return {
        ...state,
        Amount: action.payload
      };
      break;
    case TYPE.UPDATE_MESSAGE:
      return {
        ...state,
        Message: action.payload
      };
      break;
    case TYPE.UPDATE_ACCOUNT_NAME:
      return {
        ...state,
        Account: action.payload
      };
      break;
    case TYPE.ADD_TO_QUEUE:
      return {
        ...state,
        Queue: {
          ...state.Queue,
          [action.payload.address]: action.payload.amount
        }
      };
      break;
    default:
      return state;
  }
};
