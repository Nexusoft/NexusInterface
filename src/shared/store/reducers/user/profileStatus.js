import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_PROFILE_STATUS:
      return action.payload && {
        ...action.payload,
        recoveryPending: !!(state?.recoveryPending &&
          state.genesis === action.payload.genesis && !action.payload.recovery),
      };

    case TYPE.SET_RECOVERY_PENDING:
      return state?.genesis === action.payload && !state.recovery
        ? { ...state, recoveryPending: true }
        : state;

    case TYPE.ACTIVE_USER:
      return action.payload.profileStatus;

    case TYPE.DISCONNECT_CORE:
    case TYPE.CLEAR_USER:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
