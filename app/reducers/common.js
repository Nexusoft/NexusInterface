import * as TYPE from "../actions/actiontypes";

const initialState = {
  loggedIn: false,
  googleanalytics: null,
  encrypted: false,
  busyFlag: false,
  open: false,
  openSecondModal: false,
  openThirdModal: false,
  modaltype: "",
  confirmation: false,
  actionItem: ""
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOCK:
      return {
        ...state,
        loggedIn: false
      };
      break;
    case TYPE.TOGGLE_BUSY_FLAG:
      return {
        ...state,
        busyFlag: !state.busyFlag
      };
      break;
    case TYPE.UNLOCK:
      return {
        ...state,
        loggedIn: true
      };
      break;
    case TYPE.UNENCRYPTED:
      return {
        ...state,
        encrypted: false
      };

      break;
    case TYPE.ENCRYPTED:
      return {
        ...state,
        encrypted: true
      };
      break;

    case TYPE.SET_GOOGLEANALYTICS:
      return {
        ...state,
        googleanalytics: action.payload
      };
      break;

    case TYPE.CONFIRM:
      return {
        ...state,
        confirmation: action.payload
      };
      break;
    case TYPE.SHOW_MODAL:
      return {
        ...state,
        open: true,
        modaltype: action.payload
      };
      break;
    case TYPE.HIDE_MODAL:
      return {
        ...state,
        open: false,
        modaltype: action.payload
      };
      break;
    case TYPE.SHOW_MODAL2:
      return {
        ...state,
        openSecondModal: true,
        modaltype: action.payload
      };
      break;

    case TYPE.HIDE_MODAL2:
      return {
        ...state,
        openSecondModal: false,
        modaltype: action.payload
      };
      break;
    case TYPE.SHOW_MODAL3:
      return {
        ...state,
        openThirdModal: true,
        modaltype: action.payload
      };
      break;

    case TYPE.HIDE_MODAL3:
      return {
        ...state,
        openThirdModal: false,
        modaltype: action.payload
      };
      break;

    default:
      return state;
  }
};
