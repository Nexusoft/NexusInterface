import * as TYPE from 'actions/actiontypes';

const initialState = {
  Address: '',
  Amount: '',
  USDAmount: '',
  Account: '',
  Message: '',
  Queue: {},
  AccountChanger: [],
  SelectedAccount: '',
  SendReceiveModalType: '',
  LookUpModalType: '',
  moveModal: false,
  MoveToAccount: '',
  MoveFromAccount: '',
  moveUSDAmount: '',
  moveAmount: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.MOVE_TO_ACCOUNT:
      return {
        ...state,
        MoveToAccount: action.payload,
      };
      break;
    case TYPE.MOVE_FROM_ACCOUNT:
      return {
        ...state,
        MoveFromAccount: action.payload,
      };
      break;
    case TYPE.OPEN_MOVE_MODAL:
      return {
        ...state,
        moveModal: true,
      };
      break;
    case TYPE.CLOSE_MOVE_MODAL:
      return {
        ...state,
        moveModal: false,
        moveAmount: '',
        MoveFromAccount: '',
        MoveToAccount: '',
        moveUSDAmount: '',
      };
      break;
    case TYPE.UPDATE_ADDRESS:
      return {
        ...state,
        Address: action.payload,
      };
      break;
    case TYPE.REMOVE_FROM_QUEUE:
      let newQ = { ...state.Queue };
      delete newQ[action.payload];
      return {
        ...state,
        Queue: newQ,
      };
    case TYPE.SHOW_MODAL2:
      return {
        ...state,
        open: true,
        SendReceiveModalType: action.payload,
      };
    case TYPE.SHOW_MODAL4:
      return {
        ...state,
        open: true,
        LookUpModalType: action.payload,
      };
      break;
    case TYPE.UPDATE_MOVE_AMOUNT:
      return {
        ...state,
        moveAmount: action.payload.Amount,
        moveUSDAmount: action.payload.USDAmount,
      };
      break;
    case TYPE.UPDATE_AMOUNT:
      return {
        ...state,
        Amount: action.payload.Amount,
        USDAmount: action.payload.USDAmount,
      };
      break;
    case TYPE.UPDATE_MESSAGE:
      return {
        ...state,
        Message: action.payload,
      };
      break;
    case TYPE.UPDATE_ACCOUNT_NAME:
      return {
        ...state,
        Account: action.payload,
      };
      break;
    case TYPE.SELECTED_ACCOUNT:
      return {
        ...state,
        SelectedAccount: action.payload,
      };
      break;
    case TYPE.CLEAR_QUEUE:
      return {
        ...state,
        Queue: {},
      };
      break;
    case TYPE.CHANGE_ACCOUNT:
      return {
        ...state,
        AccountChanger: action.payload,
      };
      break;
    case TYPE.ADD_TO_QUEUE:
      return {
        ...state,
        Queue: {
          ...state.Queue,
          [action.payload.address]: action.payload.amount,
        },
        Address: '',
        Amount: '',
        Account: '',
        Message: '',
        USDAmount: '',
      };
      break;
    case TYPE.CLEAR_FORM:
      return {
        ...state,
        Address: '',
        Amount: '',
        Account: '',
        Message: '',
        USDAmount: '',
      };
    default:
      return state;
  }
};
