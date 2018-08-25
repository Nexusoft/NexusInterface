import * as TYPE from "../actions/actiontypes";

const initialState = {
  loggedIn: false,
  googleanalytics: null,
  encrypted: false,
  busyFlag: false,
  open: false,
  openSecondModal: false
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
    case TYPE.SHOW_MODAL:
      return {
        ...state,
        open: true
      };
      break;
    case TYPE.HIDE_MODAL:
      return {
        ...state,
        open: false
      };
      break;
    case TYPE.SHOW_MODAL2:
      return {
        ...state,
        openSecondModal: true
      };
      break;
    case TYPE.HIDE_MODAL2:
      return {
        ...state,
        openSecondModal: false
      };
      break;

    default:
      return state;
  }
};
