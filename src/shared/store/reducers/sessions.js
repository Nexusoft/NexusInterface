import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_SESSIONS:
      return action.payload?.reduce((sessions, s) => {
        sessions[s.session] = s;
        return sessions;
      }, {});

    case TYPE.ACTIVE_USER:
      return action.payload.sessions;

    case TYPE.CLEAR_SESSIONS:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
