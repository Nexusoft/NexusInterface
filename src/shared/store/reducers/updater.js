import * as TYPE from 'consts/actionTypes';

const initialState = {
  state: 'idle',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_UPDATER_STATE:
      return {
        state: action.payload,
      };

    default:
      return state;
  }
};
