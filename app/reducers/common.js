import * as TYPE from "../actions/actiontypes";

const initialState = {
  loggedIn: false,
  googleanalytics: null,
  encrypted: false,
  busyFlag: false
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

    default:
      return state;
  }
};
