import * as TYPE from "../actions/actiontypes";

const initialState = {
  Address: "",
  Amount: 0,
  USDAmount: 0,
  Account: "",
  Message: "",
  Queue: {},
  AccountChanger: [],
  SelectedAccount: "",
  SendReceiveModalType: "",
  LookUpModalType: ""
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
    case TYPE.SHOW_MODAL2:
      return {
        ...state,
        open: true,
        SendReceiveModalType: action.payload
      };
    case TYPE.SHOW_MODAL4:
      return {
        ...state,
        open: true,
        LookUpModalType: action.payload
      };
      break;
    case TYPE.UPDATE_AMOUNT:
      return {
        ...state,
        Amount: action.payload.Amount,
        USDAmount: action.payload.USDAmount
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
    case TYPE.SELECTED_ACCOUNT:
      return {
        ...state,
        SelectedAccount: action.payload
      };
      break;
    case TYPE.CLEAR_QUEUE:
      return {
        ...state,
        Queue: {}
      };
      break;
    case TYPE.CHANGE_ACCOUNT:
      return {
        ...state,
        AccountChanger: action.payload
      };
      break;
    case TYPE.ADD_TO_QUEUE:
      return {
        ...state,
        Queue: {
          ...state.Queue,
          [action.payload.address]: action.payload.amount
        },
        Address: "",
        Amount: 0,
        Account: "",
        Message: "",
        USDAmount: 0
      };
      break;
    case TYPE.CLEAR_FORM:
      return {
        ...state,
        Address: "",
        Amount: 0,
        Account: "",
        Message: "",
        USDAmount: 0
      };
    default:
      return state;
  }
};
