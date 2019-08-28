import * as TYPE from 'consts/actionTypes';

const initialState = {
  userGenesis: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_CURRENT_USER:
      return action.payload;
    case TYPE.SET_CURRENT_USER_GENESIS:
      return {
        ...state,
        userGenesis: action.payload,
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
