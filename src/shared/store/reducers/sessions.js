import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case '@@INIT':
      return (
        JSON.parse(window.sessionStorage.getItem('loggedInSessions')) || {}
      );
    case TYPE.LOGIN: {
      const { session, username } = action.payload;
      const newState = { ...state, [session]: { username } };
      window.sessionStorage.setItem(
        'loggedInSessions',
        JSON.stringify(newState)
      );
      return newState;
    }

    case TYPE.LOGOUT:
      window.sessionStorage.removeItem('loggedInSessions');
      return initialState;

    default:
      return state;
  }
};
