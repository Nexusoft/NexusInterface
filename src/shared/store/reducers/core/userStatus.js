import * as TYPE from 'consts/actionTypes';

const initialState = {
  username: null,
  userGenesis: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_USER_STATUS:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
    case TYPE.CLEAR_USER_STATUS:
      return initialState;

    case TYPE.SET_CURRENT_USER:
      return {
        ...state,
        username: action.payload.username,
        userGenesis: action.payload.genesis,
      };
    case TYPE.LOGOUT_USER:
      return {
        ...state,
        userGenesis: null,
      };
    default:
      return state;
  }
};
