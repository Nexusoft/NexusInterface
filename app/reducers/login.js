import * as TYPE from "../actions/actiontypes";

const initialState = {
  unlockUntillDate: "",
  busyFlag: false,
  accoutName: "",
  privKey: "",
  address: "",
  stakingFlag: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_DATE:
      return {
        ...state,
        unlockUntillDate: action.payload
      };
      break;
    case TYPE.TOGGLE_BUSY_FLAG:
      return {
        ...state,
        busyFlag: !state.busyFlag
      };
      break;
    case TYPE.TOGGLE_STAKING_FLAG:
      return {
        ...state,
        stakingFlag: !state.stakingFlag
      };
      break;
    case TYPE.WIPE_LOGIN_INFO:
      return initialState;
      break;
    default:
      return state;
  }
};
