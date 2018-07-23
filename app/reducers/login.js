import * as TYPE from "../actions/actiontypes";

const initialState = {
  password: "",
  unlockUntillDate: "",
  busyFlag: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_DATE:
      return {
        ...state,
        unlockUntillDate: action.payload
      };
      break;
    case TYPE.SET_PASSWORD:
      return {
        ...state,
        password: action.payload
      };
      break;
    case TYPE.TOGGLE_BUSY_FLAG:
      return {
        ...state,
        busyFlag: !state.busyFlag
      };
      break;
    case TYPE.WIPE_LOGIN_INFO:
      return {
        ...state,
        unlockUntillDate: "",
        password: ""
      };
      break;
    default:
      return state;
  }
};
